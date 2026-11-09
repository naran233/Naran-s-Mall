package com.mall.portal.controller;

import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.UmsMember;
import com.mall.mbg.mapper.UmsMemberMapper;
import com.mall.security.AuthUtil;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portal/members")
public class MemberProfileController {

    @Resource
    private UmsMemberMapper memberMapper;

    @GetMapping("/profile")
    public R<UmsMember> profile() {
        UmsMember m = memberMapper.selectById(AuthUtil.memberId());
        if (m == null) throw new BizException(Code.BUSINESS_FAILED, "会员不存在");
        m.setPassword(null);
        return R.ok(m);
    }

    @PutMapping("/profile")
    public R<Void> update(@RequestBody UmsMember req) {
        UmsMember m = memberMapper.selectById(AuthUtil.memberId());
        if (m == null) throw new BizException(Code.BUSINESS_FAILED, "会员不存在");
        if (req.getNickname() != null) m.setNickname(req.getNickname());
        if (req.getPhone() != null) m.setPhone(req.getPhone());
        if (req.getEmail() != null) m.setEmail(req.getEmail());
        memberMapper.updateById(m);
        return R.ok("更新成功");
    }
}
