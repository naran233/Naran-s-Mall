package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sms_home_advertise")
public class SmsHomeAdvertise {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Integer type;            // 轮播位置类型
    private String pic;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;          // 0未上线 1上线
    private String url;
    private Integer sort;
    private Integer clickCount;

    /** 关联商品 ID，用于首页轮播绑定商品（Vue/React 前台共用） */
    private Long productId;
}
