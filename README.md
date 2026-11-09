# mall 商城系统

一套**前后端分离**的电商 MVP，包含**前台商城**与**后台管理系统**，并提供 **Vue 3** 与 **React 18** 两套前端实现，二者共用同一个 Spring Boot 后端与 MySQL 数据库。

支持模拟支付、优惠券（满减/折扣）下单抵扣、订单六态流转（含发货）、RBAC 权限，以及会员中心 / 客户服务 / 帮助中心 / 统计报表 / 财务管理 / 系统设置六大运营模块。

> 仓库：<https://github.com/naran233/mall> ｜ 分支：`main` ｜ 许可证：[MIT](LICENSE)
>
> 本项目为**教学 / 演示用途**，内置演示账号与模拟支付，请勿直接用于生产环境（见 [18. 安全与部署须知](#18-安全与部署须知)）。

---

## 目录

- [1. 项目简介](#1-项目简介)
- [2. 功能总览](#2-功能总览)
- [3. 技术栈](#3-技术栈)
- [4. 架构说明](#4-架构说明)
- [5. 目录结构](#5-目录结构)
- [6. 环境要求](#6-环境要求)
- [7. 快速开始](#7-快速开始)
- [8. 服务与端口](#8-服务与端口)
- [9. 可用脚本](#9-可用脚本)
- [10. 预置账号](#10-预置账号)
- [11. 订单状态机](#11-订单状态机)
- [12. 主要接口](#12-主要接口)
- [13. 种子数据](#13-种子数据)
- [14. 图片资源](#14-图片资源)
- [15. 测试报告](#15-测试报告)
- [16. 常见问题](#16-常见问题)
- [17. 已知限制与待扩展](#17-已知限制与待扩展)
- [18. 安全与部署须知](#18-安全与部署须知)
- [19. 开源许可证](#19-开源许可证)
- [附录：文档索引与变更记录](#附录文档索引与变更记录)

---

## 1. 项目简介

| 项  | 说明                                                                           |
| -- | ---------------------------------------------------------------------------- |
| 定位 | 教学 / 演示用的电商全链路 MVP，覆盖「浏览 → 加购 → 领券 → 下单 → 支付 → 发货 → 售后」                      |
| 形态 | 单体后端 + 4 个独立前端工程（2 套 UI 框架 × 前台/后台）                                          |
| 后端 | 单可部署 Spring Boot 应用，包结构 `com.mall.{common,config,mbg,security,admin,portal}` |
| 前端 | Vue 3 / React 18 两套实现，**页面、路由、状态、接口一一对应**，可同屏对比                              |
| 数据 | 25 张基础表 + 6 张运营模块表（启动时自动创建），共 31 张表；内置多品类种子数据                                |
| 运行 | 本地运行，无需 Redis、无需外网；商品图片全部落地本地                                                |

### 设计取舍

- **单一 Spring Boot 应用**而非 Maven 多模块：包结构与多模块划分一一对应，后续可无损拆分。
- **数据库自动迁移**：`DbMigration` 在启动时幂等补齐表结构 / 字段 / 基础数据，无需手工执行 SQL。
- **模拟支付**：`POST /orders/{id}/pay` 直接置为支付成功并写入收款流水，不接第三方渠道。
- **无秒杀**：相关表与首页推荐位已预留，但不在本期范围。

---

## 2. 功能总览

### 2.1 前台商城

| 页面      | 路径             | 关键能力                                     |
| ------- | -------------- | ---------------------------------------- |
| 首页      | `/`            | 分类侧栏、轮播位（绑定商品，可点击进详情）、人气推荐 / 新鲜好物 / 猜你喜欢 |
| 商品列表    | `/products`    | 分类 / 品牌 / 关键词筛选、分页、排序                    |
| 商品详情    | `/product/:id` | 多 SKU 选择、库存、加入购物车、立即购买                   |
| 购物车     | `/cart`        | 数量增减、勾选、删除、清空、金额实时计算                     |
| 结算      | `/checkout`    | 收货地址、优惠券抵扣、订单金额试算、提交订单                   |
| 我的订单    | `/orders`      | 状态筛选（0~5 全态）、确认订单、去支付、模拟支付、取消、物流信息展示     |
| 会员中心    | `/member`      | 资料修改、收货地址、我的优惠券（领取/已领）、消费概览              |
| 客户服务    | `/service`     | 提交工单（咨询/投诉/退换货/售后）、查看工单进度                |
| 帮助中心    | `/help`        | 分类导航、关键词搜索、文章详情                          |
| 登录 / 注册 | `/login`       | 会员登录、自助注册                                |

### 2.2 后台管理

| 模块   | 路径                                      | 关键能力                                           |
| ---- | --------------------------------------- | ---------------------------------------------- |
| 仪表盘  | `/dashboard`                            | 经营概览、快捷入口、待办提示                                 |
| 统计报表 | `/statistics`                           | 销售趋势（7/30/90 天）、订单状态分布、分类销售占比、热销 Top8（ECharts） |
| 商品管理 | `/products`、`/categories`、`/brands`     | 商品 CRUD、上下架、新品/推荐标记、分类树、品牌维护                   |
| 订单管理 | `/orders`                               | 多条件查询、订单详情抽屉、**发货**（物流公司 + 单号）、操作轨迹、删除         |
| 会员中心 | `/members`                              | 会员列表、搜索、启禁用、详情（订单数 / 累计消费 / 最近订单）、会员等级         |
| 客户服务 | `/tickets`                              | 工单列表、状态统计、回复、关闭、删除                             |
| 帮助中心 | `/help`                                 | 分类与文章 CRUD、显示开关                                |
| 财务管理 | `/finance`                              | 收款概览、流水明细（日期/状态筛选）、近 30 天回款趋势、退款登记             |
| 权限管理 | `/users`、`/roles`、`/menus`、`/resources` | 用户 / 角色 / 菜单 / 资源，角色分配菜单树                      |
| 系统设置 | `/settings`                             | 站点信息、客服信息、交易参数（包邮门槛、自动取消时长）                    |

### 2.3 六大运营模块与数据表

| 模块   | 新增表                            | 说明                    |
| ---- | ------------------------------ | --------------------- |
| 会员中心 | `ums_member_level`             | 按成长值自动匹配普通 / 黄金 / 铂金  |
| 客户服务 | `oms_service_ticket`           | 工单类型与状态流转、后台回复        |
| 帮助中心 | `cms_help_category`、`cms_help` | 分类 + 文章，内置 4 分类 / 8 篇 |
| 统计报表 | 复用订单与流水表                       | 聚合查询，无独立表             |
| 财务管理 | `oms_payment_record`           | 支付成功自动写流水，退款生成冲正记录    |
| 系统设置 | `sys_setting`                  | 键值配置，保存即生效            |

---

## 3. 技术栈

| 层           | 技术                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| 后端          | Java 21 · Spring Boot 3.2.5 · Spring Security + JWT · MyBatis-Plus 3.5.7 · MySQL 8 · HikariCP · Redis（仅预留，未强依赖） |
| 后台前端（Vue）   | Vue 3 · Vite 5 · TypeScript · Element Plus · Pinia · Vue Router · Axios                                         |
| 前台前端（Vue）   | Vue 3 · Vite 5 · TypeScript · Element Plus · Pinia · Vue Router · Axios                                         |
| 后台前端（React） | React 18 · Vite 5 · TypeScript · Ant Design 5 · Zustand · React Router 6 · Axios · ECharts                      |
| 前台前端（React） | React 18 · Vite 5 · TypeScript · Ant Design 5 · Zustand · React Router 6 · Axios                                |
| 工程化         | Maven · npm · Vite 代理 · ECharts · 无头浏览器（Playwright）验证                                                           |

### 两套前端的对应关系

| 关注点  | Vue 版                                    | React 版                                                 |
| ---- | ---------------------------------------- | ------------------------------------------------------- |
| 路由   | Vue Router 4（`src/router/index.ts`）      | React Router 6（`src/router/index.tsx`，`RequireAuth` 守卫） |
| 状态   | Pinia（`store/user.ts`、`store/member.ts`） | Zustand（同名文件）                                           |
| 组件库  | Element Plus                             | Ant Design 5                                            |
| 请求封装 | `api/request.ts`（Axios 拦截器 + 401 处理）     | 同名同结构                                                   |
| 接口定义 | `api/admin.ts`、`api/portal.ts`           | 同名同结构                                                   |
| 图表   | ECharts 直接使用                             | `components/EChart.tsx` 统一封装 init/resize/dispose        |
| 本地存储 | `admin_token` / `member_token` 等 key     | 完全一致                                                    |

---

## 4. 架构说明

```
       ┌─────────────────┐        ┌─────────────────┐
       │  Vue 3 前台      │        │  React 18 前台   │
       │  5174           │        │  5176           │
       └────────┬────────┘        └────────┬────────┘
                │  /api  /images            │
                ▼                           ▼
        ┌───────────────────────────────────────────┐
        │        Spring Boot 3.2.5  :8080           │
        │  security(JWT) → admin / portal 控制器     │
        │  MyBatis-Plus → MySQL 8 (mall, 31 表)     │
        └───────────────────────────────────────────┘
                ▲                           ▲
                │  /api  /images            │
       ┌────────┴────────┐        ┌────────┴────────┐
       │  Vue 3 后台      │        │  React 18 后台   │
       │  5173           │        │  5175           │
       └─────────────────┘        └─────────────────┘
```

- 四个前端各自独立，通过 Vite 代理把 `/api`、`/images` 转发到后端，**开发期无需处理跨域**。
- 后端 CORS 已放开，也可直接指向后端地址部署。
- 两套前端读写同一份数据库，任一端操作实时反映到另一端（刷新即可见）。

### 后端启动时的三个初始化器（均幂等）

| 顺序 | 组件                | 职责                                                                 |
| -- | ----------------- | ------------------------------------------------------------------ |
| 1  | `DbMigration`     | 建库表 / 加字段 / 建 6 张运营表 / 回填历史数据 / 替换占位图 / 绑定首页轮播商品                   |
| 2  | `DataInitializer` | 增量补齐管理员、演示会员、角色、菜单与授权（不覆盖已有数据）                                     |
| 3  | `SeedDataRunner`  | 执行 `db/seed_data.sql`，以 `sys_setting.seed_version` 判重，事务内失败回滚不阻断启动 |

---

## 5. 目录结构

```
2026-11-01-19-08-40/
├── mall/                          # Spring Boot 后端（:8080）
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/mall/
│       │   ├── common/            # 统一返回 R、全局异常、分页、树工具
│       │   ├── config/            # CORS、MyBatisPlus、DbMigration、DataInitializer、SeedDataRunner
│       │   ├── security/          # JWT 工具与过滤器、安全配置、AuthUtil
│       │   ├── mbg/               # 实体 entity + Mapper
│       │   ├── admin/             # 后台接口（商品/订单/权限/会员/客服/帮助/统计/财务/设置）
│       │   └── portal/            # 前台接口（门户/商品/购物车/优惠券/订单/会员/帮助/工单）
│       └── resources/
│           ├── application.yml    # 数据源、JWT、种子开关
│           ├── static/images/     # 商品图 / 轮播图 / 品牌标识（全本地）
│           └── db/
│               ├── mall.sql       # 建库 + 25 张表 + 基础数据
│               └── seed_data.sql  # 种子数据（商品 / 会员 / 各状态订单）
│
├── mall-admin-web/                # 后台管理（Vue 3 + Element Plus，:5173）
│   ├── src/{api,layout,router,store,styles,views}
│   └── vite.config.ts
├── mall-portal-web/               # 前台商城（Vue 3 + Element Plus，:5174）
│   ├── src/{api,layout,router,store,styles,views}
│   └── vite.config.ts
├── mall-admin-react/              # 后台管理（React 18 + Ant Design 5，:5175）
│   ├── src/{api,components,layout,pages,router,store,styles}
│   └── vite.config.ts
├── mall-portal-react/             # 前台商城（React 18 + Ant Design 5，:5176）
│   ├── src/{api,components,layout,pages,router,store,styles}
│   └── vite.config.ts
│
├── scripts/
│   ├── init-db.bat                # Windows 一键建库（建表 + 种子 + 校验）
│   ├── gen-seed-sql.mjs           # 种子数据生成器（改字典后重跑）
│   └── download-seed-images.sh    # 商品图批量下载清单（Pexels）
│
├── docs/
│   ├── dual-frontend.md           # 双前端并行方案：页面/路由/接口对照、Nginx 切换
│   └── carousel-fix.md            # 首页轮播问题排查与修复记录
│
├── .env.example                   # 环境变量清单（复制为 .env，勿提交真实值）
├── .gitignore                     # 忽略依赖/构建产物/本地密钥/工作区数据
├── LICENSE                        # MIT License
└── README.md
```

---

## 6. 环境要求

| 依赖      | 版本要求           | 本机验证版本                |
| ------- | -------------- | --------------------- |
| JDK     | 17+            | 21.0.8                |
| Maven   | 3.8+           | 3.9.11                |
| Node.js | 18+            | 22.22.2               |
| npm     | 9+             | 10.9.7                |
| MySQL   | 8.0+           | 8.0（`localhost:3306`） |
| Redis   | **非必需**        | 未安装，不影响启动             |
| 浏览器     | 现代 Chromium 内核 | Chrome（用于验证）          |

### 数据源配置

`mall/src/main/resources/application.yml` 支持环境变量覆盖，换机器无需改代码：

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:mall}?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:123456}    # 默认值仅用于本机演示库
    hikari:
      pool-name: MallHikariPool     # 最小 5 / 最大 20 / 30s 超时
```

可用环境变量：`DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `JWT_SECRET`。  
完整清单与生成随机密钥的方法见 [`.env.example`](.env.example)（复制为 `.env`，该文件已被 `.gitignore` 忽略）。  
`jwt.secret` 同样支持 `JWT_SECRET` 覆盖，仓库内仅保留开发占位值。

默认连接参数：

| 项               | 值                    |
| --------------- | -------------------- |
| Host / Port     | `localhost` / `3306` |
| Database        | `mall`               |
| User / Password | `root` / `123456`    |
| 字符集             | `utf8mb4`            |

换库示例（Windows cmd）：

```bat
set DB_HOST=192.168.1.10
set DB_USER=dev
set DB_PASSWORD=yourpwd
java -jar target/mall-1.0.0.jar
```

---

## 7. 快速开始

### 7.1 准备数据库

```bash
# 方式一：命令行（建表 + 种子数据）
mysql -uroot -p123456 < mall/src/main/resources/db/mall.sql
mysql -uroot -p123456 < mall/src/main/resources/db/seed_data.sql

# 方式二：Windows 一键脚本（自动定位 mysql.exe，依次导入并校验）
scripts\init-db.bat
```

> 只需建表也可：`seed_data.sql` 会在应用启动时由 `SeedDataRunner` 自动执行。

### 7.2 启动后端

```bash
cd mall
mvn spring-boot:run
# 或者
mvn -DskipTests package && java -jar target/mall-1.0.0.jar
```

默认监听 **8080**。若运行环境注入了 `SERVER_PORT` 等变量导致端口漂移，可显式指定：

```bash
java -jar target/mall-1.0.0.jar --server.port=8080
```

启动成功标志：日志出现 `Started MallApplication` 与 `Tomcat started on port 8080`；  
连接池自检：出现 `MallHikariPool - Start completed.` 即数据库连通。  
接口自检：`curl http://localhost:8080/api/portal/home` 返回 `code=0`。

### 7.3 启动四个前端

分别在**四个终端**执行（互不冲突，可同时运行）：

```bash
# ① 后台管理（Vue）    → http://localhost:5173
cd mall-admin-web && npm install && npm run dev

# ② 前台商城（Vue）    → http://localhost:5174
cd mall-portal-web && npm install && npm run dev

# ③ 后台管理（React）  → http://localhost:5175
cd mall-admin-react && npm install && npm run dev

# ④ 前台商城（React）  → http://localhost:5176
cd mall-portal-react && npm install && npm run dev
```

四个前端都把 `/api`、`/images` 代理到 `http://localhost:8080`。  
后端不在 8080 时，用环境变量覆盖（不改代码）：

```bash
# Windows cmd
set VITE_API_TARGET=http://localhost:8081 && npm run dev
# bash
VITE_API_TARGET=http://localhost:8081 npm run dev
```

### 7.4 首次跑通检查清单

1. 后端 8080 可访问 → `curl http://localhost:8080/api/portal/home`
2. 四个前端打开后**首页 / 登录页有数据与图片**（不是空白或 404 图）
3. 用 `admin / 123456` 登录后台，仪表盘有统计数字
4. 用 `demo / 123456` 登录前台，「我的订单」有历史订单

---

## 8. 服务与端口

| 服务          | 工程                  | 端口   | 访问地址                    | 说明           |
| ----------- | ------------------- | ---- | ----------------------- | ------------ |
| 后端 API      | `mall`              | 8080 | <http://localhost:8080> | 所有前端共用       |
| 后台管理（Vue）   | `mall-admin-web`    | 5173 | <http://localhost:5173> | Element Plus |
| 前台商城（Vue）   | `mall-portal-web`   | 5174 | <http://localhost:5174> | Element Plus |
| 后台管理（React） | `mall-admin-react`  | 5175 | <http://localhost:5175> | Ant Design 5 |
| 前台商城（React） | `mall-portal-react` | 5176 | <http://localhost:5176> | Ant Design 5 |


> 四个前端均设置 `strictPort: true`：端口被占用时**直接报错退出**，不会静默换端口，保证地址与文档一致。

### 对比两套前端

| 对比项             | 打开这一对                                             |
| --------------- | ------------------------------------------------- |
| 前台：Vue vs React | <http://localhost:5174> ↔ <http://localhost:5176> |
| 后台：Vue vs React | <http://localhost:5173> ↔ <http://localhost:5175> |

两套前端共用同一数据库，在任一端下单 / 发货，另一端刷新即可看到。

---

## 9. 可用脚本

### 9.1 后端（`mall/`）

| 命令                                                   | 作用                                 |
| ---------------------------------------------------- | ---------------------------------- |
| `mvn spring-boot:run`                                | 开发运行（默认 8080）                      |
| `mvn -DskipTests package`                            | 打包为 `target/mall-1.0.0.jar`        |
| `mvn -DskipTests package spring-boot:repackage`      | 生成**可执行** fat jar（`java -jar` 直接跑） |
| `java -jar target/mall-1.0.0.jar --server.port=8080` | 指定端口运行                             |
| `mvn test`                                           | 运行测试（当前未附单元测试）                     |

### 9.2 前端（四个工程通用）

| 命令                  | Vue 版 | React 版 | 作用                  |
| ------------------- | ----- | ------- | ------------------- |
| `npm run dev`       | ✅     | ✅       | 启动开发服务器（热更新）        |
| `npm run build`     | ✅     | ✅       | 生产构建到 `dist/`       |
| `npm run preview`   | ✅     | ✅       | 本地预览构建产物            |
| `npm run typecheck` | —     | ✅       | `tsc --noEmit` 类型检查 |

### 9.3 辅助脚本（`scripts/`）

| 脚本                                     | 作用                                           |
| -------------------------------------- | -------------------------------------------- |
| `scripts/init-db.bat`                  | Windows 一键建库：建表 → 种子数据 → 校验，自动定位 `mysql.exe` |
| `node scripts/gen-seed-sql.mjs`        | 重新生成 `seed_data.sql`（改顶部字典后执行，固定随机种子、结果可复现）  |
| `bash scripts/download-seed-images.sh` | 批量下载商品图（Pexels，附文件名 → 图片 ID 映射）              |

---

## 10. 预置账号

| 角色   | 用户名     | 密码       | 入口                                                   |
| ---- | ------- | -------- | ---------------------------------------------------- |
| 管理员  | `admin` | `123456` | 后台 <http://localhost:5173> 或 <http://localhost:5175> |
| 演示会员 | `demo`  | `123456` | 前台 <http://localhost:5174> 或 <http://localhost:5176> |

另有 8 个测试会员，**密码同为 `123456`**，用于查看不同会员的订单与消费数据：

| 用户名        | 昵称 | 城市 | 订单数 | 说明                           |
| ---------- | -- | -- | --- | ---------------------------- |
| `zhangwei` | 张伟 | 北京 | 5   | 覆盖创建 / 待支付 / 已支付 / 已发货 / 已取消 |
| `lina`     | 李娜 | 上海 | 5   | 铂金会员，高客单价                    |
| `wangfang` | 王芳 | 广州 | 5   | 黄金会员                         |
| `liuyang`  | 刘洋 | 深圳 | 5   | 普通会员                         |
| `chenjing` | 陈静 | 杭州 | 4   | 铂金会员                         |
| `zhaolei`  | 赵磊 | 成都 | 4   | 成长值较低                        |
| `sunyu`    | 孙宇 | 武汉 | 4   | 新注册                          |
| `zhoumin`  | 周敏 | 西安 | 4   | 黄金会员                         |

前台登录页提供「注册」Tab，可自助注册新会员。

---

## 11. 订单状态机

```
0 创建订单 → 1 确认订单 → 2 待支付 → 3 支付成功(待发货) → 4 已发货
                                       ↘ 5 已取消（释放库存）
```

| 状态 | 含义        | 触发方式                                       |
| -- | --------- | ------------------------------------------ |
| 0  | 创建订单      | 前台提交购物车结算                                  |
| 1  | 确认订单      | 用户点击「确认订单」                                 |
| 2  | 待支付       | 用户点击「去支付」                                  |
| 3  | 支付成功（待发货） | 模拟支付（`payType=0`，同时写入收款流水）                 |
| 4  | 已发货       | 后台 `POST /orders/{id}/deliver`，需填物流公司 + 单号 |
| 5  | 已取消       | 用户取消（仅 0/1/2 可取消，自动恢复库存）                   |

- 发货写入 `delivery_company` / `delivery_sn` / `delivery_time`，并记录操作轨迹；非 3 状态发货会报错：`仅「支付成功(待发货)」的订单可以发货`。
- 前台「我的订单」对已发货订单展示物流公司与单号，筛选栏支持 0~5 全状态。
- 历史数据兼容：旧库中 `status=4`（原「已取消」）在首次启动时自动迁移为 `5`。
- 创建订单扣库存、取消恢复库存；优惠券下单时抵扣，支付成功标记已用。

---

## 12. 主要接口

### 后台（`/api/admin`，需 `ROLE_ADMIN`）

| 分组      | 接口                                                                                                                                                       |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 认证      | `POST /login`                                                                                                                                            |
| 商品      | `GET/POST /products`、`GET/PUT/DELETE /products/{id}`、`PUT /products/{id}/publish`                                                                        |
| 分类 / 品牌 | `GET /productCategories/tree`、`GET /brands`、`POST/PUT/DELETE`                                                                                            |
| 订单      | `GET /orders`、`GET /orders/{id}`、`POST /orders/{id}/deliver`（body: `deliveryCompany`/`deliverySn`/`note`）、`GET /orders/{id}/track`、`DELETE /orders/{id}` |
| 权限      | `/users`、`/roles`、`/menus`、`/resources`                                                                                                                  |
| 会员中心    | `GET /members`、`GET /members/{id}`、`PUT /members/{id}`、`PUT /members/{id}/status`、`GET/POST/PUT/DELETE /memberLevels`                                    |
| 客户服务    | `GET /tickets`、`GET /tickets/{id}`、`GET /tickets/stats`、`POST /tickets/{id}/reply`、`PUT /tickets/{id}/status`、`DELETE /tickets/{id}`                     |
| 帮助中心    | `GET/POST/PUT/DELETE /helpCategories`、`GET/POST /helps`、`GET/PUT/DELETE /helps/{id}`                                                                     |
| 统计报表    | `GET /statistics/overview`、`/salesTrend`、`/topProducts`、`/orderStatus`、`/categorySales`                                                                  |
| 财务管理    | `GET /finance/overview`、`GET /finance/records`、`GET /finance/daily`、`POST /finance/records/{id}/refund`                                                  |
| 系统设置    | `GET /settings`、`PUT /settings`                                                                                                                          |

### 前台（`/api/portal`）

| 分组   | 接口                                                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 公开   | `GET /home`、`GET /products/search`、`GET /products/{id}`、`GET /products/productCategories/tree`、`GET /products/brands`、`GET /coupons/available`、`GET /help/categories`、`GET /help`、`GET /help/{id}`、`GET /settings` |
| 会员   | `POST /members/register`、`POST /members/login`、`GET/PUT /members/profile`                                                                                                                                          |
| 地址   | `GET/POST /addresses`、`PUT/DELETE /addresses/{id}`                                                                                                                                                                 |
| 购物车  | `GET/POST /cart`、`PUT/DELETE /cart/{id}`、`DELETE /cart/clear`                                                                                                                                                      |
| 优惠券  | `POST /coupons/{id}/receive`、`GET /coupons`、`POST /coupons/calculate`                                                                                                                                              |
| 订单   | `POST /orders`、`PUT /orders/{id}/confirm`、`PUT /orders/{id}/prepay`、`POST /orders/{id}/pay`、`PUT /orders/{id}/cancel`、`GET /orders`、`GET /orders/{id}`                                                             |
| 客户服务 | `POST /tickets`、`GET /tickets`、`GET /tickets/{id}`                                                                                                                                                                 |

> `GET /home` 的 `advertiseList[]` 已绑定商品：除 `id/name/pic/url/sort` 外，还返回 `productId` 与 `product{id,name,price,pic,sale}`（仅含已上线且在投放时间窗内的轮播位），前端据此渲染「轮播图 + 商品信息」并跳 `/product/{id}`。

统一响应格式：

```json
{ "code": 0, "message": "success", "data": { } }
```

`code != 0` 表示业务失败；`401` 由前端拦截器清除 token 并跳登录页。

---

## 13. 种子数据

数据由 `scripts/gen-seed-sql.mjs` 生成到 `db/seed_data.sql`（固定随机种子，结果可复现），  
应用启动时由 `SeedDataRunner` 自动执行，也可手动 `mysql < seed_data.sql`。

| 内容   | 数量                 | 说明                                         |
| ---- | ------------------ | ------------------------------------------ |
| 商品分类 | 18 个（6 一级 / 14 二级） | 手机数码、服装鞋帽、食品生鲜、家居生活、美妆个护、运动户外              |
| 品牌   | 29 个               | 每个品牌配本地 SVG 标识 `/images/brands/b{id}.svg`  |
| 商品   | 39 件               | 覆盖 14 个子类，含名称、价格、库存、销量、描述、新品/推荐标记          |
| SKU  | 67 条               | 按颜色/尺码/容量拆分，SKU 库存之和 = 商品库存                |
| 会员   | 8 个                | 统一密码 `123456`，成长值覆盖普通/黄金/铂金                |
| 收货地址 | 16 条               | 每位会员 2 条，首条为默认地址                           |
| 优惠券  | 4 张 + 15 条领用记录     | 满 199-20 / 满 999-100 / 满 2999-300 / 数码 9 折 |
| 订单   | 36 笔               | 覆盖全部 6 种状态，时间分布在近 100 天内                   |
| 订单明细 | 77 条               | 每单 1~3 件商品                                 |
| 操作历史 | 约 130 条            | 与订单状态流转时间严格对应                              |
| 收款流水 | 18 条               | 仅已支付/已发货订单生成，金额 = 订单实付                     |

**数据自洽性**（脚本内置校验，实测全部为 0）：外键孤儿、订单金额 = 明细合计、实付 = 总额 - 优惠、流水金额 = 实付、已支付必有流水、已发货必有物流、SKU 库存合计 = 商品库存。

种子数据使用固定 ID 区间，执行前先按区间清理旧数据，因此**可重复执行**且不误删业务数据：

| 表                 | ID 区间                         |
| ----------------- | ----------------------------- |
| 分类 / 品牌 / 优惠券     | 1001-1099                     |
| 商品                | 2001-2099                     |
| SKU               | 3001-3099                     |
| 会员                | 101-199                       |
| 订单 / 明细 / 历史 / 流水 | 5001+ / 6001+ / 7001+ / 8001+ |

**修改或扩充数据**：编辑 `scripts/gen-seed-sql.mjs` 顶部字典（分类/品牌/商品/会员/优惠券），执行 `node scripts/gen-seed-sql.mjs` 重新生成 SQL；商品图片按「图片文件名」字段拼成 `/images/products/xxx.jpg`。

**重置种子数据**：删除 `sys_setting` 中 `seed_version` 一行后重启，或直接重跑 `seed_data.sql`。  
**关闭自动写入**：`application.yml` 中 `mall.seed.enabled: false`。

---

## 14. 图片资源

已移除 `via.placeholder.com` 占位图，改为**下载到本地的真实图片**：

```
mall/src/main/resources/static/images/
├── products/  39 张商品图（每件种子商品一张，如 nuts.jpg / dress-women.jpg / laptop-lenovo.jpg）
├── banners/   sale.jpg  new.jpg               # 首页轮播（1600×500 裁切）
└── brands/    xiaomi.svg huawei.svg b1001~b1029.svg   # 品牌标识（本地矢量图，31 个）
```

- 商品图来源：**Pexels 免费图库**（Pexels License，可商用、无需署名），下载清单见 `scripts/download-seed-images.sh`。
- 品牌标识为脚本生成的本地 SVG 文字标识，避免使用他人商标图形。
- 数据库存相对路径（如 `/images/products/nuts.jpg`），由后端静态资源托管，**不依赖外网**。
- 四个前端均代理 `/images` 到后端，开发期直接可显示。
- `DbMigration` 启动时会把仍为占位图的历史记录替换为本地图片（仅当字段仍为 placeholder 时替换）。

> 图片为通用品类实拍图，非品牌官方产品图，仅用于演示；正式上线请替换为自有商品图。

---

## 15. 测试报告

### 15.1 全新环境验证

删库 → 仅执行 `mall.sql`（25 张表）→ 启动应用：  
`DbMigration` 建 6 张新表、`DataInitializer` 建 admin/demo 与 20 条菜单授权、`SeedDataRunner` 写入 35 条语句。  
最终 **42 商品 / 21 分类 / 31 品牌 / 9 会员 / 36 订单 / 77 明细 / 18 流水**，库内共 **31 张表**；  
`demo` 与新注册会员均可登录，后台菜单全部授权、0 条未授权 ✅

### 15.2 数据自洽校验（SQL 全表连查）

| 校验项              | 结果    |
| ---------------- | ----- |
| 外键孤儿             | 0     |
| 订单金额 vs 明细合计     | 0 差异  |
| 实付 = 总额 - 优惠     | 0 差异  |
| 流水金额 vs 实付       | 0 差异  |
| 已支付无流水 / 未支付有流水  | 0 / 0 |
| 已发货缺物流           | 0     |
| SKU 库存合计 vs 商品库存 | 0 差异  |

### 15.3 接口与端到端流程

| 场景                                                                        | 结果 |
| ------------------------------------------------------------------------- | -- |
| 商品搜索 `total=42`、分类树 6 个一级有序返回、详情含 SKU 与品牌名                                | ✅  |
| 会员 `zhangwei/123456` 登录，我的订单 5 笔（状态 0/2/3/4/5），优惠券 2 张                    | ✅  |
| 后台商品 42、会员 9、统计概览总销售 ¥74,544.2、财务流水 20 条                                  | ✅  |
| 订单时间线：创建 → 确认 → 待支付 → 支付 → 发货（中通快递 ZT1450945317），历史时间严格递增                 | ✅  |
| 图片 `/images/products/*.jpg`、`/images/brands/b*.svg` 均 `200`（jpeg/svg+xml） | ✅  |
| 工单：前台提交 → 后台回复 → 前台可见                                                     | ✅  |
| 统计 / 财务 / 设置接口                                                            | ✅  |

### 15.4 前端构建与页面验证

| 工程                     | `tsc --noEmit` | `npm run build`                 |
| ---------------------- | -------------- | ------------------------------- |
| `mall-admin-web`（Vue）  | —              | ✅                               |
| `mall-portal-web`（Vue） | —              | ✅                               |
| `mall-admin-react`     | ✅              | ✅（已按 react / antd / echarts 分包） |
| `mall-portal-react`    | ✅              | ✅（已按 react / antd 分包）           |

**Playwright + 本机 Chrome 无头实测（两套前端并行运行，共用 8080 后端）**：

| 用例               | Vue 后台         | Vue 前台             | React 后台       | React 前台               |
| ---------------- | -------------- | ------------------ | -------------- | ---------------------- |
| 首屏渲染（关键元素存在）     | ✅ 登录表单         | ✅ 轮播 `el-carousel` | ✅ 登录表单         | ✅ 轮播 `banner-carousel` |
| 控制台 error / 失败请求 | 0              | 0                  | 0              | 0                      |
| 登录后进入仪表盘并加载数据    | ✅ `/dashboard` | —                  | ✅ `/dashboard` | —                      |

**历史验证记录（React 版功能巡检）**：后台登录 → 仪表盘 → 商品（42 条）→ 订单按「待发货」筛选（10 条，发货弹窗带顺丰选项）→ 订单详情抽屉（含物流字段）→ 统计（4 图渲染）→ 会员（9 条）→ 财务 → 设置 → 帮助 → 角色分配菜单（21 节点）；前台 `zhangwei` 登录 → 订单 5 笔（含物流条）→ 已发货筛选 1 笔 → 会员 3 个 Tab → 帮助 8 篇可打开详情；`demo` 完成 加购 → 结算 → 提交 → 确认 → 待支付 → 模拟支付 全流程。控制台 **0 error、0 失败请求** ✅

**历史验证记录（首页轮播修复）**：两套前台各 22 项断言全部通过 —— 轮播展示商品名/价格、指示点可见且数量与张数一致（4 张 → 4 点；拦截为 2 张 → 2 点）、悬停出现箭头、上下张切换、循环自动播放、点击跳转 `/product/2007` 并渲染详情；补齐 `favicon.svg` 后 `/favicon.ico` 404 告警消除。

---

## 16. 常见问题

### Q1 启动前端报 `Port 517x is already in use`

四个工程均开启 `strictPort`，端口被占用会直接失败而不会静默换端口。处理方式：

```bash
# 查看占用进程（Windows）
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# 临时换端口（地址随之变化）
npx vite --port 5183
```

### Q2 `npm install` 很慢或报网络错误

本机访问 npm 官方源不稳定，四个工程已内置 `.npmrc` 指向 `https://registry.npmmirror.com`。  
若仍失败，检查 `.npmrc` 是否被覆盖，或手动指定：

```bash
npm install --registry=https://registry.npmmirror.com
```

### Q3 前端页面能开，但接口全部 404 / 提示网络错误

1. 确认后端已启动：`curl http://localhost:8080/api/portal/home`
2. 后端端口不是 8080 时，必须显式指定代理目标：  
   `VITE_API_TARGET=http://localhost:8081 npm run dev`
3. 改完 `vite.config.ts` 需重启 dev server（Vite 通常会自动重启，日志出现 `restarting server` 即可）。

### Q4 后端启动后端口不是 8080

某些环境会注入 `SERVER_PORT` 环境变量。显式指定端口即可：  
`java -jar target/mall-1.0.0.jar --server.port=8080`。

### Q5 后端启动失败：`Communications link failure`

MySQL 未启动或账号密码不符。确认：

```bash
mysql -uroot -p123456 -e "select 1"
```

必要时用环境变量覆盖：`DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD`。

### Q6 商品图片不显示（裂图 / 404）

1. 后端需运行时才托管 `/images` 静态资源；
2. 前端代理需包含 `/images`（四个工程的 `vite.config.ts` 已配置）；
3. 确认文件存在：`mall/src/main/resources/static/images/products/`。

### Q7 种子数据重复导入 / 想重置

`SeedDataRunner` 以 `sys_setting.seed_version` 判重，重复启动不会重复插入。  
重置：`DELETE FROM sys_setting WHERE setting_key='seed_version';` 后重启，或直接重跑 `seed_data.sql`（按 ID 区间清理，安全）。

### Q8 控制台提示 `Static function can not consume context`

Ant Design 5 的静态 `message` 在 `ConfigProvider` 下的已知提示，**不影响功能**。如需彻底消除，可改用 `App.useApp()` 获取 `message` 实例。

### Q9 浏览器提示 `/favicon.ico 404`

四个工程均已提供 `public/favicon.svg` 并在 `index.html` 声明，正常不应再出现；  
若仍有，检查是否用了旧版构建产物或缓存。

### Q10 Windows 终端中文日志乱码

执行 `chcp 65001` 切到 UTF-8，或改用 Windows Terminal / PowerShell 7。

### Q11 打包出的 jar 无法 `java -jar` 运行

需执行 `mvn -DskipTests package spring-boot:repackage` 生成 fat jar（普通 `package` 可能是瘦包）。

|                                                          |                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| 校验：\`unzip -p target/mall-1.0.0.jar META-INF/MANIFEST.MF | grep Main-Class`，应含 `org.springframework.boot.loader.JarLauncher\`。 |


## 18. 安全与部署须知

本项目为教学演示工程，**默认配置仅适用于本机开发**，直接暴露到公网存在风险。

| 项        | 仓库内状态                                           | 部署前要求                                                |
| -------- | ----------------------------------------------- | ---------------------------------------------------- |
| JWT 签名密钥 | 仅 `dev-only-insecure-placeholder-change-me` 占位值 | 通过 `JWT_SECRET` 注入 ≥32 字节随机串（`openssl rand -hex 32`） |
| 数据库口令    | `123456`，仅本机演示库默认值                              | 通过 `DB_PASSWORD` 覆盖；限制数据库账号权限与访问来源                   |
| 演示账号     | `admin` / `demo` 等，密码统一 `123456`                | 删除或改为强密码，禁用默认管理员                                     |
| 支付       | 模拟支付，无真实资金流转                                    | 接入真实渠道前需补全风控、幂等与对账                                   |
| 本地环境文件   | `.env`、密钥文件、`.workbuddy/` 均被 `.gitignore` 忽略    | 确认未误提交 `.env` 或任何令牌                                  |
| 日志级别     | `logging.level.com.mall: debug`、MyBatis SQL 打印  | 生产改为 `info`，关闭 SQL 输出                                |

**部署检查清单**

1. 设置 `DB_*` 与 `JWT_SECRET` 环境变量，确认 `.env` 未入库；
2. 修改 / 删除全部演示账号，重置 `sys_user`、`ums_member` 中的弱口令；
3. 关闭 `mall.seed.enabled`（避免演示数据写入生产库）；
4. 调整日志级别、CORS 白名单与 JWT 有效期；
5. 前端通过 Nginx 托管静态产物并反代 `/api`，配置 `try_files ... /index.html` 回退（见 [`docs/dual-frontend.md`](docs/dual-frontend.md)）。

> 本仓库不包含任何真实密钥、令牌或生产配置。若发现疑似敏感信息泄露，请勿在公开 Issue 中粘贴，直接联系维护者。

---

## 19. 开源许可证

本项目采用 **MIT License**，完整条款见 [`LICENSE`](LICENSE)。

- Copyright (c) 2026 **naran233**
- 允许自由使用、复制、修改、合并、发布、分发、再授权与商用，只需保留版权声明与许可声明；
- 软件按「原样」提供，不附带任何明示或暗示担保。

**第三方素材与依赖**

| 类别   | 说明                                                                 |
| ---- | ------------------------------------------------------------------ |
| 商品图片 | 来自 Pexels 免费图库（Pexels License，可商用、无需署名），为通用品类实拍图，非品牌官方产品图          |
| 品牌标识 | 项目内生成的文字 SVG，未使用他人商标图形                                             |
| 代码依赖 | Spring Boot、Vue、React、Element Plus、Ant Design、ECharts 等，各自遵循其原始许可证 |

> 正式商用前请自行替换为自有商品图，并复核所用第三方依赖的许可证兼容性。

---

## 附录：文档索引与变更记录

### 文档

| 文档                                               | 内容                                               |
| ------------------------------------------------ | ------------------------------------------------ |
| [`docs/dual-frontend.md`](docs/dual-frontend.md) | 双前端并行方案：页面 / 路由 / 状态 / 接口对照，端口并存、Nginx 路径分流、灰度回滚 |
| [`docs/carousel-fix.md`](docs/carousel-fix.md)   | 首页轮播问题排查：React 交互失效根因、Vue 未绑定商品根因、修复与验证          |

### 变更记录

| 版本   | 内容                                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------- |
| v1   | 前后端分离 MVP：前台商城 + 后台管理、模拟支付、优惠券、RBAC、订单四态                                                                         |
| v2   | 订单新增「已发货」与物流信息；图片改为本地真实图；新增六大运营模块；启动时自动迁移数据库                                                                     |
| v3   | 新增 **React 18 + Ant Design 5** 版前台/后台，与 Vue 版共用同一后端与数据库                                                          |
| v3.1 | 修复两套前台首页轮播：React 补齐点击/箭头/可见指示点；Vue 轮播位绑定商品（新增 `sms_home_advertise.product_id`）                                   |
| v3.2 | 四个前端统一 `VITE_API_TARGET` 可配置与 `strictPort`；补齐 `.npmrc` 与 `favicon.svg`；README 重构                                 |
| v3.3 | 推送至 GitHub（`naran233/mall`，`main`）：移除硬编码 JWT 密钥、补 `.env.example` 与 `.gitignore` 安全规则、新增 MIT 许可证与 README 安全/许可证章节 |
