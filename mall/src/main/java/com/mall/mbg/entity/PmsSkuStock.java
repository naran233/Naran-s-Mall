package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

@Data
@TableName("pms_sku_stock")
public class PmsSkuStock {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long productId;
    private String skuCode;
    private BigDecimal price;
    private Integer stock;
    private Integer lockStock;
    private String sp1;
    private String sp2;
    private String sp3;
    private String pic;
}
