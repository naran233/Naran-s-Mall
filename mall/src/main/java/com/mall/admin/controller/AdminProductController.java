package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mall.admin.dto.ProductCreateReq;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.PageResult;
import com.mall.common.R;
import com.mall.mbg.entity.PmsProduct;
import com.mall.mbg.entity.PmsSkuStock;
import com.mall.mbg.mapper.PmsProductMapper;
import com.mall.mbg.mapper.PmsSkuStockMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    @Resource
    private PmsProductMapper productMapper;
    @Resource
    private PmsSkuStockMapper skuMapper;

    @GetMapping
    public R<PageResult<PmsProduct>> list(@RequestParam(required = false) String keyword,
                                          @RequestParam(required = false) Long categoryId,
                                          @RequestParam(defaultValue = "1") long pageNum,
                                          @RequestParam(defaultValue = "10") long pageSize) {
        LambdaQueryWrapper<PmsProduct> w = new LambdaQueryWrapper<>();
        w.eq(PmsProduct::getDeleteStatus, 0);
        if (keyword != null && !keyword.isBlank()) w.like(PmsProduct::getName, keyword);
        if (categoryId != null) w.eq(PmsProduct::getProductCategoryId, categoryId);
        w.orderByDesc(PmsProduct::getId);
        Page<PmsProduct> page = productMapper.selectPage(new Page<>(pageNum, pageSize), w);
        return R.ok(PageResult.of(page.getRecords(), page.getTotal(), pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public R<PmsProduct> detail(@PathVariable Long id) {
        return R.ok(productMapper.selectById(id));
    }

    @PostMapping
    public R<Void> create(@RequestBody ProductCreateReq req) {
        PmsProduct p = req.getProduct();
        if (p == null || p.getName() == null) throw new BizException(Code.VALIDATE_FAILED, "商品名称必填");
        if (p.getCreateTime() == null) p.setCreateTime(LocalDateTime.now());
        if (p.getDeleteStatus() == null) p.setDeleteStatus(0);
        if (p.getPublishStatus() == null) p.setPublishStatus(1);
        productMapper.insert(p);
        List<PmsSkuStock> skus = req.getSkus();
        if (skus == null || skus.isEmpty()) {
            PmsSkuStock sku = new PmsSkuStock();
            sku.setProductId(p.getId());
            sku.setSkuCode("SKU" + p.getId());
            sku.setPrice(p.getPrice());
            sku.setStock(p.getStock() == null ? 0 : p.getStock());
            sku.setLockStock(0);
            skuMapper.insert(sku);
        } else {
            for (PmsSkuStock s : skus) {
                s.setProductId(p.getId());
                skuMapper.insert(s);
            }
        }
        return R.ok("创建成功");
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody PmsProduct req) {
        req.setId(id);
        productMapper.updateById(req);
        return R.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        productMapper.deleteById(id);
        return R.ok("删除成功");
    }

    @PutMapping("/{id}/publish")
    public R<Void> publish(@PathVariable Long id, @RequestParam Integer publishStatus) {
        PmsProduct p = new PmsProduct();
        p.setId(id);
        p.setPublishStatus(publishStatus);
        productMapper.updateById(p);
        return R.ok("操作成功");
    }
}
