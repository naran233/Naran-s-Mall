package com.mall.admin.dto;

import com.mall.mbg.entity.PmsProduct;
import com.mall.mbg.entity.PmsSkuStock;
import lombok.Data;

import java.util.List;

@Data
public class ProductCreateReq {
    private PmsProduct product;
    private List<PmsSkuStock> skus;
}
