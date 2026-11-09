package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.admin.dto.AdminLoginReq;
import com.mall.admin.dto.LoginResp;
import com.mall.admin.dto.MenuNode;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.common.TreeUtils;
import com.mall.mbg.entity.SysMenu;
import com.mall.mbg.entity.SysRole;
import com.mall.mbg.entity.SysRoleMenu;
import com.mall.mbg.entity.SysUser;
import com.mall.mbg.entity.SysUserRole;
import com.mall.mbg.mapper.SysMenuMapper;
import com.mall.mbg.mapper.SysRoleMapper;
import com.mall.mbg.mapper.SysRoleMenuMapper;
import com.mall.mbg.mapper.SysUserMapper;
import com.mall.mbg.mapper.SysUserRoleMapper;
import com.mall.security.JwtUtil;
import jakarta.annotation.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    @Resource
    private SysUserMapper sysUserMapper;
    @Resource
    private SysUserRoleMapper sysUserRoleMapper;
    @Resource
    private SysRoleMapper sysRoleMapper;
    @Resource
    private SysRoleMenuMapper sysRoleMenuMapper;
    @Resource
    private SysMenuMapper sysMenuMapper;
    @Resource
    private PasswordEncoder passwordEncoder;
    @Resource
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public R<LoginResp> login(@RequestBody AdminLoginReq req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            throw new BizException(Code.VALIDATE_FAILED, "用户名或密码不能为空");
        }
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, req.getUsername()));
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BizException(Code.BUSINESS_FAILED, "用户名或密码错误");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BizException(Code.FORBIDDEN, "账号已被禁用");
        }
        // 角色
        List<SysUserRole> userRoles = sysUserRoleMapper.selectList(
                new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, user.getId()));
        List<String> roleNames = userRoles.stream().map(ur -> {
            SysRole r = sysRoleMapper.selectById(ur.getRoleId());
            return r == null ? null : r.getName();
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
        // 菜单
        List<Long> roleIds = userRoles.stream().map(SysUserRole::getRoleId).collect(Collectors.toList());
        List<Long> menuIds = sysRoleMenuMapper.selectList(
                        new LambdaQueryWrapper<SysRoleMenu>().in(SysRoleMenu::getRoleId, roleIds))
                .stream().map(SysRoleMenu::getMenuId).distinct().collect(Collectors.toList());
        List<SysMenu> menus = sysMenuMapper.selectList(
                new LambdaQueryWrapper<SysMenu>().in(SysMenu::getId, menuIds));
        List<MenuNode> menuTree = TreeUtils.buildMenuTree(menus);

        String token = jwtUtil.generateToken(user.getUsername(), user.getId(), "ADMIN", roleNames, true);
        LoginResp resp = new LoginResp();
        resp.setToken(token);
        resp.setUsername(user.getUsername());
        resp.setNickName(user.getNickName());
        resp.setRoles(roleNames);
        resp.setMenus(menuTree);
        return R.ok(resp);
    }
}
