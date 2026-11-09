package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.PageResult;
import com.mall.common.R;
import com.mall.mbg.entity.OmsServiceTicket;
import com.mall.mbg.entity.UmsMember;
import com.mall.mbg.mapper.OmsServiceTicketMapper;
import com.mall.mbg.mapper.UmsMemberMapper;
import jakarta.annotation.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 客户服务（后台）：工单列表 / 回复 / 关闭 / 统计
 */
@RestController
@RequestMapping("/api/admin/tickets")
public class AdminTicketController {

    @Resource
    private OmsServiceTicketMapper ticketMapper;
    @Resource
    private UmsMemberMapper memberMapper;
    @Resource
    private JdbcTemplate jdbc;

    @GetMapping
    public R<PageResult<Map<String, Object>>> list(@RequestParam(required = false) Integer status,
                                                   @RequestParam(required = false) Integer type,
                                                   @RequestParam(required = false) String keyword,
                                                   @RequestParam(defaultValue = "1") long pageNum,
                                                   @RequestParam(defaultValue = "10") long pageSize) {
        LambdaQueryWrapper<OmsServiceTicket> w = new LambdaQueryWrapper<>();
        if (status != null) w.eq(OmsServiceTicket::getStatus, status);
        if (type != null) w.eq(OmsServiceTicket::getType, type);
        if (keyword != null && !keyword.isBlank()) {
            w.and(q -> q.like(OmsServiceTicket::getTitle, keyword)
                    .or().like(OmsServiceTicket::getTicketSn, keyword)
                    .or().like(OmsServiceTicket::getContent, keyword));
        }
        w.orderByDesc(OmsServiceTicket::getId);
        Page<OmsServiceTicket> page = ticketMapper.selectPage(new Page<>(pageNum, pageSize), w);

        List<Map<String, Object>> rows = page.getRecords().stream().map(t -> {
            Map<String, Object> vo = new HashMap<>();
            vo.put("ticket", t);
            UmsMember m = memberMapper.selectById(t.getMemberId());
            vo.put("memberName", m == null ? "—" : (m.getNickname() == null ? m.getUsername() : m.getNickname()));
            vo.put("memberPhone", m == null ? null : m.getPhone());
            return vo;
        }).toList();
        return R.ok(PageResult.of(rows, page.getTotal(), pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public R<Map<String, Object>> detail(@PathVariable Long id) {
        OmsServiceTicket t = ticketMapper.selectById(id);
        if (t == null) throw new BizException(Code.BUSINESS_FAILED, "工单不存在");
        UmsMember m = memberMapper.selectById(t.getMemberId());
        Map<String, Object> data = new HashMap<>();
        data.put("ticket", t);
        if (m != null) m.setPassword(null);
        data.put("member", m);
        return R.ok(data);
    }

    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        Map<String, Object> r = new HashMap<>();
        r.put("pending", countByStatus(0));
        r.put("processing", countByStatus(1));
        r.put("replied", countByStatus(2));
        r.put("closed", countByStatus(3));
        r.put("total", jdbc.queryForObject("SELECT COUNT(*) FROM oms_service_ticket", Integer.class));
        return R.ok(r);
    }

    @PostMapping("/{id}/reply")
    public R<Void> reply(@PathVariable Long id, @RequestBody Map<String, String> body) {
        OmsServiceTicket t = ticketMapper.selectById(id);
        if (t == null) throw new BizException(Code.BUSINESS_FAILED, "工单不存在");
        String content = body.get("replyContent");
        if (content == null || content.isBlank()) throw new BizException(Code.VALIDATE_FAILED, "请填写回复内容");
        t.setReplyContent(content);
        t.setReplyMan(body.getOrDefault("replyMan", "客服"));
        t.setReplyTime(LocalDateTime.now());
        t.setStatus(2);
        ticketMapper.updateById(t);
        return R.ok("回复成功");
    }

    @PutMapping("/{id}/status")
    public R<Void> changeStatus(@PathVariable Long id, @RequestParam Integer status) {
        OmsServiceTicket t = ticketMapper.selectById(id);
        if (t == null) throw new BizException(Code.BUSINESS_FAILED, "工单不存在");
        t.setStatus(status);
        ticketMapper.updateById(t);
        return R.ok("状态已更新");
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        ticketMapper.deleteById(id);
        return R.ok("删除成功");
    }

    private Integer countByStatus(int status) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM oms_service_ticket WHERE status = ?", Integer.class, status);
    }
}
