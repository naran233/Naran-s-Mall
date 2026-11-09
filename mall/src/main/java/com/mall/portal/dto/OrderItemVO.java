package com.mall.portal.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemVO {
    private Long id;
    private Long productId;
    private String productName;
    private String productPic;
    private BigDecimal productPrice;
    private Integer productQuantity;
    private BigDecimal realAmount;
}
