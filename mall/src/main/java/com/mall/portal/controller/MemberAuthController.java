package com.mall.portal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.UmsMember;
import com.mall.mbg.mapper.UmsMemberMapper;
import com.mall.portal.dto.MemberLoginReq;
import com.mall.portal.dto.MemberLoginResp;
import com.mall.portal.dto.MemberRegisterReq;
import com.mall.security.JwtUtil;
import jakarta.annotation.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/portal/members")
public class MemberAuthController {

    @Resource
    private UmsMemberMapper umsMemberMapper;
    @Resource
    private PasswordEncoder passwordEncoder;
    @Resource
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public R<Void> register(@RequestBody MemberRegisterReq req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            throw new BizException(Code.VALIDATE_FAILED, "用户名或密码不能为空");
        }
        Long count = umsMemberMapper.selectCount(
                new LambdaQueryWrapper<UmsMember>().eq(UmsMember::getUsername, req.getUsername()));
        if (count > 0) {
            throw new BizException(Code.BUSINESS_FAILED, "用户名已存在");
        }
        UmsMember m = new UmsMember();
        m.setUsername(req.getUsername());
        m.setPassword(passwordEncoder.encode(req.getPassword()));
        m.setNickname(req.getNickname() == null ? req.getUsername() : req.getNickname());
        m.setPhone(req.getPhone());
        m.setStatus(1);
        m.setIntegration(0);
        m.setGrowth(0);
        m.setCreateTime(LocalDateTime.now());
        umsMemberMapper.insert(m);
        return R.ok("注册成功");
    }

    @PostMapping("/login")
    public R<MemberLoginResp> login(@RequestBody MemberLoginReq req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            throw new BizException(Code.VALIDATE_FAILED, "用户名或密码不能为空");
        }
        UmsMember m = umsMemberMapper.selectOne(
                new LambdaQueryWrapper<UmsMember>().eq(UmsMember::getUsername, req.getUsername()));
        if (m == null || !passwordEncoder.matches(req.getPassword(), m.getPassword())) {
            throw new BizException(Code.BUSINESS_FAILED, "用户名或密码错误");
        }
        if (m.getStatus() != null && m.getStatus() == 0) {
            throw new BizException(Code.FORBIDDEN, "账号已被禁用");
        }
        String token = jwtUtil.generateToken(m.getUsername(), m.getId(), "MEMBER", List.of("MEMBER"), false);
        MemberLoginResp resp = new MemberLoginResp();
        resp.setToken(token);
        resp.setMemberId(m.getId());
        resp.setUsername(m.getUsername());
        resp.setNickname(m.getNickname());
        return R.ok(resp);
    }
}
