-- ============================================================
-- mall 数据库初始化脚本（商品域 + 营销域示例数据）
-- 账号(admin/demo) 与 权限(RBAC) 由应用启动时的 DataInitializer 注入
-- 执行：mysql -uroot -p < mall.sql
-- ============================================================
CREATE DATABASE IF NOT EXISTS mall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE mall;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------- 权限模块 sys ----------------
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  password VARCHAR(128) NOT NULL,
  nick_name VARCHAR(64),
  status INT DEFAULT 1,
  create_time DATETIME
);

DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(255),
  create_time DATETIME
);

DROP TABLE IF EXISTS sys_menu;
CREATE TABLE sys_menu (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  parent_id BIGINT DEFAULT 0,
  title VARCHAR(64),
  name VARCHAR(64),
  icon VARCHAR(64),
  sort INT DEFAULT 0,
  type INT DEFAULT 1,
  hidden INT DEFAULT 0,
  create_time DATETIME
);

DROP TABLE IF EXISTS sys_resource;
CREATE TABLE sys_resource (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64),
  url VARCHAR(255),
  category_id BIGINT,
  create_time DATETIME
);

DROP TABLE IF EXISTS sys_role_menu;
CREATE TABLE sys_role_menu (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT,
  menu_id BIGINT
);

DROP TABLE IF EXISTS sys_role_resource;
CREATE TABLE sys_role_resource (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT,
  resource_id BIGINT
);

DROP TABLE IF EXISTS sys_user_role;
CREATE TABLE sys_user_role (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  role_id BIGINT
);

-- ---------------- 会员模块 ums ----------------
DROP TABLE IF EXISTS ums_member;
CREATE TABLE ums_member (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  password VARCHAR(128) NOT NULL,
  nickname VARCHAR(64),
  phone VARCHAR(32),
  email VARCHAR(128),
  icon VARCHAR(255),
  gender INT DEFAULT 0,
  birthday DATETIME,
  city VARCHAR(64),
  status INT DEFAULT 1,
  integration INT DEFAULT 0,
  growth INT DEFAULT 0,
  create_time DATETIME
);

DROP TABLE IF EXISTS ums_member_receive_address;
CREATE TABLE ums_member_receive_address (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT,
  name VARCHAR(64),
  phone_number VARCHAR(32),
  province VARCHAR(64),
  city VARCHAR(64),
  region VARCHAR(64),
  detail_address VARCHAR(255),
  default_status INT DEFAULT 0,
  create_time DATETIME
);

DROP TABLE IF EXISTS ums_member_coupon;
CREATE TABLE ums_member_coupon (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT,
  coupon_id BIGINT,
  coupon_code VARCHAR(64),
  use_status INT DEFAULT 0,
  get_time DATETIME,
  use_time DATETIME,
  order_id BIGINT
);

-- ---------------- 商品模块 pms ----------------
DROP TABLE IF EXISTS pms_product;
CREATE TABLE pms_product (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  brand_id BIGINT,
  product_category_id BIGINT,
  name VARCHAR(255) NOT NULL,
  pic VARCHAR(512),
  product_sn VARCHAR(64),
  price DECIMAL(10,2) DEFAULT 0,
  sale INT DEFAULT 0,
  stock INT DEFAULT 0,
  low_stock INT DEFAULT 0,
  new_status INT DEFAULT 0,
  recommand_status INT DEFAULT 0,
  publish_status INT DEFAULT 1,
  delete_status INT DEFAULT 0,
  description TEXT,
  create_time DATETIME
);

DROP TABLE IF EXISTS pms_product_category;
CREATE TABLE pms_product_category (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  parent_id BIGINT DEFAULT 0,
  name VARCHAR(64),
  level INT DEFAULT 0,
  sort INT DEFAULT 0,
  icon VARCHAR(255),
  description VARCHAR(255)
);

DROP TABLE IF EXISTS pms_brand;
CREATE TABLE pms_brand (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64),
  logo VARCHAR(512),
  description VARCHAR(255),
  sort INT DEFAULT 0,
  show_status INT DEFAULT 1
);

