package com.mall.mbg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("sms_home_recommend_product")
public class SmsHomeRecommendProduct {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long productId;
    private String productName;
    private String productPic;
    private Integer recommendStatus;     // 0不推荐 1推荐
    private Integer sort;
}
