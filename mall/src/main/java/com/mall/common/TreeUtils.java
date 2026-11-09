package com.mall.common;

import com.mall.admin.dto.MenuNode;
import com.mall.mbg.entity.SysMenu;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TreeUtils {

    public static List<MenuNode> buildMenuTree(List<SysMenu> menus) {
        Map<Long, MenuNode> nodeMap = menus.stream().map(m -> {
            MenuNode n = new MenuNode();
            n.setId(m.getId());
            n.setParentId(m.getParentId());
            n.setTitle(m.getTitle());
            n.setName(m.getName());
            n.setIcon(m.getIcon());
            n.setSort(m.getSort());
            n.setType(m.getType());
            n.setHidden(m.getHidden());
            return n;
        }).collect(Collectors.toMap(MenuNode::getId, n -> n));

        List<MenuNode> roots = new ArrayList<>();
        for (MenuNode n : nodeMap.values()) {
            Long pid = n.getParentId() == null ? 0L : n.getParentId();
            if (pid == 0L) {
                roots.add(n);
            } else {
                MenuNode parent = nodeMap.get(pid);
                if (parent != null) {
                    if (parent.getChildren() == null) parent.setChildren(new ArrayList<>());
                    parent.getChildren().add(n);
                } else {
                    roots.add(n);
                }
            }
        }
        roots.sort((a, b) -> (a.getSort() == null ? 0 : a.getSort()) - (b.getSort() == null ? 0 : b.getSort()));
        return roots;
    }
}
