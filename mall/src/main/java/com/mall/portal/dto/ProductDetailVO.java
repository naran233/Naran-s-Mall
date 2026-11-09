package com.mall.portal.dto;

import lombok.Data;

import com.mall.mbg.entity.PmsSkuStock;
import com.mall.mbg.entity.PmsProduct;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductDetailVO {
    private Long id;
    private String name;
    private String pic;
    private BigDecimal price;
    private Integer sale;
    private Integer stock;
    private String description;
    private String brandName;
    private String productCategoryName;
    private List<PmsSkuStock> skus;
}
