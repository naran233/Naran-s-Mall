# 双前端（Vue / React）并行方案说明

同一套 Spring Boot 后端，同时服务 4 个前端工程：Vue 版后台/前台、React 版后台/前台。
四者共用同一套 REST 接口、同一数据库、同一 JWT 鉴权体系，可并存运行，也可按路径切换。

---

## 1. 工程与端口总览

| 工程 | 框架 | 角色 | 开发端口 | 目录 |
|---|---|---|---|---|
| mall-admin-web | Vue 3 + Element Plus | 后台管理 | 5173 | `mall-admin-web/` |
| mall-portal-web | Vue 3 + Element Plus | 前台商城 | 5174 | `mall-portal-web/` |
| mall-admin-react | React 18 + Ant Design 5 | 后台管理 | 5175 | `mall-admin-react/` |
| mall-portal-react | React 18 + Ant Design 5 | 前台商城 | 5176 | `mall-portal-react/` |
| mall | Spring Boot 3 | API 服务 | 8080 | `mall/` |

四个前端都通过 Vite 代理把 `/api`、`/images` 转发到后端，因此**后端无需为多前端做任何改动**，也无需 CORS 配置（生产可直连或由 Nginx 反代）。

---

## 2. Vue → React 对照关系

### 2.1 技术栈映射

| 能力 | Vue 版 | React 版 | 说明 |
|---|---|---|---|
| 框架 | Vue 3.4（SFC + `<script setup>`） | React 18（函数组件 + Hooks） | — |
| 构建 | Vite 5 + `@vitejs/plugin-vue` | Vite 5 + `@vitejs/plugin-react` | 均 TS |
| 路由 | Vue Router 4（`createWebHistory`） | React Router 6（`BrowserRouter` + `Routes`） | 路由表一一对应 |
| 状态 | Pinia（`defineStore`） | Zustand（`create`） | 均手动同步 localStorage |
| UI | Element Plus 2.7（中文 locale） | Ant Design 5.21（`zh_CN` locale） | 组件语义对齐 |
| 图标 | `@element-plus/icons-vue` | `@ant-design/icons` | — |
| 请求 | Axios 实例 + 拦截器 | Axios 实例 + 拦截器 | 返回结构一致 |
| 图表 | ECharts 5（手动 init/dispose） | ECharts 5（`<EChart>` 封装） | 配置项完全一致 |
| 提示/确认 | `ElMessage` / `ElMessageBox` | `message` / `Modal.confirm` | — |

### 2.2 页面与路由对照（后台）

| 路由 | Vue 文件 | React 文件 | 功能 |
|---|---|---|---|
| `/login` | `views/Login.vue` | `pages/Login.tsx` | 管理员登录 |
| `/dashboard` | `views/Dashboard.vue` | `pages/Dashboard.tsx` | 仪表盘 |
| `/product/list` | `views/product/ProductList.vue` | `pages/product/ProductList.tsx` | 商品 CRUD / 上下架 |
| `/product/category` | `views/product/CategoryList.vue` | `pages/product/CategoryList.tsx` | 分类树 CRUD |
| `/product/brand` | `views/product/BrandList.vue` | `pages/product/BrandList.tsx` | 品牌 CRUD |
| `/order/list` | `views/order/OrderList.vue` | `pages/order/OrderList.tsx` | 订单列表 / 详情 / 发货 |
| `/member/list` | `views/member/MemberList.vue` | `pages/member/MemberList.tsx` | 会员列表 / 详情 / 启禁用 |
| `/service/ticket` | `views/service/TicketList.vue` | `pages/service/TicketList.tsx` | 工单统计 / 回复 / 关闭 |
| `/cms/help` | `views/cms/HelpCenter.vue` | `pages/cms/HelpCenter.tsx` | 帮助分类 + 文章 |
| `/report/statistics` | `views/report/Statistics.vue` | `pages/report/Statistics.tsx` | 4 张 ECharts 报表 |
| `/finance/list` | `views/finance/FinanceList.vue` | `pages/finance/FinanceList.tsx` | 财务概览 / 流水 / 退款 |
| `/setting` | `views/setting/Setting.vue` | `pages/setting/Setting.tsx` | 系统设置 |
| `/sys/user` | `views/sys/UserList.vue` | `pages/sys/UserList.tsx` | 用户 + 分配角色 |
| `/sys/role` | `views/sys/RoleList.vue` | `pages/sys/RoleList.tsx` | 角色 + 分配菜单/资源 |
| `/sys/menu` | `views/sys/MenuList.vue` | `pages/sys/MenuList.tsx` | 菜单树 CRUD |
| `/sys/resource` | `views/sys/ResourceList.vue` | `pages/sys/ResourceList.tsx` | 资源 CRUD |

