# 首页轮播图问题排查与修复

涉及两端前台（React / Vue）+ 后端首页接口。两处问题现象不同、根因也不同，分别记录如下。

---

## 一、React 前台：轮播图「无法正常操作」

### 现象

- 点击轮播图没有任何反应（不跳转商品详情）。
- 只能等自动播放，找不到可用的切换控件：没有左右箭头；底部指示点几乎看不见。
- 鼠标按住拖动也不换图。

### 涉及组件与数据来源

| 项 | 内容 |
|---|---|
| 页面 | `mall-portal-react/src/pages/Home.tsx` |
| 组件 | `antd` v5.29 `Carousel`（底层 `@ant-design/react-slick`） |
| 数据 | `GET /api/portal/home` → `data.advertiseList[]`（`sms_home_advertise` 表） |
| 关键字段 | `id / name / pic / url`；`url` 在种子数据里是**空串** |

### 根因（4 条，均已实测确认）

1. **轮播图本身没有点击行为**：原代码只渲染 `<img>`，没有 `onClick`；同时后端下发的 `url` 为空串，
   即「点了要去哪」这条数据链路是断的 → 点击必然无反应。
2. **没有左右箭头**：`Carousel` 未开启 `arrows`，用户只能靠自动播放。
3. **指示点不可见**：antd 默认 `.slick-dots li button` 只有 **3px 高、`opacity: 0.2` 的白色**，
   叠在浅色/高饱和底图（如 `sale.jpg` 的红色气球、白色纸袋）上实测几乎完全看不见。
4. **自定义箭头无效**：尝试用 `prevArrow/nextArrow` 传自定义 `<button class="banner-arrow">` 时，
   antd 会用自己的 `className` 覆盖节点（实测渲染成 `class="slick-arrow slick-prev"`，自定义 class 丢失），
   且 `.slick-arrow` 样式把 `font-size` 置 0，箭头字符因此既不可见也点不到。

> 附带发现：react-slick 在 `infinite` 下会额外渲染克隆节点（2 张图时 DOM 里是 5 个 `.slick-slide`），
> 属于该库内部实现；只要循环/下标计算正确就不影响交互，本次未做改动，仅记录以免误判。

### 修复

- 新增 `mall-portal-react/src/components/BannerCarousel.tsx`，把轮播从页面里抽出来统一处理：
  - 整张图 `role="button" tabIndex=0`，点击/回车跳转：优先 `productId`（`/product/{id}`），
    其次 `url`（外链走 `window.open`，站内走 `navigate`）；无目标时不显示手型光标。
  - **左右箭头由组件自己渲染**（`.banner-arrow`），通过 `CarouselRef` 调 `prev()/next()`，
    不再依赖 antd 的 `prevArrow/nextArrow`（避开 className 被覆盖的问题）。
  - 指示点用 `dots={{ className: 'banner-dots' }}` 加自定义样式：4px 高胶囊条 + 深色半透明底衬。
  - 空数据时不挂载 `Carousel`，直接渲染占位块（避免以 0 张初始化再变更子节点）。
  - 以 `banners.map(id).join('_')` 作 `key`，数据变化时整组件重建，循环下标不会错位。
- `mall-portal-react/src/styles/global.css` 新增轮播样式：`.banner-wrap / .banner-slide / .banner-info /
  .banner-arrow / .banner-dots`，含左侧压暗渐变，保证任何底图上的白字都可读。
- `Home.tsx` 改为 `<BannerCarousel banners={home.advertiseList || []} height={320} />`。

### 验证（Playwright + 本机 Chrome，无头）

```
PASS 指示点可见       {"w":"32px","h":"4px","bg":"rgb(255,255,255)","op":"1"}
PASS 左右箭头存在      鼠标悬停后 opacity 0 → 1
PASS 箭头切换生效      1 → 2      PASS 上一张生效 2 → 1
PASS 指示点切换生效    1 → 2      PASS 自动播放循环 2 → 3
PASS 点击轮播跳详情    /product/2007（索尼 WH-1000XM5）
PASS 控制台 0 报错、0 失败请求
```

---

## 二、Vue 前台：轮播图未与商品数据绑定

### 现象

- 轮播位只是几张纯图片，看不出对应哪件商品，点击也不会进商品详情。
- 轮播位恰好 2 张时，底部出现 **4 个指示点**（点第 3、4 个仍停在同一张图）。

### 涉及组件与数据来源

| 项 | 内容 |
|---|---|
| 页面 | `mall-portal-web/src/views/Home.vue` |
| 组件 | `element-plus` v2.14.7 `el-carousel` / `el-carousel-item` |
| 数据 | `GET /api/portal/home` → `data.advertiseList[]`（`sms_home_advertise`） |
| 原模板 | `<el-carousel-item v-for="a in home.advertiseList"><img :src="a.pic"/></el-carousel-item>` |

### 根因

1. **数据模型里没有建立「轮播位 → 商品」的关联**：`sms_home_advertise` 只有 `pic`（图）和 `url`（空串），
   没有 `product_id`；接口原样返回，前端自然拿不到商品名/价格/商品 ID，只能当装饰图渲染。
