package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("ums_member_level")
public class UmsMemberLevel {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Integer growthPoint;
    private BigDecimal discountRate;
    private String description;
    private Integer defaultStatus;
    private LocalDateTime createTime;
}
