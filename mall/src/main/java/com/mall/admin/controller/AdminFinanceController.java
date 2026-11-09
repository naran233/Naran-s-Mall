package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.PageResult;
import com.mall.common.R;
import com.mall.mbg.entity.OmsPaymentRecord;
import com.mall.mbg.mapper.OmsPaymentRecordMapper;
import jakarta.annotation.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 财务管理（后台）：收款概览 / 流水明细 / 日汇总 / 退款登记
 */
@RestController
@RequestMapping("/api/admin/finance")
public class AdminFinanceController {

    @Resource
    private OmsPaymentRecordMapper recordMapper;
    @Resource
    private JdbcTemplate jdbc;

    @GetMapping("/overview")
    public R<Map<String, Object>> overview() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalIncome", jdbc.queryForObject(
                "SELECT COALESCE(SUM(amount),0) FROM oms_payment_record WHERE status=1", Object.class));
        data.put("todayIncome", jdbc.queryForObject(
                "SELECT COALESCE(SUM(amount),0) FROM oms_payment_record WHERE status=1 AND DATE(pay_time)=CURDATE()", Object.class));
        data.put("monthIncome", jdbc.queryForObject(
                "SELECT COALESCE(SUM(amount),0) FROM oms_payment_record WHERE status=1 AND DATE_FORMAT(pay_time,'%Y-%m')=DATE_FORMAT(CURDATE(),'%Y-%m')", Object.class));
        data.put("refundAmount", jdbc.queryForObject(
                "SELECT COALESCE(SUM(amount),0) FROM oms_payment_record WHERE status=2", Object.class));
        data.put("pendingAmount", jdbc.queryForObject(
                "SELECT COALESCE(SUM(pay_amount),0) FROM oms_order WHERE status=2", Object.class));
        data.put("recordCount", jdbc.queryForObject("SELECT COUNT(*) FROM oms_payment_record WHERE status=1", Integer.class));
        return R.ok(data);
    }

    @GetMapping("/records")
    public R<PageResult<Map<String, Object>>> records(@RequestParam(required = false) String keyword,
                                                      @RequestParam(required = false) Integer status,
                                                      @RequestParam(required = false) String startDate,
                                                      @RequestParam(required = false) String endDate,
                                                      @RequestParam(defaultValue = "1") long pageNum,
                                                      @RequestParam(defaultValue = "10") long pageSize) {
        LambdaQueryWrapper<OmsPaymentRecord> w = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) w.like(OmsPaymentRecord::getOrderSn, keyword);
        if (status != null) w.eq(OmsPaymentRecord::getStatus, status);
        if (startDate != null && !startDate.isBlank()) w.ge(OmsPaymentRecord::getPayTime, LocalDate.parse(startDate).atStartOfDay());
        if (endDate != null && !endDate.isBlank()) w.lt(OmsPaymentRecord::getPayTime, LocalDate.parse(endDate).plusDays(1).atStartOfDay());
        w.orderByDesc(OmsPaymentRecord::getId);
        Page<OmsPaymentRecord> page = recordMapper.selectPage(new Page<>(pageNum, pageSize), w);

        List<Map<String, Object>> rows = page.getRecords().stream().map(r -> {
            Map<String, Object> vo = new HashMap<>();
            vo.put("record", r);
            List<Map<String, Object>> ms = jdbc.queryForList(
                    "SELECT id, username, nickname FROM ums_member WHERE id = ?", r.getMemberId());
            vo.put("memberName", ms.isEmpty() ? "—" : (ms.get(0).get("nickname") == null
                    ? ms.get(0).get("username") : ms.get(0).get("nickname")));
            return vo;
        }).toList();
        return R.ok(PageResult.of(rows, page.getTotal(), pageNum, pageSize));
    }

    /** 近 N 天回款日汇总 */
    @GetMapping("/daily")
    public R<List<Map<String, Object>>> daily(@RequestParam(defaultValue = "30") int days) {
        int d = Math.min(Math.max(days, 7), 90);
        List<Map<String, Object>> rows = jdbc.queryForList("""
                SELECT DATE(pay_time) AS d, COALESCE(SUM(amount),0) AS amount, COUNT(*) AS cnt
                FROM oms_payment_record
                WHERE status = 1 AND pay_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY DATE(pay_time) ORDER BY d
                """, d);
        Map<String, Map<String, Object>> indexed = new HashMap<>();
        for (Map<String, Object> r : rows) indexed.put(String.valueOf(r.get("d")), r);
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = d - 1; i >= 0; i--) {
            String key = today.minusDays(i).toString();
            Map<String, Object> hit = indexed.get(key);
            Map<String, Object> item = new HashMap<>();
            item.put("date", key);
            item.put("amount", hit == null ? 0 : hit.get("amount"));
            item.put("count", hit == null ? 0 : hit.get("cnt"));
            result.add(item);
        }
        return R.ok(result);
    }

    /** 登记退款 */
    @PostMapping("/records/{id}/refund")
    public R<Void> refund(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        OmsPaymentRecord r = recordMapper.selectById(id);
        if (r == null) throw new BizException(Code.BUSINESS_FAILED, "流水不存在");
        if (r.getStatus() != null && r.getStatus() == 2) throw new BizException(Code.BUSINESS_FAILED, "该笔已退款");
        r.setStatus(2);
        r.setRemark(body == null || body.get("remark") == null ? "管理员登记退款" : body.get("remark"));
        recordMapper.updateById(r);
        // 同步写入一条退款流水，便于统计
        OmsPaymentRecord refund = new OmsPaymentRecord();
        refund.setOrderId(r.getOrderId());
        refund.setOrderSn(r.getOrderSn());
        refund.setMemberId(r.getMemberId());
        refund.setAmount(r.getAmount().negate());
        refund.setPayType(r.getPayType());
        refund.setStatus(2);
        refund.setRemark("退款冲正");
        refund.setPayTime(LocalDateTime.now());
        refund.setCreateTime(LocalDateTime.now());
        recordMapper.insert(refund);
        return R.ok("退款登记成功");
    }
}
