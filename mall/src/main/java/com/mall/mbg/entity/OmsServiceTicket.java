package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("oms_service_ticket")
public class OmsServiceTicket {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String ticketSn;
    private Long memberId;
    private Long orderId;
    private Integer type;        // 1咨询 2投诉 3退换货 4售后
    private String title;
    private String content;
    private String images;
    private Integer status;      // 0待处理 1处理中 2已回复 3已关闭
    private String replyContent;
    private String replyMan;
    private LocalDateTime replyTime;
    private LocalDateTime createTime;
}