DROP TABLE IF EXISTS pms_product_attribute_category;
CREATE TABLE pms_product_attribute_category (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64)
);

DROP TABLE IF EXISTS pms_product_attribute;
CREATE TABLE pms_product_attribute (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_attribute_category_id BIGINT,
  name VARCHAR(64),
  type INT DEFAULT 0,
  input_type INT DEFAULT 0,
  value_select VARCHAR(255)
);

DROP TABLE IF EXISTS pms_product_attribute_value;
CREATE TABLE pms_product_attribute_value (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT,
  product_attribute_id BIGINT,
  value VARCHAR(255)
);

DROP TABLE IF EXISTS pms_sku_stock;
CREATE TABLE pms_sku_stock (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT,
  sku_code VARCHAR(64),
  price DECIMAL(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  lock_stock INT DEFAULT 0,
  sp1 VARCHAR(64),
  sp2 VARCHAR(64),
  sp3 VARCHAR(64),
  pic VARCHAR(512)
);

-- ---------------- 订单模块 oms ----------------
DROP TABLE IF EXISTS oms_cart_item;
CREATE TABLE oms_cart_item (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT,
  product_sku_id BIGINT,
  member_id BIGINT,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0,
  product_name VARCHAR(255),
  product_pic VARCHAR(512),
  product_brand VARCHAR(64),
  product_category_id BIGINT,
  delete_status INT DEFAULT 0,
  create_date DATETIME,
  modify_date DATETIME
);

DROP TABLE IF EXISTS oms_order;
CREATE TABLE oms_order (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_sn VARCHAR(64),
  member_id BIGINT,
  coupon_id BIGINT,
  total_amount DECIMAL(10,2) DEFAULT 0,
  coupon_amount DECIMAL(10,2) DEFAULT 0,
  pay_amount DECIMAL(10,2) DEFAULT 0,
  pay_type INT DEFAULT 0,
  status INT DEFAULT 0,
  receiver_name VARCHAR(64),
  receiver_phone VARCHAR(32),
  receiver_province VARCHAR(64),
  receiver_city VARCHAR(64),
  receiver_region VARCHAR(64),
  receiver_detail_address VARCHAR(255),
  note VARCHAR(512),
  create_time DATETIME,
  confirm_time DATETIME,
  payment_time DATETIME
);

DROP TABLE IF EXISTS oms_order_item;
CREATE TABLE oms_order_item (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT,
  product_id BIGINT,
  product_sku_id BIGINT,
  product_name VARCHAR(255),
  product_pic VARCHAR(512),
  product_price DECIMAL(10,2) DEFAULT 0,
  product_quantity INT DEFAULT 1,
  product_category_id BIGINT,
  product_sn VARCHAR(64),
  product_sku_code VARCHAR(64),
  real_amount DECIMAL(10,2) DEFAULT 0
);

DROP TABLE IF EXISTS oms_order_operate_history;
CREATE TABLE oms_order_operate_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT,
  operate_man VARCHAR(64),
  create_time DATETIME,
  order_status INT,
  note VARCHAR(255)
);

-- ---------------- 营销模块 sms ----------------
DROP TABLE IF EXISTS sms_coupon;
CREATE TABLE sms_coupon (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128),
  type INT DEFAULT 0,
  amount DECIMAL(10,2) DEFAULT 0,
  min_point DECIMAL(10,2) DEFAULT 0,
  per_limit INT DEFAULT 1,
  use_count INT DEFAULT 0,
  receive_count INT DEFAULT 0,
  publish_count INT DEFAULT 0,
  enable_start_time DATETIME,
  enable_end_time DATETIME,
  note VARCHAR(255),
  create_time DATETIME
);

DROP TABLE IF EXISTS sms_coupon_history;
CREATE TABLE sms_coupon_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  coupon_id BIGINT,
  member_id BIGINT,
  use_status INT DEFAULT 0,
  get_type INT DEFAULT 0,
  get_time DATETIME,
  use_time DATETIME,
  order_id BIGINT
);

