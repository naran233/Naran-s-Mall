package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sms_coupon_history")
public class SmsCouponHistory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long couponId;
    private Long memberId;
    private Integer useStatus;       // 0未使用 1已使用 2已过期
    private Integer getType;         // 0主动领取 1后台发放
    private LocalDateTime getTime;
    private LocalDateTime useTime;
    private Long orderId;
}
