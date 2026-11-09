package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.SysRole;
import com.mall.mbg.entity.SysRoleMenu;
import com.mall.mbg.entity.SysRoleResource;
import com.mall.mbg.mapper.SysRoleMapper;
import com.mall.mbg.mapper.SysRoleMenuMapper;
import com.mall.mbg.mapper.SysRoleResourceMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
public class SysRoleController {

    @Resource
    private SysRoleMapper sysRoleMapper;
    @Resource
    private SysRoleMenuMapper sysRoleMenuMapper;
    @Resource
    private SysRoleResourceMapper sysRoleResourceMapper;

    @GetMapping
    public R<List<SysRole>> list() {
        return R.ok(sysRoleMapper.selectList(new LambdaQueryWrapper<SysRole>().orderByDesc(SysRole::getId)));
    }

    @PostMapping
    public R<Void> create(@RequestBody SysRole req) {
        if (req.getName() == null) throw new BizException(Code.VALIDATE_FAILED, "角色名必填");
        SysRole r = new SysRole();
        r.setName(req.getName());
        r.setDescription(req.getDescription());
        r.setCreateTime(LocalDateTime.now());
        sysRoleMapper.insert(r);
        return R.ok("创建成功");
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody SysRole req) {
        SysRole r = sysRoleMapper.selectById(id);
        if (r == null) throw new BizException(Code.BUSINESS_FAILED, "角色不存在");
        if (req.getName() != null) r.setName(req.getName());
        if (req.getDescription() != null) r.setDescription(req.getDescription());
        sysRoleMapper.updateById(r);
        return R.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        sysRoleMapper.deleteById(id);
        sysRoleMenuMapper.delete(new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, id));
        sysRoleResourceMapper.delete(new LambdaQueryWrapper<SysRoleResource>().eq(SysRoleResource::getRoleId, id));
        return R.ok("删除成功");
    }

    @PostMapping("/{id}/menus")
    public R<Void> assignMenus(@PathVariable Long id, @RequestBody List<Long> menuIds) {
        sysRoleMenuMapper.delete(new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, id));
        for (Long mid : menuIds) {
            SysRoleMenu rm = new SysRoleMenu();
            rm.setRoleId(id);
            rm.setMenuId(mid);
            sysRoleMenuMapper.insert(rm);
        }
        return R.ok("菜单分配成功");
    }

    @PostMapping("/{id}/resources")
    public R<Void> assignResources(@PathVariable Long id, @RequestBody List<Long> resourceIds) {
        sysRoleResourceMapper.delete(new LambdaQueryWrapper<SysRoleResource>().eq(SysRoleResource::getRoleId, id));
        for (Long rid : resourceIds) {
            SysRoleResource rr = new SysRoleResource();
            rr.setRoleId(id);
            rr.setResourceId(rid);
            sysRoleResourceMapper.insert(rr);
        }
        return R.ok("资源分配成功");
    }
}
