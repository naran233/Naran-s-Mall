package com.mall.portal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.UmsMemberReceiveAddress;
import com.mall.mbg.mapper.UmsMemberReceiveAddressMapper;
import com.mall.security.AuthUtil;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/portal/addresses")
public class AddressController {

    @Resource
    private UmsMemberReceiveAddressMapper addressMapper;

    @GetMapping
    public R<List<UmsMemberReceiveAddress>> list() {
        return R.ok(addressMapper.selectList(new LambdaQueryWrapper<UmsMemberReceiveAddress>()
                .eq(UmsMemberReceiveAddress::getMemberId, AuthUtil.memberId())
                .orderByDesc(UmsMemberReceiveAddress::getDefaultStatus)
                .orderByDesc(UmsMemberReceiveAddress::getId)));
    }

    @PostMapping
    public R<Void> create(@RequestBody UmsMemberReceiveAddress req) {
        if (req.getName() == null || req.getPhoneNumber() == null) {
            throw new BizException(Code.VALIDATE_FAILED, "收货人和电话必填");
        }
        req.setId(null);
        req.setMemberId(AuthUtil.memberId());
        if (req.getDefaultStatus() == null) req.setDefaultStatus(0);
        req.setCreateTime(LocalDateTime.now());
        if (req.getDefaultStatus() == 1) clearDefault();
        addressMapper.insert(req);
        return R.ok("新增成功");
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody UmsMemberReceiveAddress req) {
        UmsMemberReceiveAddress a = addressMapper.selectById(id);
        if (a == null || !a.getMemberId().equals(AuthUtil.memberId())) {
            throw new BizException(Code.BUSINESS_FAILED, "地址不存在");
        }
        req.setId(id);
        req.setMemberId(a.getMemberId());
        if (req.getDefaultStatus() != null && req.getDefaultStatus() == 1) clearDefault();
        addressMapper.updateById(req);
        return R.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        UmsMemberReceiveAddress a = addressMapper.selectById(id);
        if (a == null || !a.getMemberId().equals(AuthUtil.memberId())) {
            throw new BizException(Code.BUSINESS_FAILED, "地址不存在");
        }
        addressMapper.deleteById(id);
        return R.ok("删除成功");
    }

    private void clearDefault() {
        List<UmsMemberReceiveAddress> list = addressMapper.selectList(new LambdaQueryWrapper<UmsMemberReceiveAddress>()
                .eq(UmsMemberReceiveAddress::getMemberId, AuthUtil.memberId())
                .eq(UmsMemberReceiveAddress::getDefaultStatus, 1));
        for (UmsMemberReceiveAddress a : list) {
            a.setDefaultStatus(0);
            addressMapper.updateById(a);
        }
    }
}
