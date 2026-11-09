package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ums_member")
public class UmsMember {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String nickname;
    private String phone;
    private String email;
    private String icon;
    private Integer gender;
    private LocalDateTime birthday;
    private String city;
    private Integer status;        // 1正常 0禁用
    private Integer integration;   // 积分
    private Integer growth;        // 成长值
    private LocalDateTime createTime;
}