DROP TABLE IF EXISTS sms_home_advertise;
CREATE TABLE sms_home_advertise (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128),
  type INT DEFAULT 0,
  pic VARCHAR(512),
  start_time DATETIME,
  end_time DATETIME,
  status INT DEFAULT 1,
  url VARCHAR(255),
  sort INT DEFAULT 0,
  click_count INT DEFAULT 0,
  product_id BIGINT NULL COMMENT '关联商品ID'
);

DROP TABLE IF EXISTS sms_home_recommend_product;
CREATE TABLE sms_home_recommend_product (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT,
  product_name VARCHAR(255),
  product_pic VARCHAR(512),
  recommend_status INT DEFAULT 1,
  sort INT DEFAULT 0
);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 示例数据
-- ============================================================
INSERT INTO pms_brand (id, name, logo, description, sort, show_status) VALUES
(1, '小米', '/images/brands/xiaomi.svg', '小米科技', 1, 1),
(2, '华为', '/images/brands/huawei.svg', '华为终端', 2, 1);

INSERT INTO pms_product_category (id, parent_id, name, level, sort, icon, description) VALUES
(1, 0, '手机数码', 0, 1, 'phone', '手机数码一级分类'),
(2, 1, '智能手机', 1, 1, NULL, '智能手机'),
(3, 1, '智能穿戴', 1, 2, NULL, '智能穿戴');

INSERT INTO pms_product (id, brand_id, product_category_id, name, pic, product_sn, price, sale, stock, low_stock, new_status, recommand_status, publish_status, delete_status, description, create_time) VALUES
(1, 1, 2, '小米14 Pro 5G手机', '/images/products/mi14pro.jpg', 'MI2024001', 3999.00, 1200, 200, 10, 1, 1, 1, 0, '小米14 Pro，徕卡光学镜头，骁龙8Gen3。', NOW()),
(2, 2, 2, '华为 Mate 60 Pro', '/images/products/mate60pro.jpg', 'HW2024002', 6999.00, 800, 100, 10, 1, 1, 1, 0, '华为 Mate 60 Pro，卫星通信，鸿蒙系统。', NOW()),
(3, 1, 3, '小米手环 8', '/images/products/band8.jpg', 'MI2024003', 239.00, 3000, 500, 20, 0, 1, 1, 0, '小米手环8，全天候健康监测。', NOW());

INSERT INTO pms_sku_stock (id, product_id, sku_code, price, stock, lock_stock, sp1, sp2, sp3, pic) VALUES
(1, 1, 'MI14-BLK-256', 3999.00, 120, 0, '黑色', '256GB', NULL, '/images/products/mi14pro.jpg'),
(2, 1, 'MI14-WHT-512', 4299.00, 80, 0, '白色', '512GB', NULL, '/images/products/mi14pro.jpg'),
(3, 2, 'MATE60-BLK-256', 6999.00, 60, 0, '黑色', '256GB', NULL, '/images/products/mate60pro.jpg'),
(4, 3, 'BAND8-BLK', 239.00, 500, 0, '黑色', NULL, NULL, '/images/products/band8.jpg');

INSERT INTO sms_coupon (id, name, type, amount, min_point, per_limit, use_count, receive_count, publish_count, enable_start_time, enable_end_time, note, create_time) VALUES
(1, '满3000减300', 0, 300.00, 3000.00, 1, 0, 0, 1000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), '满3000元减300元', NOW()),
(2, '全场9折券', 1, 0.90, 1000.00, 1, 0, 0, 1000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), '最低消费1000元，享9折', NOW());

INSERT INTO sms_home_advertise (id, name, type, pic, start_time, end_time, status, url, sort, click_count) VALUES
(1, '双十一狂欢', 0, '/images/banners/sale.jpg', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, '', 1, 0),
(2, '新品首发', 0, '/images/banners/new.jpg', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, '', 2, 0);

INSERT INTO sms_home_recommend_product (id, product_id, product_name, product_pic, recommend_status, sort) VALUES
(1, 1, '小米14 Pro 5G手机', '/images/products/mi14pro.jpg', 1, 1),
(2, 2, '华为 Mate 60 Pro', '/images/products/mate60pro.jpg', 1, 2);
