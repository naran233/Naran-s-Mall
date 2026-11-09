package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ums_member_coupon")
public class UmsMemberCoupon {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long memberId;
    private Long couponId;
    private String couponCode;
    private Integer useStatus;      // 0未用 1已用 2已过期
    private LocalDateTime getTime;
    private LocalDateTime useTime;
    private Long orderId;
}
