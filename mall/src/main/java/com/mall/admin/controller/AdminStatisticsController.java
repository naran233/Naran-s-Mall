package com.mall.admin.controller;

import com.mall.common.R;
import jakarta.annotation.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 统计报表（后台）：经营概览 / 销售趋势 / 热销商品 / 状态分布 / 分类销售
 */
@RestController
@RequestMapping("/api/admin/statistics")
public class AdminStatisticsController {

    @Resource
    private JdbcTemplate jdbc;

    /** 经营概览 */
    @GetMapping("/overview")
    public R<Map<String, Object>> overview() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalSales", jdbc.queryForObject(
                "SELECT COALESCE(SUM(pay_amount),0) FROM oms_order WHERE status IN (3,4,6)", Object.class));
        data.put("todaySales", jdbc.queryForObject(
                "SELECT COALESCE(SUM(pay_amount),0) FROM oms_order WHERE status IN (3,4,6) AND DATE(payment_time)=CURDATE()", Object.class));
        data.put("monthSales", jdbc.queryForObject(
                "SELECT COALESCE(SUM(pay_amount),0) FROM oms_order WHERE status IN (3,4,6) AND DATE_FORMAT(payment_time,'%Y-%m')=DATE_FORMAT(CURDATE(),'%Y-%m')", Object.class));
        data.put("orderCount", jdbc.queryForObject("SELECT COUNT(*) FROM oms_order", Integer.class));
        data.put("paidOrderCount", jdbc.queryForObject("SELECT COUNT(*) FROM oms_order WHERE status IN (3,4,6)", Integer.class));
        data.put("memberCount", jdbc.queryForObject("SELECT COUNT(*) FROM ums_member", Integer.class));
        data.put("newMemberToday", jdbc.queryForObject(
                "SELECT COUNT(*) FROM ums_member WHERE DATE(create_time)=CURDATE()", Integer.class));
        data.put("productCount", jdbc.queryForObject("SELECT COUNT(*) FROM pms_product WHERE delete_status=0", Integer.class));
        data.put("waitDeliverCount", jdbc.queryForObject("SELECT COUNT(*) FROM oms_order WHERE status=3", Integer.class));
        data.put("pendingTicketCount", jdbc.queryForObject("SELECT COUNT(*) FROM oms_service_ticket WHERE status=0", Integer.class));
        return R.ok(data);
    }

    /** 近 N 天销售趋势（按支付时间，缺失日期补 0） */
    @GetMapping("/salesTrend")
    public R<List<Map<String, Object>>> salesTrend(@RequestParam(defaultValue = "30") int days) {
        int d = Math.min(Math.max(days, 7), 90);
        List<Map<String, Object>> rows = jdbc.queryForList("""
                SELECT DATE(payment_time) AS d, COALESCE(SUM(pay_amount),0) AS amount, COUNT(*) AS orders
                FROM oms_order
                WHERE status IN (3,4,6) AND payment_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY DATE(payment_time) ORDER BY d
                """, d);
        Map<String, Map<String, Object>> indexed = new HashMap<>();
        for (Map<String, Object> r : rows) {
            indexed.put(String.valueOf(r.get("d")), r);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = d - 1; i >= 0; i--) {
            String key = today.minusDays(i).toString();
            Map<String, Object> hit = indexed.get(key);
            Map<String, Object> item = new HashMap<>();
            item.put("date", key);
            item.put("amount", hit == null ? 0 : hit.get("amount"));
            item.put("orders", hit == null ? 0 : hit.get("orders"));
            result.add(item);
        }
        return R.ok(result);
    }

    /** 热销商品 Top N */
    @GetMapping("/topProducts")
    public R<List<Map<String, Object>>> topProducts(@RequestParam(defaultValue = "8") int limit) {
        int n = Math.min(Math.max(limit, 1), 50);
        return R.ok(jdbc.queryForList("""
                SELECT oi.product_id AS productId, oi.product_name AS productName, oi.product_pic AS productPic,
                       SUM(oi.product_quantity) AS quantity, COALESCE(SUM(oi.real_amount),0) AS amount
                FROM oms_order_item oi
                JOIN oms_order o ON o.id = oi.order_id
                WHERE o.status IN (3,4,6)
                GROUP BY oi.product_id, oi.product_name, oi.product_pic
                ORDER BY quantity DESC LIMIT ?
                """, n));
    }

    /** 订单状态分布 */
    @GetMapping("/orderStatus")
    public R<List<Map<String, Object>>> orderStatus() {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT status, COUNT(*) AS cnt FROM oms_order GROUP BY status ORDER BY status");
        String[] names = {"创建订单", "确认订单", "待支付", "支付成功(待发货)", "已发货", "已取消"};
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            int s = ((Number) r.get("status")).intValue();
            Map<String, Object> item = new HashMap<>();
            item.put("status", s);
            item.put("name", s >= 0 && s < names.length ? names[s] : "未知");
            item.put("count", r.get("cnt"));
            out.add(item);
        }
        return R.ok(out);
    }

    /** 分类销售占比 */
    @GetMapping("/categorySales")
    public R<List<Map<String, Object>>> categorySales() {
        return R.ok(jdbc.queryForList("""
                SELECT COALESCE(c.name,'未分类') AS name, COALESCE(SUM(oi.real_amount),0) AS amount
                FROM oms_order_item oi
                JOIN oms_order o ON o.id = oi.order_id
                LEFT JOIN pms_product_category c ON c.id = oi.product_category_id
                WHERE o.status IN (3,4,6)
                GROUP BY c.name ORDER BY amount DESC
                """));
    }
}
