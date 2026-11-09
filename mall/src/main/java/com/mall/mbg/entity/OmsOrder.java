package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("oms_order")
public class OmsOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderSn;
    private Long memberId;
    private Long couponId;
    private BigDecimal totalAmount;     // 商品总额
    private BigDecimal couponAmount;    // 优惠金额
    private BigDecimal payAmount;       // 实付金额
    private Integer payType;            // 0模拟支付
    private Integer status;             // 0创建 1确认 2待支付 3支付成功(待发货) 4已发货 5已取消
    private String receiverName;
    private String receiverPhone;
    private String receiverProvince;
    private String receiverCity;
    private String receiverRegion;
    private String receiverDetailAddress;
    private String note;
    private LocalDateTime createTime;
    private LocalDateTime confirmTime;
    private LocalDateTime paymentTime;
    private String deliveryCompany;     // 物流公司
    private String deliverySn;          // 物流单号
    private LocalDateTime deliveryTime; // 发货时间
}
