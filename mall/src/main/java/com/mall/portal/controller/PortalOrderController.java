package com.mall.portal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.*;
import com.mall.mbg.mapper.*;
import com.mall.portal.controller.CouponController.CalculateReq;
import com.mall.portal.dto.OrderCreateReq;
import com.mall.portal.dto.OrderItemVO;
import com.mall.portal.dto.OrderVO;
import com.mall.security.AuthUtil;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/orders")
public class PortalOrderController {

    @Resource
    private OmsOrderMapper orderMapper;
    @Resource
    private OmsOrderItemMapper orderItemMapper;
    @Resource
    private OmsOrderOperateHistoryMapper orderHistoryMapper;
    @Resource
    private OmsCartItemMapper cartMapper;
    @Resource
    private PmsProductMapper productMapper;
    @Resource
    private PmsSkuStockMapper skuMapper;
    @Resource
    private UmsMemberCouponMapper memberCouponMapper;
    @Resource
    private SmsCouponMapper couponMapper;
    @Resource
    private OmsPaymentRecordMapper paymentRecordMapper;

    /** 0 创建订单 */
    @PostMapping
    public R<Long> create(@RequestBody OrderCreateReq req) {
        Long memberId = AuthUtil.memberId();
        if (req.getCartItemIds() == null || req.getCartItemIds().isEmpty()) {
            throw new BizException(Code.VALIDATE_FAILED, "请选择购物车商品");
        }
        List<OmsCartItem> cartItems = cartMapper.selectList(new LambdaQueryWrapper<OmsCartItem>()
                .in(OmsCartItem::getId, req.getCartItemIds())
                .eq(OmsCartItem::getMemberId, memberId)
                .eq(OmsCartItem::getDeleteStatus, 0));
        if (cartItems.isEmpty()) throw new BizException(Code.BUSINESS_FAILED, "购物车项无效");

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OmsCartItem ci : cartItems) {
            totalAmount = totalAmount.add(ci.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
        }

        // 优惠券抵扣
        BigDecimal couponAmount = BigDecimal.ZERO;
        String couponName = null;
        Long memberCouponId = null;
        if (req.getCouponId() != null) {
            UmsMemberCoupon mc = memberCouponMapper.selectById(req.getCouponId());
            if (mc == null || !mc.getMemberId().equals(memberId) || mc.getUseStatus() != 0) {
                throw new BizException(Code.BUSINESS_FAILED, "优惠券不可用");
            }
            SmsCoupon coupon = couponMapper.selectById(mc.getCouponId());
            couponAmount = CouponController.computeDiscount(coupon, totalAmount);
            couponName = coupon == null ? null : coupon.getName();
            memberCouponId = mc.getId();
        }
        BigDecimal payAmount = totalAmount.subtract(couponAmount);
        if (payAmount.compareTo(BigDecimal.ZERO) < 0) payAmount = BigDecimal.ZERO;

        OmsOrder order = new OmsOrder();
        order.setOrderSn(genOrderSn(memberId));
        order.setMemberId(memberId);
        order.setCouponId(memberCouponId);
        order.setTotalAmount(totalAmount);
        order.setCouponAmount(couponAmount);
        order.setPayAmount(payAmount);
        order.setPayType(0);
        order.setStatus(0);
        order.setReceiverName(req.getReceiverName());
        order.setReceiverPhone(req.getReceiverPhone());
        order.setReceiverProvince(req.getReceiverProvince());
        order.setReceiverCity(req.getReceiverCity());
        order.setReceiverRegion(req.getReceiverRegion());
        order.setReceiverDetailAddress(req.getReceiverDetailAddress());
        order.setNote(req.getNote());
        order.setCreateTime(LocalDateTime.now());
        orderMapper.insert(order);

        for (OmsCartItem ci : cartItems) {
            OmsOrderItem item = new OmsOrderItem();
            item.setOrderId(order.getId());
            item.setProductId(ci.getProductId());
            item.setProductSkuId(ci.getProductSkuId());
            item.setProductName(ci.getProductName());
            item.setProductPic(ci.getProductPic());
            item.setProductPrice(ci.getPrice());
            item.setProductQuantity(ci.getQuantity());
            item.setProductCategoryId(ci.getProductCategoryId());
            PmsSkuStock sku = ci.getProductSkuId() == null ? null : skuMapper.selectById(ci.getProductSkuId());
            item.setProductSkuCode(sku == null ? null : sku.getSkuCode());
            item.setRealAmount(ci.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
            orderItemMapper.insert(item);
            // 扣减库存
            deductStock(ci.getProductId(), ci.getProductSkuId(), ci.getQuantity());
            // 移除购物车
            cartMapper.deleteById(ci.getId());
        }
        recordHistory(order.getId(), 0, "创建订单");
        return R.ok(order.getId());
    }

    /** 1 确认订单 */
    @PutMapping("/{id}/confirm")
    public R<Void> confirm(@PathVariable Long id) {
        OmsOrder order = requireOwnedOrder(id);
        if (order.getStatus() != 0) throw new BizException(Code.BUSINESS_FAILED, "当前状态不可确认");
        order.setStatus(1);
        order.setConfirmTime(LocalDateTime.now());
        orderMapper.updateById(order);
        recordHistory(id, 1, "确认订单");
        return R.ok("已确认");
    }

    /** 2 待支付 */
    @PutMapping("/{id}/prepay")
    public R<Void> prepay(@PathVariable Long id) {
        OmsOrder order = requireOwnedOrder(id);
        if (order.getStatus() != 1) throw new BizException(Code.BUSINESS_FAILED, "请先确认订单");
        order.setStatus(2);
        orderMapper.updateById(order);
        recordHistory(id, 2, "进入待支付");
        return R.ok("待支付");
    }

    /** 3 模拟支付成功 */
    @PostMapping("/{id}/pay")
    public R<Void> pay(@PathVariable Long id) {
        OmsOrder order = requireOwnedOrder(id);
        if (order.getStatus() != 2) throw new BizException(Code.BUSINESS_FAILED, "订单状态异常，无法支付");
        order.setStatus(3);
        order.setPaymentTime(LocalDateTime.now());
        orderMapper.updateById(order);
        // 标记优惠券已用
        if (order.getCouponId() != null) {
            UmsMemberCoupon mc = memberCouponMapper.selectById(order.getCouponId());
            if (mc != null && mc.getUseStatus() == 0) {
                mc.setUseStatus(1);
                mc.setUseTime(LocalDateTime.now());
                mc.setOrderId(order.getId());
                memberCouponMapper.updateById(mc);
                SmsCoupon c = couponMapper.selectById(mc.getCouponId());
                if (c != null) {
                    c.setUseCount(c.getUseCount() == null ? 1 : c.getUseCount() + 1);
                    couponMapper.updateById(c);
                }
            }
        }
        recordHistory(id, 3, "支付成功(模拟)");
        // 写入收款流水（财务管理数据来源）
        OmsPaymentRecord record = new OmsPaymentRecord();
        record.setOrderId(order.getId());
        record.setOrderSn(order.getOrderSn());
        record.setMemberId(order.getMemberId());
        record.setAmount(order.getPayAmount());
        record.setPayType(order.getPayType());
        record.setStatus(1);
        record.setRemark("模拟支付");
        record.setPayTime(order.getPaymentTime());
        record.setCreateTime(LocalDateTime.now());
        paymentRecordMapper.insert(record);
        return R.ok("支付成功");
    }

    /** 5 取消订单（释放库存） */
    @PutMapping("/{id}/cancel")
    public R<Void> cancel(@PathVariable Long id) {
        OmsOrder order = requireOwnedOrder(id);
        if (order.getStatus() >= 3) throw new BizException(Code.BUSINESS_FAILED, "订单已支付，无法取消");
        order.setStatus(5);
        orderMapper.updateById(order);
        // 恢复库存
        List<OmsOrderItem> items = orderItemMapper.selectList(new LambdaQueryWrapper<OmsOrderItem>().eq(OmsOrderItem::getOrderId, id));
        for (OmsOrderItem it : items) {
            restoreStock(it.getProductId(), it.getProductSkuId(), it.getProductQuantity());
        }
        recordHistory(id, 5, "取消订单");
        return R.ok("已取消");
    }

    @GetMapping
    public R<List<OrderVO>> myOrders(@RequestParam(required = false) Integer status) {
        Long memberId = AuthUtil.memberId();
        LambdaQueryWrapper<OmsOrder> w = new LambdaQueryWrapper<OmsOrder>().eq(OmsOrder::getMemberId, memberId);
        if (status != null) w.eq(OmsOrder::getStatus, status);
        w.orderByDesc(OmsOrder::getId);
        return R.ok(orderMapper.selectList(w).stream().map(this::toVO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public R<OrderVO> detail(@PathVariable Long id) {
        OmsOrder order = requireOwnedOrder(id);
        return R.ok(toVO(order));
    }

    // ---------------- helpers ----------------
    private OmsOrder requireOwnedOrder(Long id) {
        OmsOrder order = orderMapper.selectById(id);
        if (order == null) throw new BizException(Code.BUSINESS_FAILED, "订单不存在");
        if (!order.getMemberId().equals(AuthUtil.memberId())) throw new BizException(Code.FORBIDDEN, "无权操作该订单");
        return order;
    }

    private void deductStock(Long productId, Long skuId, Integer qty) {
        if (skuId != null) {
            PmsSkuStock sku = skuMapper.selectById(skuId);
            if (sku != null) {
                sku.setStock(Math.max(0, sku.getStock() - qty));
                skuMapper.updateById(sku);
            }
        }
        PmsProduct p = productMapper.selectById(productId);
        if (p != null) {
            p.setStock(Math.max(0, p.getStock() - qty));
            productMapper.updateById(p);
        }
    }

    private void restoreStock(Long productId, Long skuId, Integer qty) {
        if (skuId != null) {
            PmsSkuStock sku = skuMapper.selectById(skuId);
            if (sku != null) {
                sku.setStock(sku.getStock() + qty);
                skuMapper.updateById(sku);
            }
        }
        PmsProduct p = productMapper.selectById(productId);
        if (p != null) {
            p.setStock(p.getStock() + qty);
            productMapper.updateById(p);
        }
    }

    private void recordHistory(Long orderId, Integer status, String note) {
        OmsOrderOperateHistory h = new OmsOrderOperateHistory();
        h.setOrderId(orderId);
        h.setOperateMan("会员");
        h.setCreateTime(LocalDateTime.now());
        h.setOrderStatus(status);
        h.setNote(note);
        orderHistoryMapper.insert(h);
    }

    private OrderVO toVO(OmsOrder o) {
        OrderVO vo = new OrderVO();
        vo.setId(o.getId());
        vo.setOrderSn(o.getOrderSn());
        vo.setStatus(o.getStatus());
        vo.setTotalAmount(o.getTotalAmount());
        vo.setCouponAmount(o.getCouponAmount());
        vo.setPayAmount(o.getPayAmount());
        vo.setPayType(o.getPayType());
        vo.setReceiverName(o.getReceiverName());
        vo.setReceiverPhone(o.getReceiverPhone());
        vo.setReceiverDetailAddress(o.getReceiverDetailAddress());
        vo.setNote(o.getNote());
        vo.setCreateTime(o.getCreateTime());
        vo.setConfirmTime(o.getConfirmTime());
        vo.setPaymentTime(o.getPaymentTime());
        vo.setDeliveryCompany(o.getDeliveryCompany());
        vo.setDeliverySn(o.getDeliverySn());
        vo.setDeliveryTime(o.getDeliveryTime());
        if (o.getCouponId() != null) {
            UmsMemberCoupon mc = memberCouponMapper.selectById(o.getCouponId());
            if (mc != null) {
                SmsCoupon c = couponMapper.selectById(mc.getCouponId());
                vo.setCouponName(c == null ? null : c.getName());
            }
        }
        List<OmsOrderItem> items = orderItemMapper.selectList(new LambdaQueryWrapper<OmsOrderItem>().eq(OmsOrderItem::getOrderId, o.getId()));
        vo.setItems(items.stream().map(it -> {
            OrderItemVO iv = new OrderItemVO();
            iv.setId(it.getId());
            iv.setProductId(it.getProductId());
            iv.setProductName(it.getProductName());
            iv.setProductPic(it.getProductPic());
            iv.setProductPrice(it.getProductPrice());
            iv.setProductQuantity(it.getProductQuantity());
            iv.setRealAmount(it.getRealAmount());
            return iv;
        }).collect(Collectors.toList()));
        return vo;
    }

    private String genOrderSn(Long memberId) {
        return "NO" + System.currentTimeMillis() + String.format("%04d", memberId % 10000);
    }
}
