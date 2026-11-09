package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("cms_help_category")
public class CmsHelpCategory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String icon;
    private Integer sort;
    private Integer showStatus;
    private LocalDateTime createTime;
}
