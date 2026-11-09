package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_menu")
public class SysMenu {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long parentId;
    private String title;          // 菜单名
    private String name;           // 路由名
    private String icon;
    private Integer sort;
    private Integer type;          // 0目录 1菜单 2按钮
    private Integer hidden;        // 0显示 1隐藏
    private LocalDateTime createTime;
}
