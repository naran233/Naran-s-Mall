package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mall.admin.dto.UserVO;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.PageResult;
import com.mall.common.R;
import com.mall.mbg.entity.SysRole;
import com.mall.mbg.entity.SysUser;
import com.mall.mbg.entity.SysUserRole;
import com.mall.mbg.mapper.SysRoleMapper;
import com.mall.mbg.mapper.SysUserMapper;
import com.mall.mbg.mapper.SysUserRoleMapper;
import com.mall.security.AuthUtil;
import jakarta.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
public class SysUserController {

    @Resource
    private SysUserMapper sysUserMapper;
    @Resource
    private SysUserRoleMapper sysUserRoleMapper;
    @Resource
    private SysRoleMapper sysRoleMapper;
    @Resource
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public R<PageResult<UserVO>> list(@RequestParam(required = false) String keyword,
                                      @RequestParam(defaultValue = "1") long pageNum,
                                      @RequestParam(defaultValue = "10") long pageSize) {
        LambdaQueryWrapper<SysUser> w = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) {
            w.like(SysUser::getUsername, keyword).or().like(SysUser::getNickName, keyword);
        }
        w.orderByDesc(SysUser::getId);
        Page<SysUser> page = sysUserMapper.selectPage(new Page<>(pageNum, pageSize), w);
        List<UserVO> list = page.getRecords().stream().map(this::toVO).collect(Collectors.toList());
        return R.ok(PageResult.of(list, page.getTotal(), pageNum, pageSize));
    }

    @PostMapping
    public R<Void> create(@RequestBody SysUser req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            throw new BizException(Code.VALIDATE_FAILED, "用户名和密码必填");
        }
        Long c = sysUserMapper.selectCount(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, req.getUsername()));
        if (c > 0) throw new BizException(Code.BUSINESS_FAILED, "用户名已存在");
        SysUser u = new SysUser();
        u.setUsername(req.getUsername());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setNickName(req.getNickName());
        u.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        u.setCreateTime(LocalDateTime.now());
        sysUserMapper.insert(u);
        return R.ok("创建成功");
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody SysUser req) {
        SysUser u = sysUserMapper.selectById(id);
        if (u == null) throw new BizException(Code.BUSINESS_FAILED, "用户不存在");
        if (req.getNickName() != null) u.setNickName(req.getNickName());
        if (req.getStatus() != null) u.setStatus(req.getStatus());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        sysUserMapper.updateById(u);
        return R.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        sysUserMapper.deleteById(id);
        sysUserRoleMapper.delete(new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, id));
        return R.ok("删除成功");
    }

    @PostMapping("/{id}/roles")
    public R<Void> assignRoles(@PathVariable Long id, @RequestBody List<Long> roleIds) {
        sysUserRoleMapper.delete(new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, id));
        for (Long roleId : roleIds) {
            SysUserRole ur = new SysUserRole();
            ur.setUserId(id);
            ur.setRoleId(roleId);
            sysUserRoleMapper.insert(ur);
        }
        return R.ok("分配成功");
    }

    private UserVO toVO(SysUser u) {
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(u, vo);
        vo.setRoleIds(sysUserRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, u.getId()))
                .stream().map(SysUserRole::getRoleId).collect(Collectors.toList()));
        vo.setRoleNames(vo.getRoleIds().stream().map(rid -> {
            SysRole r = sysRoleMapper.selectById(rid);
            return r == null ? null : r.getName();
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList()));
        return vo;
    }
}
