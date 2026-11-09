package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("pms_brand")
public class PmsBrand {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String logo;
    private String description;
    private Integer sort;
    private Integer showStatus;      // 1显示
}
