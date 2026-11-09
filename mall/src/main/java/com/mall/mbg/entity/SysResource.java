package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_resource")
public class SysResource {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String url;
    private Long categoryId;
    private LocalDateTime createTime;
}
