package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.SysResource;
import com.mall.mbg.mapper.SysResourceMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/resources")
public class SysResourceController {

    @Resource
    private SysResourceMapper sysResourceMapper;

    @GetMapping
    public R<List<SysResource>> list() {
        return R.ok(sysResourceMapper.selectList(new LambdaQueryWrapper<SysResource>().orderByDesc(SysResource::getId)));
    }

    @PostMapping
    public R<Void> create(@RequestBody SysResource req) {
        if (req.getName() == null) throw new BizException(Code.VALIDATE_FAILED, "资源名必填");
        req.setCreateTime(LocalDateTime.now());
        sysResourceMapper.insert(req);
        return R.ok("创建成功");
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody SysResource req) {
        SysResource r = sysResourceMapper.selectById(id);
        if (r == null) throw new BizException(Code.BUSINESS_FAILED, "资源不存在");
        if (req.getName() != null) r.setName(req.getName());
        if (req.getUrl() != null) r.setUrl(req.getUrl());
        if (req.getCategoryId() != null) r.setCategoryId(req.getCategoryId());
        sysResourceMapper.updateById(r);
        return R.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        sysResourceMapper.deleteById(id);
        return R.ok("删除成功");
    }
}
