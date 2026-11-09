package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("pms_product")
public class PmsProduct {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long brandId;
    private Long productCategoryId;
    private String name;
    private String pic;
    private String productSn;
    private BigDecimal price;
    private Integer sale;            // 销量
    private Integer stock;           // 库存
    private Integer lowStock;        // 库存预警值
    private Integer newStatus;       // 1新品
    private Integer recommandStatus; // 1推荐
    private Integer publishStatus;   // 1上架 0下架
    private Integer deleteStatus;    // 1删除
    private String description;
    private LocalDateTime createTime;
}
