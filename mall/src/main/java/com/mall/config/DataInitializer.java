package com.mall.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.mbg.entity.*;
import com.mall.mbg.mapper.*;
import jakarta.annotation.Resource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 应用启动时注入基础账号与 RBAC 数据。
 *
 * 全部逻辑均为「增量补齐」，可在任意数据状态下重复执行：
 * - 账号按 username 判断，不存在才创建；
 * - 菜单/资源按 name/url 判断，缺失则补齐，已存在则只修正父子关系；
 * - 角色授权逐条判断，缺失才插入。
 *
 * 执行顺序 @Order(2)：在 DbMigration 之后、种子数据（@Order(3)）之前，
 * 保证演示账号一定存在，且 DbMigration 新增的菜单能拿到 ADMIN 授权。
 *
 * 管理员: admin / 123456
 * 演示会员: demo / 123456
 */
@Component
@Order(2)
public class DataInitializer implements CommandLineRunner {

    @Resource
    private PasswordEncoder passwordEncoder;
    @Resource
    private SysUserMapper sysUserMapper;
    @Resource
    private SysRoleMapper sysRoleMapper;
    @Resource
    private SysUserRoleMapper sysUserRoleMapper;
    @Resource
    private SysMenuMapper sysMenuMapper;
    @Resource
    private SysRoleMenuMapper sysRoleMenuMapper;
    @Resource
    private SysResourceMapper sysResourceMapper;
    @Resource
    private SysRoleResourceMapper sysRoleResourceMapper;
    @Resource
    private UmsMemberMapper umsMemberMapper;

    /** {父菜单 name（null 表示一级）, 标题, name, 图标, 排序} */
    private static final Object[][] BASE_MENUS = {
            {null, "仪表盘", "dashboard", "Odometer", 1},
            {null, "商品管理", "product", "Goods", 2},
            {"product", "商品列表", "productList", "List", 1},
            {"product", "商品分类", "productCategory", "Menu", 2},
            {"product", "品牌管理", "brand", "Collection", 3},
            {null, "订单管理", "order", "List", 3},
            {"order", "订单列表", "orderList", "Tickets", 1},
            {null, "营销管理", "sms", "Present", 4},
            {"sms", "优惠券", "coupon", "Ticket", 1},
            {null, "权限管理", "ums", "Lock", 5},
            {"ums", "用户管理", "user", "User", 1},
            {"ums", "角色管理", "role", "UserFilled", 2},
            {"ums", "菜单管理", "menu", "Menu", 3},
            {"ums", "资源管理", "resource", "Files", 4}
    };

    /** {名称, URL} */
    private static final Object[][] BASE_RESOURCES = {
            {"商品查询", "/api/admin/products"},
            {"订单查询", "/api/admin/orders"},
            {"用户查询", "/api/admin/users"},
            {"角色查询", "/api/admin/roles"}
    };

    @Override
    public void run(String... args) {
        initAdmin();
        initDemoMember();
        initRbac();
    }

    private void initAdmin() {
        SysUser admin = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, "admin").last("LIMIT 1"));
        if (admin != null) return;

        admin = new SysUser();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("123456"));
        admin.setNickName("超级管理员");
        admin.setStatus(1);
        admin.setCreateTime(LocalDateTime.now());
        sysUserMapper.insert(admin);

        SysRole role = ensureRole("ADMIN", "超级管理员");
        SysUserRole ur = new SysUserRole();
        ur.setUserId(admin.getId());
        ur.setRoleId(role.getId());
        sysUserRoleMapper.insert(ur);
    }

    private void initDemoMember() {
        UmsMember exists = umsMemberMapper.selectOne(new LambdaQueryWrapper<UmsMember>()
                .eq(UmsMember::getUsername, "demo").last("LIMIT 1"));
        if (exists != null) return;

        UmsMember m = new UmsMember();
        m.setUsername("demo");
        m.setPassword(passwordEncoder.encode("123456"));
        m.setNickname("演示用户");
        m.setPhone("13800000000");
        m.setStatus(1);
        m.setIntegration(0);
        m.setGrowth(0);
        m.setCreateTime(LocalDateTime.now());
        umsMemberMapper.insert(m);
    }

    private void initRbac() {
        SysRole adminRole = ensureRole("ADMIN", "超级管理员");

        // 1. 菜单：按 name 补齐，已存在则只修正父级关系
        for (Object[] r : BASE_MENUS) {
            String parentName = (String) r[0];
            String name = (String) r[2];
            SysMenu menu = findMenuByName(name);
            if (menu == null) {
                menu = new SysMenu();
                menu.setParentId(0L);
                menu.setTitle((String) r[1]);
                menu.setName(name);
                menu.setIcon((String) r[3]);
                menu.setSort((Integer) r[4]);
                menu.setType(1);
                menu.setHidden(0);
                menu.setCreateTime(LocalDateTime.now());
                sysMenuMapper.insert(menu);
            }
            if (parentName != null) {
                SysMenu parent = findMenuByName(parentName);
                if (parent != null && !parent.getId().equals(menu.getParentId())) {
                    menu.setParentId(parent.getId());
                    sysMenuMapper.updateById(menu);
                }
            }
        }

        // 2. 管理员角色拥有全部菜单（含 DbMigration 新增的模块菜单）
        List<SysMenu> all = sysMenuMapper.selectList(null);
        for (SysMenu m : all) {
            Long linked = sysRoleMenuMapper.selectCount(new LambdaQueryWrapper<SysRoleMenu>()
                    .eq(SysRoleMenu::getRoleId, adminRole.getId())
                    .eq(SysRoleMenu::getMenuId, m.getId()));
            if (linked == null || linked == 0) {
                SysRoleMenu rm = new SysRoleMenu();
                rm.setRoleId(adminRole.getId());
                rm.setMenuId(m.getId());
                sysRoleMenuMapper.insert(rm);
            }
        }

        // 3. 资源：按 url 补齐并授权
        for (Object[] r : BASE_RESOURCES) {
            String url = (String) r[1];
            SysResource res = sysResourceMapper.selectOne(new LambdaQueryWrapper<SysResource>()
                    .eq(SysResource::getUrl, url).last("LIMIT 1"));
            if (res == null) {
                res = new SysResource();
                res.setName((String) r[0]);
                res.setUrl(url);
                res.setCategoryId(adminRole.getId());
                res.setCreateTime(LocalDateTime.now());
                sysResourceMapper.insert(res);
            }
            Long linked = sysRoleResourceMapper.selectCount(new LambdaQueryWrapper<SysRoleResource>()
                    .eq(SysRoleResource::getRoleId, adminRole.getId())
                    .eq(SysRoleResource::getResourceId, res.getId()));
            if (linked == null || linked == 0) {
                SysRoleResource rr = new SysRoleResource();
                rr.setRoleId(adminRole.getId());
                rr.setResourceId(res.getId());
                sysRoleResourceMapper.insert(rr);
            }
        }
    }

    private SysRole ensureRole(String name, String description) {
        SysRole role = sysRoleMapper.selectOne(new LambdaQueryWrapper<SysRole>()
                .eq(SysRole::getName, name).last("LIMIT 1"));
        if (role != null) return role;
        role = new SysRole();
        role.setName(name);
        role.setDescription(description);
        role.setCreateTime(LocalDateTime.now());
        sysRoleMapper.insert(role);
        return role;
    }

    private SysMenu findMenuByName(String name) {
        return sysMenuMapper.selectOne(new LambdaQueryWrapper<SysMenu>()
                .eq(SysMenu::getName, name).last("LIMIT 1"));
    }
}
