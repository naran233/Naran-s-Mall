package com.mall.portal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.SmsCoupon;
import com.mall.mbg.entity.SmsCouponHistory;
import com.mall.mbg.entity.UmsMemberCoupon;
import com.mall.mbg.mapper.SmsCouponMapper;
import com.mall.mbg.mapper.UmsMemberCouponMapper;
import com.mall.portal.dto.CouponVO;
import com.mall.security.AuthUtil;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/coupons")
public class CouponController {

    @Resource
    private SmsCouponMapper couponMapper;
    @Resource
    private UmsMemberCouponMapper memberCouponMapper;

    /** 可领取优惠券列表（公开） */
    @GetMapping("/available")
    public R<List<SmsCoupon>> available() {
        return R.ok(couponMapper.selectList(new LambdaQueryWrapper<SmsCoupon>().orderByDesc(SmsCoupon::getId)));
    }

    /** 会员领取优惠券 */
    @PostMapping("/{couponId}/receive")
    public R<Void> receive(@PathVariable Long couponId) {
        Long memberId = AuthUtil.memberId();
        SmsCoupon coupon = couponMapper.selectById(couponId);
        if (coupon == null) throw new BizException(Code.BUSINESS_FAILED, "优惠券不存在");
        if (coupon.getPublishCount() != null && coupon.getPublishCount() > 0) {
            Long received = memberCouponMapper.selectCount(new LambdaQueryWrapper<UmsMemberCoupon>()
                    .eq(UmsMemberCoupon::getCouponId, couponId));
            if (received >= coupon.getPublishCount()) throw new BizException(Code.BUSINESS_FAILED, "优惠券已领完");
        }
        if (coupon.getPerLimit() != null && coupon.getPerLimit() > 0) {
            Long mine = memberCouponMapper.selectCount(new LambdaQueryWrapper<UmsMemberCoupon>()
                    .eq(UmsMemberCoupon::getCouponId, couponId)
                    .eq(UmsMemberCoupon::getMemberId, memberId));
            if (mine >= coupon.getPerLimit()) throw new BizException(Code.BUSINESS_FAILED, "超过领取上限");
        }
        UmsMemberCoupon mc = new UmsMemberCoupon();
        mc.setMemberId(memberId);
        mc.setCouponId(couponId);
        mc.setCouponCode(UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
        mc.setUseStatus(0);
        mc.setGetTime(LocalDateTime.now());
        memberCouponMapper.insert(mc);
        coupon.setReceiveCount(coupon.getReceiveCount() == null ? 1 : coupon.getReceiveCount() + 1);
        couponMapper.updateById(coupon);
        return R.ok("领取成功");
    }

    /** 我的优惠券 */
    @GetMapping
    public R<List<CouponVO>> myCoupons(@RequestParam(required = false) Integer useStatus) {
        Long memberId = AuthUtil.memberId();
        LambdaQueryWrapper<UmsMemberCoupon> w = new LambdaQueryWrapper<UmsMemberCoupon>()
                .eq(UmsMemberCoupon::getMemberId, memberId);
        if (useStatus != null) w.eq(UmsMemberCoupon::getUseStatus, useStatus);
        List<UmsMemberCoupon> list = memberCouponMapper.selectList(w);
        List<CouponVO> vos = list.stream().map(mc -> {
            SmsCoupon c = couponMapper.selectById(mc.getCouponId());
            CouponVO vo = new CouponVO();
            vo.setMemberCouponId(mc.getId());
            vo.setCouponId(mc.getCouponId());
            vo.setName(c == null ? "" : c.getName());
            vo.setType(c == null ? 0 : c.getType());
            vo.setAmount(c == null ? BigDecimal.ZERO : c.getAmount());
            vo.setMinPoint(c == null ? BigDecimal.ZERO : c.getMinPoint());
            vo.setUseStatus(mc.getUseStatus());
            vo.setGetTime(mc.getGetTime());
            return vo;
        }).collect(Collectors.toList());
        return R.ok(vos);
    }

    /** 计算优惠金额（预览/下单时使用） */
    @PostMapping("/calculate")
    public R<BigDecimal> calculate(@RequestBody CalculateReq req) {
        Long memberId = AuthUtil.memberId();
        UmsMemberCoupon mc = memberCouponMapper.selectById(req.getMemberCouponId());
        if (mc == null || !mc.getMemberId().equals(memberId)) {
            throw new BizException(Code.BUSINESS_FAILED, "优惠券无效");
        }
        if (mc.getUseStatus() != 0) throw new BizException(Code.BUSINESS_FAILED, "优惠券已使用");
        SmsCoupon coupon = couponMapper.selectById(mc.getCouponId());
        BigDecimal discount = computeDiscount(coupon, req.getTotalAmount());
        return R.ok(discount);
    }

    public static BigDecimal computeDiscount(SmsCoupon coupon, BigDecimal total) {
        if (coupon == null || total == null) return BigDecimal.ZERO;
        if (coupon.getMinPoint() != null && total.compareTo(coupon.getMinPoint()) < 0) return BigDecimal.ZERO;
        BigDecimal discount;
        if (coupon.getType() == 1) {
            // 折扣: amount=0.9 表示9折，优惠=total*(1-0.9)
            BigDecimal rate = coupon.getAmount() == null ? BigDecimal.ONE : coupon.getAmount();
            discount = total.multiply(BigDecimal.ONE.subtract(rate));
        } else {
            // 满减
            discount = coupon.getAmount() == null ? BigDecimal.ZERO : coupon.getAmount();
        }
        if (discount.compareTo(total) > 0) discount = total;
        if (discount.compareTo(BigDecimal.ZERO) < 0) discount = BigDecimal.ZERO;
        return discount.setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    @lombok.Data
    public static class CalculateReq {
        private Long memberCouponId;
        private BigDecimal totalAmount;
    }
}
