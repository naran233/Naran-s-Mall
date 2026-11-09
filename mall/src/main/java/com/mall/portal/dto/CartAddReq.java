package com.mall.portal.dto;

import lombok.Data;

@Data
public class CartAddReq {
    private Long productId;
    private Long productSkuId;
    private Integer quantity;
}
