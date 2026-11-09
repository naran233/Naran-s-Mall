package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("pms_product_attribute")
public class PmsProductAttribute {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long productAttributeCategoryId;
    private String name;
    private Integer type;            // 0规格 1参数
    private Integer inputType;       // 0手工 1从列表 2多选
    private String valueSelect;      // 可选值列表(逗号分隔)
}
