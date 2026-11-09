package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.PageResult;
import com.mall.common.R;
import com.mall.mbg.entity.UmsMember;
import com.mall.mbg.entity.UmsMemberLevel;
import com.mall.mbg.mapper.UmsMemberLevelMapper;
import com.mall.mbg.mapper.UmsMemberMapper;
import jakarta.annotation.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 会员中心（后台）：会员列表 / 详情 / 启禁用 / 等级管理
 */
@RestController
@RequestMapping("/api/admin")
public class AdminMemberController {

    @Resource
    private UmsMemberMapper memberMapper;
    @Resource
    private UmsMemberLevelMapper levelMapper;
    @Resource
    private JdbcTemplate jdbc;

    @GetMapping("/members")
    public R<PageResult<Map<String, Object>>> list(@RequestParam(required = false) String keyword,
                                                   @RequestParam(required = false) Integer status,
                                                   @RequestParam(defaultValue = "1") long pageNum,
                                                   @RequestParam(defaultValue = "10") long pageSize) {
        LambdaQueryWrapper<UmsMember> w = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) {
            w.and(q -> q.like(UmsMember::getUsername, keyword)
                    .or().like(UmsMember::getNickname, keyword)
                    .or().like(UmsMember::getPhone, keyword));
        }
        if (status != null) w.eq(UmsMember::getStatus, status);
        w.orderByDesc(UmsMember::getId);
        Page<UmsMember> page = memberMapper.selectPage(new Page<>(pageNum, pageSize), w);

        List<UmsMemberLevel> levels = levelMapper.selectList(new LambdaQueryWrapper<UmsMemberLevel>()
                .orderByAsc(UmsMemberLevel::getGrowthPoint));
        List<Map<String, Object>> rows = page.getRecords().stream().map(m -> {
            Map<String, Object> vo = new HashMap<>();
            vo.put("id", m.getId());
            vo.put("username", m.getUsername());
            vo.put("nickname", m.getNickname());
            vo.put("phone", m.getPhone());
            vo.put("email", m.getEmail());
            vo.put("city", m.getCity());
            vo.put("status", m.getStatus());
            vo.put("integration", m.getIntegration());
            vo.put("growth", m.getGrowth());
            vo.put("createTime", m.getCreateTime());
            vo.put("levelName", levelName(levels, m.getGrowth()));
            Map<String, Object> stat = orderStat(m.getId());
            vo.putAll(stat);
            return vo;
        }).toList();
        return R.ok(PageResult.of(rows, page.getTotal(), pageNum, pageSize));
    }

    @GetMapping("/members/{id}")
    public R<Map<String, Object>> detail(@PathVariable Long id) {
        UmsMember m = memberMapper.selectById(id);
        if (m == null) throw new BizException(Code.BUSINESS_FAILED, "会员不存在");
        m.setPassword(null);
        Map<String, Object> data = new HashMap<>();
        data.put("member", m);
        data.putAll(orderStat(id));
        data.put("recentOrders", jdbc.queryForList("""
                SELECT id, order_sn AS orderSn, pay_amount AS payAmount, status, create_time AS createTime
                FROM oms_order WHERE member_id = ? ORDER BY id DESC LIMIT 5
                """, id));
        return R.ok(data);
    }

    @PutMapping("/members/{id}/status")
    public R<Void> changeStatus(@PathVariable Long id, @RequestParam Integer status) {
        UmsMember m = memberMapper.selectById(id);
        if (m == null) throw new BizException(Code.BUSINESS_FAILED, "会员不存在");
        m.setStatus(status);
        memberMapper.updateById(m);
        return R.ok(status == 1 ? "已启用" : "已禁用");
    }

    @PutMapping("/members/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        UmsMember m = memberMapper.selectById(id);
        if (m == null) throw new BizException(Code.BUSINESS_FAILED, "会员不存在");
        if (body.get("nickname") != null) m.setNickname(String.valueOf(body.get("nickname")));
        if (body.get("phone") != null) m.setPhone(String.valueOf(body.get("phone")));
        if (body.get("email") != null) m.setEmail(String.valueOf(body.get("email")));
        if (body.get("city") != null) m.setCity(String.valueOf(body.get("city")));
        if (body.get("integration") != null) m.setIntegration(Integer.parseInt(String.valueOf(body.get("integration"))));
        if (body.get("growth") != null) m.setGrowth(Integer.parseInt(String.valueOf(body.get("growth"))));
        memberMapper.updateById(m);
        return R.ok("保存成功");
    }

    // ---------------- 会员等级 ----------------
    @GetMapping("/memberLevels")
    public R<List<UmsMemberLevel>> levels() {
        return R.ok(levelMapper.selectList(new LambdaQueryWrapper<UmsMemberLevel>().orderByAsc(UmsMemberLevel::getGrowthPoint)));
    }

    @PostMapping("/memberLevels")
    public R<Void> createLevel(@RequestBody UmsMemberLevel level) {
        level.setId(null);
        if (level.getCreateTime() == null) level.setCreateTime(LocalDateTime.now());
        levelMapper.insert(level);
        return R.ok("新增成功");
    }

    @PutMapping("/memberLevels/{id}")
    public R<Void> updateLevel(@PathVariable Long id, @RequestBody UmsMemberLevel level) {
        level.setId(id);
        levelMapper.updateById(level);
        return R.ok("保存成功");
    }

    @DeleteMapping("/memberLevels/{id}")
    public R<Void> deleteLevel(@PathVariable Long id) {
        levelMapper.deleteById(id);
        return R.ok("删除成功");
    }

    // ---------------- helpers ----------------
    private String levelName(List<UmsMemberLevel> levels, Integer growth) {
        int g = growth == null ? 0 : growth;
        String name = "普通会员";
        for (UmsMemberLevel l : levels) {
            if (g >= (l.getGrowthPoint() == null ? 0 : l.getGrowthPoint())) name = l.getName();
        }
        return name;
    }

    private Map<String, Object> orderStat(Long memberId) {
        Map<String, Object> m = jdbc.queryForMap("""
                SELECT COUNT(*) AS orderCount,
                       COALESCE(SUM(CASE WHEN status IN (3,4) THEN pay_amount ELSE 0 END), 0) AS totalPay
                FROM oms_order WHERE member_id = ?
                """, memberId);
        Map<String, Object> r = new HashMap<>();
        r.put("orderCount", m.get("orderCount"));
        r.put("totalPay", m.get("totalPay"));
        return r;
    }
}
