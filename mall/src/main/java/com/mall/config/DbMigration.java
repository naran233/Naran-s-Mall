package com.mall.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;

/**
 * 启动时自动执行数据库结构迁移（幂等）。
 * 无需手工执行 SQL，应用启动即完成 v2 结构升级：
 * 1. oms_order 增加物流字段，订单状态 4 已取消 -> 5
 * 2. 新增 会员等级 / 帮助中心 / 客服工单 / 财务流水 / 系统设置 表
 * 3. 初始化上述表的基础数据
 */
@Component
@Order(1)
public class DbMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DbMigration.class);

    @Resource
    private JdbcTemplate jdbc;

    @Override
    public void run(ApplicationArguments args) {
        try {
            migrateOrderDelivery();
            migrateAdvertiseProduct();
            createNewTables();
            initBaseData();
            fixPlaceholderImages();
            initNewMenus();
            log.info("[DbMigration] 数据库结构校验完成");
        } catch (Exception e) {
            log.error("[DbMigration] 迁移失败: {}", e.getMessage(), e);
            throw e;
        }
    }

    /** 订单发货字段 + 状态码迁移（仅首次执行） */
    private void migrateOrderDelivery() {
        if (columnExists("oms_order", "delivery_company")) {
            return;
        }
        jdbc.execute("ALTER TABLE oms_order ADD COLUMN delivery_company VARCHAR(64) NULL COMMENT '物流公司'");
        jdbc.execute("ALTER TABLE oms_order ADD COLUMN delivery_sn VARCHAR(64) NULL COMMENT '物流单号'");
        jdbc.execute("ALTER TABLE oms_order ADD COLUMN delivery_time DATETIME NULL COMMENT '发货时间'");
        // 旧状态 4=已取消 让位给 4=已发货，取消改为 5
        int n = jdbc.update("UPDATE oms_order SET status = 5 WHERE status = 4");
        log.info("[DbMigration] oms_order 新增物流字段，迁移已取消订单 {} 条 (4 -> 5)", n);
    }

    /**
     * 首页轮播位与商品绑定（幂等）。
     * 原先 sms_home_advertise.url 为空，轮播图只是纯图片、点击无反应；
     * 这里新增 product_id 字段并把历史轮播位绑定到真实商品，前台即可跳转商品详情。
     */
    private void migrateAdvertiseProduct() {
        if (!columnExists("sms_home_advertise", "product_id")) {
            jdbc.execute("ALTER TABLE sms_home_advertise ADD COLUMN product_id BIGINT NULL COMMENT '关联商品ID'");
            log.info("[DbMigration] sms_home_advertise 新增 product_id 字段");
        }

        int bound = 0;
        bound += bindAdvertiseByProductSn("双十一", "HONOR-M6P");
        bound += bindAdvertiseByProductSn("新品", "LENOVO-XP16");

        // 兜底：仍未绑定的轮播位统一指向销量最高的在售商品，避免出现「点了没反应」的轮播图
        bound += jdbc.update("""
                UPDATE sms_home_advertise SET product_id = (
                    SELECT pid FROM (SELECT id AS pid FROM pms_product
                     WHERE delete_status = 0 AND publish_status = 1
                     ORDER BY sale DESC LIMIT 1) t
                ) WHERE product_id IS NULL
                """);

        // url 同步为商品详情路径，兼容仍按 url 跳转的调用方
        jdbc.update("""
                UPDATE sms_home_advertise SET url = CONCAT('/product/', product_id)
                 WHERE product_id IS NOT NULL AND (url IS NULL OR url = '')
                """);

        if (bound > 0) {
            log.info("[DbMigration] 首页轮播位绑定商品 {} 条", bound);
        }

        // 补足轮播位数量：Element Plus 在「恰好 2 张 + loop」时会把子项复制一倍用于无缝轮播，
        // 导致指示点变成 4 个；保持 3 张以上即可规避该边界情况，同时首页内容更完整。
        insertBannerIfAbsent("数码焕新季", "/images/products/headphone-sony.jpg", "SONY-XM5", 3);
        insertBannerIfAbsent("美味零食节", "/images/products/chips.jpg", "LAYS-CHIPS", 4);
    }

    private void insertBannerIfAbsent(String name, String pic, String productSn, int sort) {
        Integer exists = jdbc.queryForObject("SELECT COUNT(*) FROM sms_home_advertise WHERE name = ?", Integer.class, name);
        if (exists != null && exists > 0) {
            return;
        }
        try {
            Long productId = jdbc.queryForObject(
                    "SELECT id FROM pms_product WHERE product_sn = ? AND delete_status = 0 LIMIT 1",
                    Long.class, productSn);
            if (productId == null) {
                return;
            }
            jdbc.update("""
                    INSERT INTO sms_home_advertise (name, type, pic, start_time, end_time, status, url, sort, click_count, product_id)
                    VALUES (?, 0, ?, NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY), 1, ?, ?, 0, ?)
                    """, name, pic, "/product/" + productId, sort, productId);
            log.info("[DbMigration] 新增首页轮播位[{}] -> 商品 {}", name, productId);
        } catch (Exception e) {
            log.warn("[DbMigration] 新增轮播位[{}]失败: {}", name, e.getMessage());
        }
    }

    private int bindAdvertiseByProductSn(String nameKeyword, String productSn) {
        try {
            Long productId = jdbc.queryForObject(
                    "SELECT id FROM pms_product WHERE product_sn = ? AND delete_status = 0 LIMIT 1",
                    Long.class, productSn);
            if (productId == null) {
                return 0;
            }
            return jdbc.update("UPDATE sms_home_advertise SET product_id = ? WHERE name LIKE ? AND product_id IS NULL",
                    productId, "%" + nameKeyword + "%");
        } catch (Exception e) {
            log.warn("[DbMigration] 轮播位[{}]绑定商品[{}]失败: {}", nameKeyword, productSn, e.getMessage());
            return 0;
        }
    }

    private void createNewTables() {
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS ums_member_level (
                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                  name VARCHAR(64) NOT NULL COMMENT '等级名称',
                  growth_point INT DEFAULT 0 COMMENT '所需成长值',
                  discount_rate DECIMAL(4,2) DEFAULT 1.00 COMMENT '折扣率 1=无折扣',
                  description VARCHAR(255),
                  default_status INT DEFAULT 0 COMMENT '0非默认 1默认',
                  create_time DATETIME
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员等级'
                """);

        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS cms_help_category (
                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                  name VARCHAR(64) NOT NULL,
                  icon VARCHAR(64),
                  sort INT DEFAULT 0,
                  show_status INT DEFAULT 1,
                  create_time DATETIME
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帮助分类'
                """);

        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS cms_help (
                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                  category_id BIGINT,
                  title VARCHAR(255) NOT NULL,
                  content TEXT,
                  read_count INT DEFAULT 0,
                  sort INT DEFAULT 0,
                  show_status INT DEFAULT 1,
                  create_time DATETIME
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帮助文章'
                """);

        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS oms_service_ticket (
                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                  ticket_sn VARCHAR(64) COMMENT '工单号',
                  member_id BIGINT NOT NULL,
                  order_id BIGINT,
                  type INT DEFAULT 1 COMMENT '1咨询 2投诉 3退换货 4售后',
                  title VARCHAR(255) NOT NULL,
                  content TEXT,
                  images VARCHAR(1024),
                  status INT DEFAULT 0 COMMENT '0待处理 1处理中 2已回复 3已关闭',
                  reply_content TEXT,
                  reply_man VARCHAR(64),
                  reply_time DATETIME,
                  create_time DATETIME,
                  KEY idx_member (member_id),
                  KEY idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客服工单'
                """);

        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS oms_payment_record (
                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                  order_id BIGINT,
                  order_sn VARCHAR(64),
                  member_id BIGINT,
                  amount DECIMAL(12,2) DEFAULT 0,
                  pay_type INT DEFAULT 0 COMMENT '0模拟支付',
                  status INT DEFAULT 1 COMMENT '0待收款 1已收款 2已退款',
                  remark VARCHAR(255),
                  pay_time DATETIME,
                  create_time DATETIME,
                  KEY idx_order (order_id),
                  KEY idx_pay_time (pay_time)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='财务收款流水'
                """);

        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS sys_setting (
                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                  setting_key VARCHAR(64) NOT NULL COMMENT '配置项',
                  setting_value TEXT,
                  description VARCHAR(255),
                  update_time DATETIME,
                  UNIQUE KEY uk_key (setting_key)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置'
                """);
    }

    private void initBaseData() {
        if (count("ums_member_level") == 0) {
            jdbc.update("INSERT INTO ums_member_level (name, growth_point, discount_rate, description, default_status, create_time) VALUES (?,?,?,?,?,NOW())",
                    "普通会员", 0, 1.00, "注册即成为普通会员", 1);
            jdbc.update("INSERT INTO ums_member_level (name, growth_point, discount_rate, description, default_status, create_time) VALUES (?,?,?,?,?,NOW())",
                    "黄金会员", 1000, 0.95, "成长值满 1000 自动升级", 0);
            jdbc.update("INSERT INTO ums_member_level (name, growth_point, discount_rate, description, default_status, create_time) VALUES (?,?,?,?,?,NOW())",
                    "铂金会员", 5000, 0.90, "成长值满 5000 自动升级，享 9 折", 0);
        }

        if (count("cms_help_category") == 0) {
            Object[][] cats = {
                    {"购物指南", "ShoppingCart", 1}, {"支付方式", "Wallet", 2},
                    {"配送方式", "Van", 3}, {"售后服务", "Service", 4}
            };
            long cid = 1;
            for (Object[] c : cats) {
                jdbc.update("INSERT INTO cms_help_category (id, name, icon, sort, show_status, create_time) VALUES (?,?,?,?,1,NOW())",
                        cid++, c[0], c[1], c[2]);
            }
            Object[][] helps = {
                    {1L, "如何注册成为会员？", "点击右上角「注册」，填写用户名、手机号与密码即可完成注册，注册后自动成为普通会员。"},
                    {1L, "如何查找商品？", "可通过首页分类导航、顶部搜索框输入关键词，或在商品列表页按分类筛选。"},
                    {2L, "支持哪些支付方式？", "当前版本为演示项目，采用模拟支付：在订单页点击「模拟支付」即视为支付成功，不产生真实扣款。"},
                    {2L, "支付失败怎么办？", "请返回订单列表，在「待支付」状态下重新发起模拟支付；若订单已取消，可重新下单。"},
                    {3L, "配送范围与时效？", "演示项目默认全国配送，下单后由管理员在后台发货并填写物流单号，可在订单详情查看。"},
                    {3L, "运费如何计算？", "单笔订单满 99 元包邮，未满收取 10 元运费（可在后台「系统设置」中调整）。"},
                    {4L, "如何申请退换货？", "在「客户服务」页面提交售后工单，选择类型为「退换货」，客服会在 1 个工作日内处理。"},
                    {4L, "订单可以取消吗？", "未支付（创建/确认/待支付）的订单可在订单列表点击「取消订单」，库存将自动释放。"}
            };
            for (Object[] h : helps) {
                jdbc.update("INSERT INTO cms_help (category_id, title, content, read_count, sort, show_status, create_time) VALUES (?,?,?,0,0,1,NOW())",
                        h[0], h[1], h[2]);
            }
        }

        if (count("sys_setting") == 0) {
            Object[][] settings = {
                    {"site_name", "mall 商城", "站点名称"},
                    {"site_logo", "", "站点 Logo 图片地址"},
                    {"service_phone", "400-800-8888", "客服电话"},
                    {"service_email", "service@mall.com", "客服邮箱"},
                    {"free_freight_threshold", "99", "包邮门槛（元）"},
                    {"order_auto_cancel_minutes", "30", "未支付订单自动取消（分钟）"},
                    {"icp", "京ICP备00000000号", "备案号"},
                    {"site_description", "一站式品质购物商城", "站点简介"}
            };
            for (Object[] s : settings) {
                jdbc.update("INSERT INTO sys_setting (setting_key, setting_value, description, update_time) VALUES (?,?,?,NOW())",
                        s[0], s[1], s[2]);
            }
        }

        // 历史已支付订单回填收款流水
        Integer paid = jdbc.queryForObject("SELECT COUNT(*) FROM oms_order WHERE status IN (3,4)", Integer.class);
        if (paid != null && paid > 0 && count("oms_payment_record") == 0) {
            int n = jdbc.update("""
                    INSERT INTO oms_payment_record (order_id, order_sn, member_id, amount, pay_type, status, remark, pay_time, create_time)
                    SELECT id, order_sn, member_id, pay_amount, pay_type, 1, '历史订单回填', payment_time, NOW()
                    FROM oms_order WHERE status IN (3,4)
                    """);
            log.info("[DbMigration] 回填 {} 条历史收款流水", n);
        }
    }

    // ---------------- helpers ----------------
    /** 为 v2 新增模块补充后台菜单（幂等：按 name 判断，已存在则跳过） */
    private void initNewMenus() {
        Object[][] menus = {
                {"statistics", "统计报表", "DataAnalysis", 13},
                {"memberCenter", "会员中心", "User", 14},
                {"customerService", "客户服务", "Service", 15},
                {"helpCenter", "帮助中心", "Document", 16},
                {"finance", "财务管理", "Money", 17},
                {"setting", "系统设置", "Setting", 18}
        };
        Long adminRoleId = null;
        try {
            adminRoleId = jdbc.queryForObject("SELECT id FROM sys_role WHERE name = 'ADMIN' LIMIT 1", Long.class);
        } catch (Exception ignored) {
            log.warn("[DbMigration] 未找到 ADMIN 角色，跳过新菜单授权");
        }
        for (Object[] m : menus) {
            Integer exists = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM sys_menu WHERE name = ?", Integer.class, m[0]);
            if (exists != null && exists > 0) continue;
            jdbc.update("""
                    INSERT INTO sys_menu (parent_id, title, name, icon, sort, type, hidden, create_time)
                    VALUES (0, ?, ?, ?, ?, 1, 0, NOW())
                    """, m[1], m[0], m[2], m[3]);
            if (adminRoleId != null) {
                Long menuId = jdbc.queryForObject("SELECT id FROM sys_menu WHERE name = ? LIMIT 1", Long.class, m[0]);
                jdbc.update("INSERT INTO sys_role_menu (role_id, menu_id) VALUES (?, ?)", adminRoleId, menuId);
            }
        }
    }

    /** 把历史 via.placeholder.com 占位图替换为本地真实图片（仅在仍为占位图时替换） */
    private void fixPlaceholderImages() {
        String cond = "(pic LIKE '%placeholder.com%' OR pic IS NULL OR pic = '')";
        jdbc.update("UPDATE pms_product SET pic = ? WHERE product_sn = ? AND " + cond, "/images/products/mi14pro.jpg", "MI2024001");
        jdbc.update("UPDATE pms_product SET pic = ? WHERE product_sn = ? AND " + cond, "/images/products/mate60pro.jpg", "HW2024002");
        jdbc.update("UPDATE pms_product SET pic = ? WHERE product_sn = ? AND " + cond, "/images/products/band8.jpg", "MI2024003");

        jdbc.update("UPDATE pms_sku_stock SET pic = ? WHERE product_id = 1 AND (pic LIKE '%placeholder.com%' OR pic IS NULL)", "/images/products/mi14pro.jpg");
        jdbc.update("UPDATE pms_sku_stock SET pic = ? WHERE product_id = 2 AND (pic LIKE '%placeholder.com%' OR pic IS NULL)", "/images/products/mate60pro.jpg");
        jdbc.update("UPDATE pms_sku_stock SET pic = ? WHERE product_id = 3 AND (pic LIKE '%placeholder.com%' OR pic IS NULL)", "/images/products/band8.jpg");

        jdbc.update("UPDATE pms_brand SET logo = ? WHERE name = '小米' AND (logo LIKE '%placeholder.com%' OR logo IS NULL OR logo = '')", "/images/brands/xiaomi.svg");
        jdbc.update("UPDATE pms_brand SET logo = ? WHERE name = '华为' AND (logo LIKE '%placeholder.com%' OR logo IS NULL OR logo = '')", "/images/brands/huawei.svg");

        jdbc.update("UPDATE sms_home_advertise SET pic = ? WHERE name LIKE '%双十一%' AND (pic LIKE '%placeholder.com%' OR pic IS NULL)", "/images/banners/sale.jpg");
        jdbc.update("UPDATE sms_home_advertise SET pic = ? WHERE name LIKE '%新品%' AND (pic LIKE '%placeholder.com%' OR pic IS NULL)", "/images/banners/new.jpg");

        jdbc.update("UPDATE sms_home_recommend_product SET product_pic = ? WHERE product_id = 1 AND product_pic LIKE '%placeholder.com%'", "/images/products/mi14pro.jpg");
        jdbc.update("UPDATE sms_home_recommend_product SET product_pic = ? WHERE product_id = 2 AND product_pic LIKE '%placeholder.com%'", "/images/products/mate60pro.jpg");
    }

    private boolean columnExists(String table, String column) {
        Integer n = jdbc.queryForObject("""
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
                """, Integer.class, table, column);
        return n != null && n > 0;
    }

    private int count(String table) {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);
        return n == null ? 0 : n;
    }
}
