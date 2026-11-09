package com.mall.portal.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderCreateReq {
    private List<Long> cartItemIds;       // 选中的购物车项
    private Long couponId;                // 会员已领取的券 (ums_member_coupon.id)，可空
    private String receiverName;
    private String receiverPhone;
    private String receiverProvince;
    private String receiverCity;
    private String receiverRegion;
    private String receiverDetailAddress;
    private String note;
}
