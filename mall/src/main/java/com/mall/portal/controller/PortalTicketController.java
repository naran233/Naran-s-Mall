package com.mall.portal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.OmsServiceTicket;
import com.mall.mbg.mapper.OmsServiceTicketMapper;
import com.mall.security.AuthUtil;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 客户服务（前台）：提交工单 / 我的工单
 */
@RestController
@RequestMapping("/api/portal/tickets")
public class PortalTicketController {

    @Resource
    private OmsServiceTicketMapper ticketMapper;

    @PostMapping
    public R<Long> create(@RequestBody Map<String, String> body) {
        String title = body.get("title");
        String content = body.get("content");
        if (title == null || title.isBlank()) throw new BizException(Code.VALIDATE_FAILED, "请填写问题标题");
        if (content == null || content.isBlank()) throw new BizException(Code.VALIDATE_FAILED, "请填写问题描述");

        OmsServiceTicket t = new OmsServiceTicket();
        t.setTicketSn("TK" + System.currentTimeMillis());
        t.setMemberId(AuthUtil.memberId());
        String orderId = body.get("orderId");
        if (orderId != null && !orderId.isBlank()) {
            try { t.setOrderId(Long.parseLong(orderId)); } catch (NumberFormatException ignored) { }
        }
        t.setType(parseInt(body.get("type"), 1));
        t.setTitle(title);
        t.setContent(content);
        t.setImages(body.get("images"));
        t.setStatus(0);
        t.setCreateTime(LocalDateTime.now());
        ticketMapper.insert(t);
        return R.ok(t.getId());
    }

    @GetMapping
    public R<List<OmsServiceTicket>> myTickets() {
        return R.ok(ticketMapper.selectList(new LambdaQueryWrapper<OmsServiceTicket>()
                .eq(OmsServiceTicket::getMemberId, AuthUtil.memberId())
                .orderByDesc(OmsServiceTicket::getId)));
    }

    @GetMapping("/{id}")
    public R<OmsServiceTicket> detail(@PathVariable Long id) {
        OmsServiceTicket t = ticketMapper.selectById(id);
        if (t == null || !t.getMemberId().equals(AuthUtil.memberId())) {
            throw new BizException(Code.FORBIDDEN, "无权查看该工单");
        }
        return R.ok(t);
    }

    private Integer parseInt(String s, int def) {
        try { return s == null ? def : Integer.parseInt(s); } catch (NumberFormatException e) { return def; }
    }
}
