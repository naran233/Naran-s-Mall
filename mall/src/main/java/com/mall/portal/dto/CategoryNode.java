package com.mall.portal.dto;

import lombok.Data;

import java.util.List;

@Data
public class CategoryNode {
    private Long id;
    private Long parentId;
    private String name;
    private Integer level;
    private Integer sort;
    private String icon;
    private List<CategoryNode> children;
}
