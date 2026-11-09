package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

@Data
@TableName("oms_order_item")
public class OmsOrderItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private Long productId;
    private Long productSkuId;
    private String productName;
    private String productPic;
    private BigDecimal productPrice;
    private Integer productQuantity;
    private Long productCategoryId;
    private String productSn;
    private String productSkuCode;
    private BigDecimal realAmount;       // 该商品实付小计
}
