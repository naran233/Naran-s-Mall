package com.mall.portal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.OmsCartItem;
import com.mall.mbg.entity.PmsProduct;
import com.mall.mbg.entity.PmsSkuStock;
import com.mall.mbg.mapper.OmsCartItemMapper;
import com.mall.mbg.mapper.PmsProductMapper;
import com.mall.mbg.mapper.PmsSkuStockMapper;
import com.mall.portal.dto.CartAddReq;
import com.mall.security.AuthUtil;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/portal/cart")
public class CartController {

    @Resource
    private OmsCartItemMapper cartMapper;
    @Resource
    private PmsProductMapper productMapper;
    @Resource
    private PmsSkuStockMapper skuMapper;

    @PostMapping
    public R<Void> add(@RequestBody CartAddReq req) {
        Long memberId = AuthUtil.memberId();
        if (req.getProductId() == null) throw new BizException(Code.VALIDATE_FAILED, "商品不能为空");
        PmsProduct product = productMapper.selectById(req.getProductId());
        if (product == null || product.getDeleteStatus() == 1) throw new BizException(Code.BUSINESS_FAILED, "商品不存在");
        Long skuId = req.getProductSkuId();
        PmsSkuStock sku = skuId == null ? skuMapper.selectOne(
                new LambdaQueryWrapper<PmsSkuStock>().eq(PmsSkuStock::getProductId, product.getId()).last("LIMIT 1"))
                : skuMapper.selectById(skuId);
        BigDecimal price = sku != null && sku.getPrice() != null ? sku.getPrice() : product.getPrice();
        int qty = req.getQuantity() == null || req.getQuantity() < 1 ? 1 : req.getQuantity();

        OmsCartItem exist = cartMapper.selectOne(new LambdaQueryWrapper<OmsCartItem>()
                .eq(OmsCartItem::getMemberId, memberId)
                .eq(OmsCartItem::getProductId, product.getId())
                .eq(OmsCartItem::getProductSkuId, sku == null ? null : sku.getId())
                .eq(OmsCartItem::getDeleteStatus, 0));
        if (exist != null) {
            exist.setQuantity(exist.getQuantity() + qty);
            exist.setModifyDate(LocalDateTime.now());
            cartMapper.updateById(exist);
        } else {
            OmsCartItem item = new OmsCartItem();
            item.setProductId(product.getId());
            item.setProductSkuId(sku == null ? null : sku.getId());
            item.setMemberId(memberId);
            item.setQuantity(qty);
            item.setPrice(price);
            item.setProductName(product.getName());
            item.setProductPic(product.getPic());
            item.setProductBrand(product.getBrandId() == null ? null : String.valueOf(product.getBrandId()));
            item.setProductCategoryId(product.getProductCategoryId());
            item.setDeleteStatus(0);
            item.setCreateDate(LocalDateTime.now());
            item.setModifyDate(LocalDateTime.now());
            cartMapper.insert(item);
        }
        return R.ok("已加入购物车");
    }

    @GetMapping
    public R<List<OmsCartItem>> list() {
        Long memberId = AuthUtil.memberId();
        List<OmsCartItem> items = cartMapper.selectList(new LambdaQueryWrapper<OmsCartItem>()
                .eq(OmsCartItem::getMemberId, memberId)
                .eq(OmsCartItem::getDeleteStatus, 0)
                .orderByDesc(OmsCartItem::getId));
        return R.ok(items);
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestParam Integer quantity) {
        Long memberId = AuthUtil.memberId();
        OmsCartItem item = cartMapper.selectById(id);
        if (item == null || !item.getMemberId().equals(memberId)) throw new BizException(Code.BUSINESS_FAILED, "购物车项不存在");
        if (quantity < 1) quantity = 1;
        item.setQuantity(quantity);
        item.setModifyDate(LocalDateTime.now());
        cartMapper.updateById(item);
        return R.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        Long memberId = AuthUtil.memberId();
        OmsCartItem item = cartMapper.selectById(id);
        if (item == null || !item.getMemberId().equals(memberId)) throw new BizException(Code.BUSINESS_FAILED, "购物车项不存在");
        cartMapper.deleteById(id);
        return R.ok("删除成功");
    }

    @DeleteMapping("/clear")
    public R<Void> clear() {
        Long memberId = AuthUtil.memberId();
        cartMapper.delete(new LambdaQueryWrapper<OmsCartItem>().eq(OmsCartItem::getMemberId, memberId));
        return R.ok("清空成功");
    }
}