### 2.3 页面与路由对照（前台）

| 路由 | Vue 文件 | React 文件 | 功能 |
|---|---|---|---|
| `/` | `views/Home.vue` | `pages/Home.tsx` | 分类导航 / 轮播 / 三个商品楼层 / 品牌 |
| `/products` | `views/ProductList.vue` | `pages/ProductList.tsx` | 搜索 / 排序 / 分页 |
| `/product/:id` | `views/ProductDetail.vue` | `pages/ProductDetail.tsx` | 详情 / SKU / 加购 |
| `/cart`（需登录） | `views/Cart.vue` | `pages/Cart.tsx` | 勾选 / 改数量 / 结算 |
| `/checkout`（需登录） | `views/Checkout.vue` | `pages/Checkout.tsx` | 地址 / 优惠券 / 提交订单 |
| `/orders`（需登录） | `views/OrderList.vue` | `pages/OrderList.tsx` | 五态流转 + 物流展示 |
| `/member`（需登录） | `views/Member.vue` | `pages/Member.tsx` | 资料 / 优惠券 / 地址 |
| `/service`（需登录） | `views/Service.vue` | `pages/Service.tsx` | 提交工单 + 我的工单 |
| `/help` | `views/Help.vue` | `pages/Help.tsx` | 帮助中心 |
| `/login` | `views/Login.vue` | `pages/Login.tsx` | 登录 / 注册 |

---

## 3. React 工程目录组织

两套 React 工程采用相同的分层，与 Vue 版保持一一对应：

```
mall-admin-react/
├── index.html
├── vite.config.ts          # 端口 5175 + /api、/images 代理（VITE_API_TARGET 可覆盖）
├── tsconfig.json
└── src/
    ├── main.tsx            # ConfigProvider(zhCN) + BrowserRouter + App
    ├── App.tsx             # 路由表
    ├── router/index.tsx    # 路由标题、RequireAuth 守卫
    ├── layout/AdminLayout.tsx
    ├── store/user.ts       # Zustand：token/username/nickName/menus
    ├── api/
    │   ├── request.ts      # axios 实例 + 拦截器 + http 泛型封装
    │   └── admin.ts        # 全部后台接口
    ├── components/EChart.tsx
    ├── styles/global.css
    └── pages/…             # 15 个页面（按业务域分组）
```

```
mall-portal-react/
├── vite.config.ts          # 端口 5176
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── router/index.tsx    # RequireAuth（未登录跳 /login?redirect=…）
    ├── layout/PortalLayout.tsx
    ├── store/member.ts     # Zustand：token/memberId/nickname/username
    ├── api/{request,portal}.ts
    ├── styles/global.css
    └── pages/…             # 10 个页面
```

### 状态管理对照

| Vue（Pinia） | React（Zustand） |
|---|---|
| `defineStore('adminUser', { state, actions })` | `create<UserState>((set) => ({...}))` |
| `store.$state` 响应式 | `useUserStore()` 订阅切片 |
| `store.login()` / `store.logout()` | 同名方法，内部 `set()` 并写 localStorage |
| `localStorage: admin_token / admin_username / admin_nick / admin_menus` | 完全一致 |
| `member_token / member_id / member_nick / member_username` | 完全一致 |

> 两套前端使用相同的 localStorage key，方便同一浏览器切换框架调试；不同端口属于不同 origin，实际互不影响。

### 接口调用方式

