package com.mall.portal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 首页轮播位视图对象。
 * 在原 sms_home_advertise 字段基础上，补充轮播位关联的商品摘要，
 * 供前台直接渲染「轮播图 + 商品名/价格」并跳转商品详情。
 */
@Data
public class HomeBannerVO {

    private Long id;
    private String name;
    private Integer type;
    private String pic;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;
    private String url;
    private Integer sort;
    private Integer clickCount;

    /** 关联商品 ID（sms_home_advertise.product_id） */
    private Long productId;

    /** 关联商品摘要，未绑定商品时为 null */
    private Product product;

    @Data
    public static class Product {
        private Long id;
        private String name;
        private BigDecimal price;
        private String pic;
        private Integer sale;
    }
}
