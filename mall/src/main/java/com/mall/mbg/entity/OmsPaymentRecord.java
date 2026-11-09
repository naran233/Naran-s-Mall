package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("oms_payment_record")
public class OmsPaymentRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private String orderSn;
    private Long memberId;
    private BigDecimal amount;
    private Integer payType;
    private Integer status;      // 0待收款 1已收款 2已退款
    private String remark;
    private LocalDateTime payTime;
    private LocalDateTime createTime;
}