```ts
// 统一响应体
interface ApiResult<T> { code: number; message: string; data: T }

// 请求拦截：自动带 Authorization: Bearer <token>
// 响应拦截：code !== 200 时 message.error；401 清除 token 并跳登录
```

页面中直接调用领域函数，不写 URL：

```ts
const r = await getProducts({ keyword, pageNum, pageSize })
setRows(r.data.list); setTotal(r.data.total)
```

全部接口清单与 Vue 版 `api/admin.ts`、`api/portal.ts` 完全一致（逐行对应）。

---

## 4. 启动方式

```bash
# 0) 后端（先启动，默认 8080）
cd mall && mvn spring-boot:run

# 1) Vue 版
cd mall-admin-web  && npm install && npm run dev   # http://localhost:5173
cd mall-portal-web && npm install && npm run dev   # http://localhost:5174

# 2) React 版
cd mall-admin-react  && npm install && npm run dev # http://localhost:5175
cd mall-portal-react && npm install && npm run dev # http://localhost:5176
```

后端不在 8080 时，React 版无需改代码：

```bash
VITE_API_TARGET=http://localhost:8081 npm run dev
```

生产构建：

```bash
npm run build      # 产物在 dist/
npm run typecheck  # tsc --noEmit
```

---

## 5. 两套前端的接入与切换

### 方式 A：端口并存（开发默认）

四个前端同时运行，各自代理到同一后端。切换只需换浏览器地址：

- 后台：Vue `5173` ↔ React `5175`
- 前台：Vue `5174` ↔ React `5176`

数据、账号、订单完全互通（同一数据库），可在 Vue 后台发货、在 React 前台查看物流。

### 方式 B：Nginx 路径分流（生产推荐）

按路径把两套框架挂到同一域名下，后端统一 `/api`：

```nginx
server {
    listen 80;
    server_name mall.example.com;
    root /usr/share/nginx/html;

    # 后端
    location /api/    { proxy_pass http://127.0.0.1:8080; proxy_set_header Host $host; }
    location /images/ { proxy_pass http://127.0.0.1:8080; }

    # 后台：Vue 版 /admin-vue，React 版 /admin
    location /admin-vue/ { alias /usr/share/nginx/html/admin-vue/; try_files $uri $uri/ /admin-vue/index.html; }
    location /admin/     { alias /usr/share/nginx/html/admin-react/; try_files $uri $uri/ /admin/index.html; }

    # 前台：Vue 版 /portal-vue，React 版 /portal
    location /portal-vue/ { alias /usr/share/nginx/html/portal-vue/; try_files $uri $uri/ /portal-vue/index.html; }
    location /portal/     { alias /usr/share/nginx/html/portal-react/; try_files $uri $uri/ /portal/index.html; }
}
```

子路径部署时需给对应 Vite 工程加 `base`：

```ts
// vite.config.ts
export default defineConfig({ base: '/admin/', /* … */ })
```

并把 React Router 的 `basename`、Vue Router 的 `createWebHistory('/admin/')` 设为同一路径。

### 方式 C：灰度切换

先只让内部使用 React 版（5175/5176），观察一段时间；
确认无误后把 Nginx 的 `/admin`、`/portal` 指向 React 构建产物，Vue 版保留在 `/admin-vue`、`/portal-vue` 作为回滚路径。两者共用后端，回滚无需迁移数据。

### 账号与登录态

- 后台：`admin / 123456`（Vue、React 后台通用）
- 前台：`demo / 123456`（Vue、React 前台通用）
- 登录态按 origin 隔离：`localhost:5173` 的登录不会带到 `localhost:5175`，切换后需重新登录一次。

---

## 6. 新增页面时两边如何同步

1. 在 `api/admin.ts`（或 `portal.ts`）加接口函数 —— 两个框架同名同签名。
2. Vue：`views/` 新建 `.vue`，`router/index.ts` 注册路由。
3. React：`pages/` 新建 `.tsx`，`App.tsx` 注册 `<Route>`，`router/index.tsx` 补标题（后台）。
4. 状态放 store，页面不直接读 localStorage（除 token 判断）。
5. 改完各自跑 `npm run typecheck && npm run build`。
