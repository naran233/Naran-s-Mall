package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("oms_order_operate_history")
public class OmsOrderOperateHistory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private String operateMan;
    private LocalDateTime createTime;
    private Integer orderStatus;
    private String note;
}
