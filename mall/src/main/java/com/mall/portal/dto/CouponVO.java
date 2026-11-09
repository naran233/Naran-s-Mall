package com.mall.portal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponVO {
    private Long memberCouponId;     // ums_member_coupon.id
    private Long couponId;
    private String name;
    private Integer type;            // 0满减 1折扣
    private BigDecimal amount;
    private BigDecimal minPoint;
    private Integer useStatus;       // 0未用 1已用 2已过期
    private LocalDateTime getTime;
}
