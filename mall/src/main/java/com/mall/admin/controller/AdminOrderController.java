package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.PageResult;
import com.mall.common.R;
import com.mall.mbg.entity.OmsOrder;
import com.mall.mbg.entity.OmsOrderItem;
import com.mall.mbg.entity.OmsOrderOperateHistory;
import com.mall.mbg.mapper.OmsOrderItemMapper;
import com.mall.mbg.mapper.OmsOrderMapper;
import com.mall.mbg.mapper.OmsOrderOperateHistoryMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    @Resource
    private OmsOrderMapper orderMapper;
    @Resource
    private OmsOrderItemMapper orderItemMapper;
    @Resource
    private OmsOrderOperateHistoryMapper orderHistoryMapper;

    @GetMapping
    public R<PageResult<OmsOrder>> list(@RequestParam(required = false) String keyword,
                                        @RequestParam(required = false) Integer status,
                                        @RequestParam(defaultValue = "1") long pageNum,
                                        @RequestParam(defaultValue = "10") long pageSize) {
        LambdaQueryWrapper<OmsOrder> w = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) {
            w.like(OmsOrder::getOrderSn, keyword).or().eq(OmsOrder::getMemberId, keyword);
        }
        if (status != null) w.eq(OmsOrder::getStatus, status);
        w.orderByDesc(OmsOrder::getId);
        Page<OmsOrder> page = orderMapper.selectPage(new Page<>(pageNum, pageSize), w);
        return R.ok(PageResult.of(page.getRecords(), page.getTotal(), pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public R<Map<String, Object>> detail(@PathVariable Long id) {
        OmsOrder order = orderMapper.selectById(id);
        if (order == null) throw new BizException(Code.BUSINESS_FAILED, "订单不存在");
        List<OmsOrderItem> items = orderItemMapper.selectList(new LambdaQueryWrapper<OmsOrderItem>().eq(OmsOrderItem::getOrderId, id));
        List<OmsOrderOperateHistory> history = orderHistoryMapper.selectList(
                new LambdaQueryWrapper<OmsOrderOperateHistory>().eq(OmsOrderOperateHistory::getOrderId, id).orderByAsc(OmsOrderOperateHistory::getId));
        Map<String, Object> data = new HashMap<>();
        data.put("order", order);
        data.put("items", items);
        data.put("history", history);
        return R.ok(data);
    }

    @PostMapping("/{id}/deliver")
    public R<Void> deliver(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        OmsOrder order = orderMapper.selectById(id);
        if (order == null) throw new BizException(Code.BUSINESS_FAILED, "订单不存在");
        if (order.getStatus() == null || order.getStatus() != 3) {
            throw new BizException(Code.BUSINESS_FAILED, "仅「支付成功(待发货)」的订单可以发货");
        }
        String company = body == null ? null : body.get("deliveryCompany");
        String sn = body == null ? null : body.get("deliverySn");
        String note = body == null ? null : body.get("note");
        if (sn == null || sn.isBlank()) throw new BizException(Code.VALIDATE_FAILED, "请填写物流单号");

        order.setStatus(4);                       // 4 = 已发货
        order.setDeliveryCompany(company == null || company.isBlank() ? "顺丰速运" : company.trim());
        order.setDeliverySn(sn.trim());
        order.setDeliveryTime(LocalDateTime.now());
        orderMapper.updateById(order);

        OmsOrderOperateHistory h = new OmsOrderOperateHistory();
        h.setOrderId(id);
        h.setOperateMan("管理员");
        h.setCreateTime(LocalDateTime.now());
        h.setOrderStatus(4);
        h.setNote(note == null || note.isBlank()
                ? "已发货：" + order.getDeliveryCompany() + " " + order.getDeliverySn()
                : note);
        orderHistoryMapper.insert(h);
        return R.ok("发货成功");
    }

    @GetMapping("/{id}/track")
    public R<List<OmsOrderOperateHistory>> track(@PathVariable Long id) {
        return R.ok(orderHistoryMapper.selectList(
                new LambdaQueryWrapper<OmsOrderOperateHistory>().eq(OmsOrderOperateHistory::getOrderId, id).orderByAsc(OmsOrderOperateHistory::getId)));
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        orderItemMapper.delete(new LambdaQueryWrapper<OmsOrderItem>().eq(OmsOrderItem::getOrderId, id));
        orderHistoryMapper.delete(new LambdaQueryWrapper<OmsOrderOperateHistory>().eq(OmsOrderOperateHistory::getOrderId, id));
        orderMapper.deleteById(id);
        return R.ok("删除成功");
    }
}
