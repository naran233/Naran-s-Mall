package com.mall.portal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderVO {
    private Long id;
    private String orderSn;
    private Integer status;
    private BigDecimal totalAmount;
    private BigDecimal couponAmount;
    private BigDecimal payAmount;
    private Integer payType;
    private String receiverName;
    private String receiverPhone;
    private String receiverDetailAddress;
    private String note;
    private String couponName;
    private LocalDateTime createTime;
    private LocalDateTime confirmTime;
    private LocalDateTime paymentTime;
    private String deliveryCompany;
    private String deliverySn;
    private LocalDateTime deliveryTime;
    private List<OrderItemVO> items;
}
