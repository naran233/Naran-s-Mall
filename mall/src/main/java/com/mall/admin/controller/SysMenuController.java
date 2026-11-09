package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.admin.dto.MenuNode;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.common.TreeUtils;
import com.mall.mbg.entity.SysMenu;
import com.mall.mbg.mapper.SysMenuMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/menus")
public class SysMenuController {

    @Resource
    private SysMenuMapper sysMenuMapper;

    @GetMapping("/tree")
    public R<List<MenuNode>> tree() {
        List<SysMenu> all = sysMenuMapper.selectList(new LambdaQueryWrapper<SysMenu>().orderByAsc(SysMenu::getSort));
        return R.ok(TreeUtils.buildMenuTree(all));
    }

    @GetMapping
    public R<List<SysMenu>> list() {
        return R.ok(sysMenuMapper.selectList(new LambdaQueryWrapper<SysMenu>().orderByAsc(SysMenu::getSort)));
    }

    @PostMapping
    public R<Void> create(@RequestBody SysMenu req) {
        if (req.getTitle() == null) throw new BizException(Code.VALIDATE_FAILED, "菜单名必填");
        if (req.getParentId() == null) req.setParentId(0L);
        req.setCreateTime(LocalDateTime.now());
        sysMenuMapper.insert(req);
        return R.ok("创建成功");
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody SysMenu req) {
        SysMenu m = sysMenuMapper.selectById(id);
        if (m == null) throw new BizException(Code.BUSINESS_FAILED, "菜单不存在");
        if (req.getTitle() != null) m.setTitle(req.getTitle());
        if (req.getName() != null) m.setName(req.getName());
        if (req.getIcon() != null) m.setIcon(req.getIcon());
        if (req.getParentId() != null) m.setParentId(req.getParentId());
        if (req.getSort() != null) m.setSort(req.getSort());
        if (req.getType() != null) m.setType(req.getType());
        if (req.getHidden() != null) m.setHidden(req.getHidden());
        sysMenuMapper.updateById(m);
        return R.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        sysMenuMapper.delete(new LambdaQueryWrapper<SysMenu>().eq(SysMenu::getParentId, id));
        sysMenuMapper.deleteById(id);
        return R.ok("删除成功");
    }
}
