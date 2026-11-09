package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("sms_coupon")
public class SmsCoupon {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Integer type;            // 0满减 1折扣
    private BigDecimal amount;       // 满减:减额(元) 折扣:折扣率(0.8=8折)
    private BigDecimal minPoint;     // 满减门槛/折扣最低消费(元)
    private Integer perLimit;        // 每人限领
    private Integer useCount;        // 已使用量
    private Integer receiveCount;    // 已领取量
    private Integer publishCount;    // 发行量
    private LocalDateTime enableStartTime;
    private LocalDateTime enableEndTime;
    private String note;
    private LocalDateTime createTime;
}