2. **前端只用了 `a.pic`**：没有点击跳转逻辑，也没有商品信息展示位。
3. **Element Plus 的 2 张边界**：`useCarousel` 里 `PlaceholderItem` 在「子项恰好 2 个 + `loop`」时
   会把 slot 内容渲染两遍（`normalizeSlots.length === 2 && props.loop`），子项被重复注册，
   于是 2 张图变成 4 个 `.el-carousel__item`、4 个指示点。

### 修复

**后端（两套前端共用）**

- `sms_home_advertise` 新增 `product_id BIGINT NULL`（`db/mall.sql` 建表语句 + `DbMigration` 幂等 `ALTER`）。
- `DbMigration.migrateAdvertiseProduct()`：
  - 把「双十一狂欢」→ `HONOR-M6P`、「新品首发」→ `LENOVO-XP16`；
  - 仍未绑定的轮播位兜底指向销量最高的在售商品（避免出现点了没反应的图）；
  - 回写 `url = /product/{product_id}`，兼容仍按 `url` 跳转的调用方；
  - 幂等补 2 张轮播位（数码焕新季 → `SONY-XM5`、美味零食节 → `LAYS-CHIPS`），首页共 4 张。
- `HomeController` 新增 `buildBanners()`：只取「已上线且在投放时间窗内」的轮播位，
  批量查商品后组装 `HomeBannerVO`，在原字段基础上补 `productId` 与 `product{id,name,price,pic,sale}`。
  接口契约向后兼容（原有字段不变，只增字段）。

**Vue 前端**

- `Home.vue` 用 `banners`（= `advertiseList`）驱动 `el-carousel`，每屏渲染
  「轮播图 + 商品名 + 价格/已售 + 立即抢购」，点击按 `productId` → `/product/{id}`，其次 `url`。
- 开启 `arrow="hover"`、`indicator-position="inside"`；指示点改为胶囊条 + 深色半透明底衬。
- `:loop="banners.length !== 2"`：规避 Element Plus 2 张时的重复渲染（此时自动播放播到末张即停）。
- 左侧文案统一压一层渐变暗角，保证商品名/价格在任何底图上可读。

### 验证

```
PASS 轮播渲染商品信息    荣耀 Magic6 Pro 16GB+512GB 5G手机（￥4999 已售 1860）
PASS 指示点数量=4        与实际 4 张轮播一致
PASS 指示点切换生效      0 → 1
PASS 左右箭头存在并生效  1 → 2
PASS 点击轮播跳详情      /product/2007
PASS 控制台 0 报错
PASS 仅 2 张时指示点=2   （接口拦截只返回前 2 张，验证边界已规避）
```

---

## 三、涉及文件

| 文件 | 变更 |
|---|---|
| `mall/src/main/java/com/mall/config/DbMigration.java` | 新增 `product_id` 字段、轮播位绑商品、补 2 张轮播位 |
| `mall/src/main/java/com/mall/portal/controller/HomeController.java` | `buildBanners()`：时间窗过滤 + 关联商品 |
| `mall/src/main/java/com/mall/portal/dto/HomeBannerVO.java` | 新增轮播视图对象（含商品摘要） |
| `mall/src/main/java/com/mall/mbg/entity/SmsHomeAdvertise.java` | 增加 `productId` 字段 |
| `mall/src/main/resources/db/mall.sql` | 建表语句补 `product_id` |
| `mall-portal-react/src/components/BannerCarousel.tsx` | 新增，轮播交互 + 商品绑定 |
| `mall-portal-react/src/pages/Home.tsx` | 改用 `BannerCarousel` |
| `mall-portal-react/src/styles/global.css` | 轮播样式（箭头/圆点/暗角/悬浮态） |
| `mall-portal-web/src/views/Home.vue` | 轮播绑定商品、点击跳转、箭头与指示点样式、2 张边界规避 |
| `mall-portal-react/public/favicon.svg`、`mall-portal-web/public/favicon.svg` | 补站点图标，消除 `/favicon.ico` 404 |
| `mall-portal-web/vite.config.ts` | 代理地址支持 `VITE_API_TARGET`（与 React 版一致） |

## 四、如何复验

```bash
# 后端（第一次启动会把 product_id 迁移好、轮播位绑好商品）
cd mall && mvn spring-boot:run            # 8080；也可 java -jar target/mall-1.0.0.jar --server.port=8081
curl -s localhost:8080/api/portal/home | jq '.data.advertiseList'   # 看 productId / product 字段

# React 前台
cd mall-portal-react && npm run dev       # 5176（后端非 8080 时：VITE_API_TARGET=http://localhost:8081 npm run dev）
# Vue 前台
cd mall-portal-web && npm run dev         # 5174（同上）
```

页面上的检查点：轮播图左上出现「标签 + 商品名 + ￥价格 + 已售」；悬停出现左右箭头；
底部胶囊指示点可点；点任意一张进入对应 `/product/{id}`；播放一张后循环回第一张不跳帧。
