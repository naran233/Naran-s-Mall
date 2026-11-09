package com.mall.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class MenuNode {
    private Long id;
    private Long parentId;
    private String title;
    private String name;
    private String icon;
    private Integer sort;
    private Integer type;
    private Integer hidden;
    private List<MenuNode> children;
}
