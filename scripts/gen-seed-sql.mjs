/**
 * 种子数据生成器：生成 mall/src/main/resources/db/seed_data.sql
 *
 * 设计要点：
 * 1. 所有种子记录使用固定 ID 区间（分类 1004-1099 / 品牌 1001-1099 / 商品 2001-2099 /
 *    会员 101-199 / 订单 5001-5099 ...），脚本开头按区间清理，可重复执行且不影响用户自有数据。
 * 2. 订单金额、优惠、时间线、操作历史、收款流水都由同一份数据推导，保证各表之间金额与状态自洽。
 * 3. 使用固定随机种子，多次生成结果一致。
 *
 * 用法：node scripts/gen-seed-sql.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../mall/src/main/resources/db/seed_data.sql')
const SEED_VERSION = '2026.11.01'

// ---------------- 固定随机数（可复现） ----------------
let seed = 20261101
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
const int = (min, max) => min + Math.floor(rnd() * (max - min + 1))

// ---------------- 基础字典 ----------------
// 注意：保留旧数据的 1/2/3 分类（手机数码/智能手机/智能穿戴），新品类使用 1000+ 段
const CATEGORIES = [
  [1004, 1, '数码配件', 1, 3, '耳机'],
  [1005, 1, '电脑办公', 1, 4, 'Monitor'],
  [1010, 0, '服装鞋帽', 0, 2, 'ShoppingBag'],
  [1011, 1010, '男装', 1, 1, null],
  [1012, 1010, '女装', 1, 2, null],
  [1013, 1010, '鞋靴', 1, 3, null],
  [1020, 0, '食品生鲜', 0, 3, 'Food'],
  [1021, 1020, '休闲零食', 1, 1, null],
  [1022, 1020, '粮油调味', 1, 2, null],
  [1023, 1020, '生鲜水果', 1, 3, null],
  [1030, 0, '家居生活', 0, 4, 'HomeFilled'],
  [1031, 1030, '家纺布艺', 1, 1, null],
  [1032, 1030, '厨房用具', 1, 2, null],
  [1040, 0, '美妆个护', 0, 5, 'MagicStick'],
  [1041, 1040, '护肤', 1, 1, null],
  [1042, 1040, '彩妆', 1, 2, null],
  [1050, 0, '运动户外', 0, 6, 'Basketball'],
  [1051, 1050, '运动装备', 1, 1, null]
]

const BRANDS = [
  [1001, '荣耀', '#0A5CFF'], [1002, 'OPPO', '#1B9E4B'], [1003, 'vivo', '#415FFF'],
  [1004, '苹果', '#333333'], [1005, '索尼', '#111111'], [1006, '罗技', '#00A0DF'],
  [1007, '联想', '#E2231A'], [1008, '优衣库', '#FF0000'], [1009, 'ZARA', '#111111'],
  [1010, '波司登', '#C8102E'], [1011, '回力', '#D62828'], [1012, '李宁', '#E60012'],
  [1013, '百丽', '#8B1A1A'], [1014, '三只松鼠', '#F5A623'], [1015, '良品铺子', '#E4393C'],
  [1016, '乐事', '#FFC220'], [1017, '三顿半', '#4A4A4A'], [1018, '金龙鱼', '#E2231A'],
  [1019, '佳沃', '#4CAF50'], [1020, '果之鲜', '#FF7043'], [1021, '水星家纺', '#2E5EAA'],
  [1022, '洁丽雅', '#00A3B4'], [1023, '苏泊尔', '#C7000B'], [1024, '美的', '#00A0E9'],
  [1025, '珀莱雅', '#E4007F'], [1026, '薇诺娜', '#7B4FA0'], [1027, '花西子', '#C9A227'],
  [1028, '完美日记', '#F2385A'], [1029, '迪卡侬', '#3643BA']
]

// [id, 分类, 品牌, 名称, 编码, 价格, 销量, 库存, 图片, 规格数组, 描述, 是否新品, 是否推荐]
const PRODUCTS = [
  [2001, 2, 1001, '荣耀 Magic6 Pro 16GB+512GB 5G手机', 'HONOR-M6P', 4999.00, 1860, 150, 'phone-honor.jpg',
    ['绒黑色', '麦浪金'], '第三代骁龙8旗舰芯片，5000万潜望长焦，5450mAh 青海湖电池。', 1, 1],
  [2002, 2, 1002, 'OPPO Find X7 Ultra 16GB+512GB', 'OPPO-X7U', 5999.00, 940, 120, 'phone-oppo.jpg',
    ['大漠银月', '海阔天空'], '双潜望长焦系统，哈苏影像调校，100W 超级闪充。', 1, 1],
  [2003, 2, 1003, 'vivo X100 Pro 12GB+256GB', 'VIVO-X100P', 4999.00, 1120, 130, 'phone-vivo.jpg',
    ['星迹蓝', '辰夜黑'], '蔡司一英寸主摄，天玑9300 平台，5400mAh 蓝海电池。', 0, 1],
  [2004, 2, 1004, 'Apple iPhone 15 Pro 256GB', 'APPL-IP15P', 7999.00, 2350, 90, 'phone-iphone.jpg',
    ['原色钛金属', '黑色钛金属'], 'A17 Pro 芯片，钛金属边框，支持 USB-C 与操作按钮。', 0, 1],
  [2005, 3, 2, '华为 WATCH GT 4 46mm 智能手表', 'HW-WGT4', 1488.00, 760, 200, 'watch-huawei.jpg',
    ['曜石黑', '云杉绿'], '1.43 英寸 AMOLED 屏，14 天续航，全天候心率与血氧监测。', 1, 1],
  [2006, 3, 1004, 'Apple Watch Series 9 GPS 45mm', 'APPL-AWS9', 2999.00, 520, 80, 'watch-apple.jpg',
    ['午夜色', '星光色'], 'S9 SiP 芯片，双指互点操作，2000 尼特高亮屏。', 0, 0],
  [2007, 1004, 1005, '索尼 WH-1000XM5 头戴式降噪耳机', 'SONY-XM5', 2499.00, 430, 100, 'headphone-sony.jpg',
    ['黑色', '铂金银'], '双芯降噪，30 小时续航，LDAC 高解析音质。', 1, 1],
  [2008, 1004, 1, '小米 Buds 4 Pro 真无线蓝牙耳机', 'MI-BUDS4P', 999.00, 1580, 300, 'earbuds-xiaomi.jpg',
    ['星阑金', '月影黑'], '48dB 深度降噪，双设备连接，单次续航 9 小时。', 0, 1],
  [2009, 1004, 1006, '罗技 MX Master 3S 无线鼠标', 'LOGI-MXM3S', 699.00, 680, 220, 'mouse-logitech.jpg',
    ['石墨黑', '浅灰色'], '8000DPI 传感器，静音按键，可同时连接三台设备。', 0, 0],
  [2010, 1005, 1007, '联想小新 Pro 16 2024 轻薄笔记本', 'LENOVO-XP16', 5499.00, 320, 70, 'laptop-lenovo.jpg',
    ['锐龙版', '酷睿版'], '16 英寸 2.5K 120Hz 屏，32GB 内存，1TB 固态硬盘。', 1, 1],

  [2011, 1011, 1008, '男士纯棉牛津纺长袖衬衫', 'UNIQLO-OXF', 199.00, 2400, 400, 'shirt-men.jpg',
    ['白色 M', '蓝色 L', '浅灰 XL'], '100% 精梳棉牛津纺，免烫抗皱，通勤百搭。', 0, 1],
  [2012, 1011, 1008, '男士加绒连帽卫衣', 'UNIQLO-HOOD', 259.00, 3100, 350, 'hoodie-men.jpg',
    ['黑色 L', '灰色 XL'], '380g 加厚棉，内里抓绒，宽松落肩版型。', 1, 1],
  [2013, 1012, 1009, '女士法式碎花连衣裙', 'ZARA-DRS', 399.00, 1520, 260, 'dress-women.jpg',
    ['S', 'M', 'L'], '雪纺面料，收腰显瘦，法式方领设计。', 1, 1],
  [2014, 1012, 1009, '女士羊毛混纺针织衫', 'ZARA-KNIT', 329.00, 980, 300, 'sweater-women.jpg',
    ['米白 M', '焦糖 L'], '羊毛混纺纱线，柔软亲肤，微微宽松廓形。', 0, 0],
  [2015, 1011, 1010, '男士轻量羽绒服', 'BOSIDENG-DOWN', 899.00, 640, 150, 'down-jacket.jpg',
    ['黑色 L', '藏青 XL'], '90% 白鸭绒，蓬松度 800+，可收纳便携。', 0, 1],
  [2016, 1013, 1011, '复古帆布休闲鞋', 'WARRIOR-CVS', 159.00, 4200, 500, 'sneakers-canvas.jpg',
    ['白色 41', '黑色 42', '米色 43'], '经典硫化工艺，加厚鞋垫，耐磨防滑大底。', 0, 1],
  [2017, 1013, 1012, '专业缓震跑步鞋', 'LINING-RUN', 469.00, 1760, 280, 'running-shoes.jpg',
    ['黑白 42', '荧光绿 43'], '䨻科技中底，回弹缓震，透气飞织鞋面。', 1, 1],
  [2018, 1013, 1013, '女士真皮乐福鞋', 'BELLE-LOAF', 599.00, 520, 160, 'loafers.jpg',
    ['黑色 37', '棕色 38'], '头层牛皮，柔软内里，通勤一脚蹬。', 0, 0],

  [2019, 1021, 1014, '每日坚果混合装 750g（30小包）', 'SSQS-NUTS', 89.90, 6800, 800, 'nuts.jpg',
    ['750g 装'], '六种坚果果干科学配比，独立小包，每日一袋。', 0, 1],
  [2020, 1021, 1015, '手撕面包早餐糕点 1kg', 'LPPZ-BREAD', 39.90, 9200, 1000, 'bread.jpg',
    ['原味 1kg'], '低温发酵面团，现烤直发，松软拉丝。', 0, 1],
  [2021, 1021, 1016, '原切薯片组合装 5袋', 'LAYS-CHIPS', 29.90, 12000, 1200, 'chips.jpg',
    ['原味+黄瓜+烧烤'], '整片马铃薯原切，非油炸工艺，酥脆不油腻。', 0, 0],
  [2022, 1021, 1017, '冷萃咖啡液 10条装', 'SATURNBIRD-COF', 79.00, 3600, 600, 'coffee.jpg',
    ['经典黑咖', '生椰风味'], '低温冷萃 12 小时，0 糖 0 脂，冷热皆宜。', 1, 1],
  [2023, 1022, 1018, '东北五常大米 5kg', 'JLY-RICE5', 69.90, 5400, 700, 'rice.jpg',
    ['5kg 装'], '五常核心产区稻花香 2 号，当季新米，粒粒饱满。', 0, 1],
  [2024, 1022, 1018, '五谷杂粮组合装 2kg', 'JLY-GRAIN2', 45.90, 2100, 450, 'grains.jpg',
    ['2kg 装'], '八种杂粮独立分装，粗细搭配，煮粥更方便。', 0, 0],
  [2025, 1022, 1018, '有机纯燕麦片 1kg', 'JLY-OATS1', 32.90, 3300, 600, 'oats.jpg',
    ['1kg 袋装'], '有机认证裸燕麦，0 添加蔗糖，冲泡即食。', 0, 0],
  [2026, 1023, 1019, '智利进口车厘子 JJ级 2kg', 'JOYVIO-CHERRY', 159.00, 1450, 300, 'cherries.jpg',
    ['2kg 礼盒'], '智利空运直达，果径 28-30mm，脆甜多汁。', 1, 1],
  [2027, 1023, 1020, '新疆阿克苏冰糖心苹果 5斤', 'GZX-APPLE5', 49.90, 3900, 500, 'apples.jpg',
    ['5斤 装'], '昼夜温差大，果心透明糖心，脆甜化渣。', 0, 1],
  [2028, 1023, 1020, '海南金钻凤梨 2个装', 'GZX-PINE2', 39.90, 2600, 400, 'pineapple.jpg',
    ['2个 装'], '树上熟金钻凤梨，免盐水浸泡，甜度高。', 0, 0],

  [2029, 1031, 1021, '全棉印花四件套 1.8m床', 'MERCURY-BED4', 399.00, 860, 200, 'bedding.jpg',
    ['1.8m 灰', '1.8m 米白'], '60 支长绒棉，活性印染，亲肤透气。', 0, 1],
  [2030, 1031, 1022, '抗菌纯棉浴巾 70×140cm', 'GRACE-TOWEL', 79.00, 2800, 400, 'towel.jpg',
    ['白色', '灰色'], '新疆长绒棉，A 类婴幼儿标准，吸水速干。', 0, 0],
  [2031, 1032, 1023, '不粘炒锅 32cm 无油烟', 'SUPOR-WOK32', 269.00, 1450, 250, 'wok.jpg',
    ['32cm 带盖'], '铝合金锅体，蜂窝不粘涂层，燃气电磁炉通用。', 0, 1],
  [2032, 1032, 1024, '多功能电煮锅 1.5L', 'MIDEA-COOK15', 199.00, 1900, 300, 'cooker.jpg',
    ['1.5L 白'], '煮炒蒸炖一体，宿舍租房适用，防干烧保护。', 1, 0],

  [2033, 1041, 1025, '烟酰胺美白精华液 30ml', 'PROYA-SERUM30', 239.00, 2300, 350, 'serum.jpg',
    ['30ml 装'], '5% 烟酰胺复配，提亮均匀肤色，温和不刺激。', 0, 1],
  [2034, 1041, 1026, '玻尿酸补水面膜 20片装', 'WINONA-MASK20', 159.00, 3600, 500, 'face-mask.jpg',
    ['20片 装'], '三重玻尿酸，医用级无纺布，敏感肌可用。', 0, 1],
  [2035, 1042, 1027, '丝绒雾面口红 3.5g', 'HXZ-LIP', 129.00, 2600, 400, 'lipstick.jpg',
    ['#M302 枫叶红', '#M101 豆沙色'], '丝绒雾面质地，显色饱满不拔干。', 1, 1],
  [2036, 1042, 1028, '轻薄持妆粉底液 30ml', 'PERFECT-DIARY-FDN', 169.00, 1800, 300, 'foundation.jpg',
    ['W01 自然色', 'C02 象牙白'], '轻薄水润，12 小时持妆，不易脱妆。', 0, 0],

  [2037, 1051, 1012, '天然橡胶防滑瑜伽垫 6mm', 'LINING-YOGA6', 129.00, 2100, 350, 'yoga-mat.jpg',
    ['6mm 紫色', '6mm 灰色'], '天然橡胶底层，双面防滑，附赠收纳带。', 0, 1],
  [2038, 1051, 1029, '可调节哑铃 20kg（一对）', 'DECATH-DB20', 399.00, 760, 150, 'dumbbell.jpg',
    ['20kg 一对'], '快速调节卡扣，包胶防滑，家用力量训练。', 1, 0],
  [2039, 1051, 1029, '户外双肩背包 30L 防泼水', 'DECATH-BP30', 299.00, 1240, 200, 'backpack.jpg',
    ['30L 黑色', '30L 军绿'], '耐磨防泼水面料，独立电脑仓，透气背负系统。', 0, 1]
]

// 会员（密码统一 123456，复用演示账号的 BCrypt 哈希）
const MEMBER_PWD = '$2a$10$cyIX2fYrtYwYT1qbQNXkIO99EkQcPI7ExQexu9fZXPX7OLADzOi2m'
const MEMBERS = [
  [101, 'zhangwei', '张伟', '13800001001', '男', '北京', 3200, 400],
  [102, 'lina', '李娜', '13800001002', '女', '上海', 8600, 380],
  [103, 'wangfang', '王芳', '13800001003', '女', '广州', 1500, 350],
  [104, 'liuyang', '刘洋', '13800001004', '男', '深圳', 450, 300],
  [105, 'chenjing', '陈静', '13800001005', '女', '杭州', 6200, 260],
  [106, 'zhaolei', '赵磊', '13800001006', '男', '成都', 120, 200],
  [107, 'sunyu', '孙宇', '13800001007', '男', '武汉', 0, 150],
  [108, 'zhoumin', '周敏', '13800001008', '女', '西安', 2100, 120]
]

// 优惠券（type 0 满减 / 1 折扣；amount 折扣券为折扣率）
const COUPONS = [
  [1001, '满199减20', 0, 20.00, 199.00, 2, 5000],
  [1002, '满999减100', 0, 100.00, 999.00, 1, 3000],
  [1003, '满2999减300', 0, 300.00, 2999.00, 1, 1500],
  [1004, '数码9折券', 1, 0.90, 1000.00, 1, 800]
]

// ---------------- 工具函数 ----------------
const pad = (n, w = 2) => String(n).padStart(w, '0')
const fmtDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
const q = (s) => (s === null || s === undefined ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`)
const money = (n) => Number(n).toFixed(2)
const addDays = (d, days) => new Date(d.getTime() + days * 86400000)
const addMin = (d, m) => new Date(d.getTime() + m * 60000)
const NOW = new Date()

const out = []
const push = (s = '') => out.push(s)

// ---------------- 1. 清理旧种子数据 ----------------
push('-- ============================================================')
push('-- mall 种子数据（由 scripts/gen-seed-sql.mjs 生成，请勿手工编辑）')
push('-- 覆盖：多品类商品 / 商品图片 / 会员账户 / 收货地址 / 优惠券 / 订单全状态样本')
push('-- 可重复执行：先按固定 ID 区间清理种子数据，再整体重建，不影响用户自有数据')
push('-- 生成时间：' + fmtDate(NOW))
push('-- ============================================================')
push('USE mall;')
push('')
push('DELETE FROM oms_order_operate_history WHERE order_id BETWEEN 5001 AND 5099;')
push('DELETE FROM oms_order_item           WHERE order_id BETWEEN 5001 AND 5099;')
push('DELETE FROM oms_payment_record       WHERE order_id BETWEEN 5001 AND 5099;')
push('DELETE FROM oms_order                WHERE id BETWEEN 5001 AND 5099;')
push('DELETE FROM oms_cart_item            WHERE member_id BETWEEN 101 AND 199;')
push('DELETE FROM ums_member_coupon        WHERE member_id BETWEEN 101 AND 199;')
push('DELETE FROM ums_member_receive_address WHERE member_id BETWEEN 101 AND 199;')
push('DELETE FROM ums_member               WHERE id BETWEEN 101 AND 199;')
push('DELETE FROM pms_sku_stock            WHERE id BETWEEN 3001 AND 3099;')
push('DELETE FROM pms_product              WHERE id BETWEEN 2001 AND 2099;')
push('DELETE FROM pms_product_category     WHERE id BETWEEN 1001 AND 1099;')
push('DELETE FROM pms_brand                WHERE id BETWEEN 1001 AND 1099;')
push('DELETE FROM sms_home_recommend_product WHERE id BETWEEN 1001 AND 1099;')
push('DELETE FROM sms_coupon               WHERE id BETWEEN 1001 AND 1099;')
push('')

// ---------------- 2. 分类 ----------------
push('-- ---------------- 商品分类（新增 5 个一级品类） ----------------')
push('INSERT INTO pms_product_category (id, parent_id, name, level, sort, icon, description) VALUES')
push(
  CATEGORIES.map(([id, pid, name, level, sort, icon]) =>
    `(${id}, ${pid}, ${q(name)}, ${level}, ${sort}, ${q(icon)}, ${q(name + '相关商品')})`
  ).join(',\n') + ';'
)
push('')

// ---------------- 3. 品牌 ----------------
push('-- ---------------- 品牌 ----------------')
push('INSERT INTO pms_brand (id, name, logo, description, sort, show_status) VALUES')
push(
  BRANDS.map(([id, name, color], i) =>
    `(${id}, ${q(name)}, ${q(`/images/brands/b${id}.svg`)}, ${q(name + ' 官方旗舰品牌')}, ${i + 10}, 1)`
  ).join(',\n') + ';'
)
push('')

// ---------------- 4. 商品 + SKU ----------------
push('-- ---------------- 商品（39 件，覆盖 6 大类 14 个子类） ----------------')
const productRows = []
const skuRows = []
let skuId = 3001
const skuByProduct = new Map()

PRODUCTS.forEach(([id, catId, brandId, name, sn, price, sale, stock, img, variants, desc, isNew, isRec], idx) => {
  const pic = `/images/products/${img}`
  const createTime = addDays(NOW, -(320 - idx * 6))
  const lowStock = Math.max(5, Math.floor(stock * 0.05))
  productRows.push(
    `(${id}, ${brandId}, ${catId}, ${q(name)}, ${q(pic)}, ${q(sn)}, ${money(price)}, ${sale}, ${stock}, ${lowStock}, ` +
    `${isNew}, ${isRec}, 1, 0, ${q(desc)}, ${q(fmtDate(createTime))})`
  )

  // 按规格拆分库存，最后一个规格承接余数
  const n = variants.length
  const base = Math.floor(stock / n)
  const list = []
  variants.forEach((v, i) => {
    const s = i === n - 1 ? stock - base * (n - 1) : base
    const sp = v.split(' ')
    const sid = skuId++
    skuRows.push(
      `(${sid}, ${id}, ${q(`${sn}-${i + 1}`)}, ${money(price)}, ${s}, 0, ${q(sp[0])}, ${q(sp[1] || null)}, NULL, ${q(pic)})`
    )
    list.push({ id: sid, code: `${sn}-${i + 1}`, price, stock: s, name: v })
  })
  skuByProduct.set(id, list)
})

push('INSERT INTO pms_product (id, brand_id, product_category_id, name, pic, product_sn, price, sale, stock, low_stock, new_status, recommand_status, publish_status, delete_status, description, create_time) VALUES')
push(productRows.join(',\n') + ';')
push('')
push('INSERT INTO pms_sku_stock (id, product_id, sku_code, price, stock, lock_stock, sp1, sp2, sp3, pic) VALUES')
push(skuRows.join(',\n') + ';')
push('')
push('-- 历史遗留商品：把商品总库存对齐到 SKU 库存之和（仅修正非种子商品）')
push('UPDATE pms_product p JOIN (SELECT product_id, SUM(stock) s FROM pms_sku_stock GROUP BY product_id) t ON t.product_id = p.id')
push('SET p.stock = t.s WHERE p.id NOT BETWEEN 2001 AND 2099 AND p.stock <> t.s;')
push('')

// ---------------- 5. 会员 + 地址 ----------------
push('-- ---------------- 会员账户（统一密码 123456） ----------------')
push('INSERT INTO ums_member (id, username, password, nickname, phone, email, icon, gender, birthday, city, status, integration, growth, create_time) VALUES')
push(
  MEMBERS.map(([id, uname, nick, phone, gender, city, growth, daysAgo]) =>
    `(${id}, ${q(uname)}, ${q(MEMBER_PWD)}, ${q(nick)}, ${q(phone)}, ${q(uname + '@example.com')}, NULL, ` +
    `${gender === '男' ? 1 : 0}, ${q(fmtDate(addDays(NOW, -(daysAgo + 365 * 2))))}, ${q(city)}, 1, ${growth}, ${growth}, ${q(fmtDate(addDays(NOW, -daysAgo)))})`
  ).join(',\n') + ';'
)
push('')

const CITIES = {
  北京: ['北京市', '朝阳区'], 上海: ['上海市', '浦东新区'], 广州: ['广东省', '天河区'],
  深圳: ['广东省', '南山区'], 杭州: ['浙江省', '西湖区'], 成都: ['四川省', '武侯区'],
  武汉: ['湖北省', '洪山区'], 西安: ['陕西省', '雁塔区']
}
const STREETS = ['科技园南路 18 号', '滨江大道 66 号 3 栋', '文一西路 969 号', '天府三街 199 号', '光谷大道 77 号', '长安街 12 号院']

const addressRows = []
let addrId = 201
MEMBERS.forEach(([id, uname, nick, phone, gender, city], mi) => {
  const [prov, region] = CITIES[city]
  for (let i = 0; i < 2; i++) {
    const street = STREETS[(mi + i) % STREETS.length]
    addressRows.push(
      `(${addrId++}, ${id}, ${q(nick)}, ${q(phone)}, ${q(prov)}, ${q(city + '市')}, ${q(region)}, ` +
      `${q(street + (i === 0 ? '' : ' ' + (i + 1) + ' 号楼 502'))}, ${i === 0 ? 1 : 0}, ${q(fmtDate(addDays(NOW, -(60 - mi * 3))))})`
    )
  }
})
push('-- ---------------- 收货地址（每位会员 2 条，首条为默认） ----------------')
push('INSERT INTO ums_member_receive_address (id, member_id, name, phone_number, province, city, region, detail_address, default_status, create_time) VALUES')
push(addressRows.join(',\n') + ';')
push('')

// ---------------- 6. 优惠券 ----------------
push('-- ---------------- 优惠券（满减 + 折扣） ----------------')
push('INSERT INTO sms_coupon (id, name, type, amount, min_point, per_limit, use_count, receive_count, publish_count, enable_start_time, enable_end_time, note, create_time) VALUES')
push(
  COUPONS.map(([id, name, type, amount, minPoint, perLimit, publish]) =>
    `(${id}, ${q(name)}, ${type}, ${money(amount)}, ${money(minPoint)}, ${perLimit}, 0, 0, ${publish}, ` +
    `${q(fmtDate(addDays(NOW, -30)))}, ${q(fmtDate(addDays(NOW, 60)))}, ${q(name + '，可与商品优惠叠加')}, ${q(fmtDate(addDays(NOW, -30)))})`
  ).join(',\n') + ';'
)
push('')

// ---------------- 7. 订单（含订单项 / 状态历史 / 收款流水 / 领券记录） ----------------
const STATUS_PLAN = [
  ...Array(3).fill(0), ...Array(4).fill(1), ...Array(5).fill(2),
  ...Array(10).fill(3), ...Array(8).fill(4), ...Array(6).fill(5)
]
// 各状态订单的“距今天数”，保证今日/近 7 天/近 30 天都有成交，便于统计报表展示
const DAY_PLAN = {
  0: [0, 1, 2],
  1: [1, 2, 3, 4],
  2: [2, 3, 4, 5, 6],
  3: [0, 0, 1, 2, 3, 5, 7, 9, 12, 16],
  4: [8, 10, 14, 18, 25, 32, 40, 55],
  5: [30, 38, 46, 55, 70, 95]
}
const dayCursor = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
const DELIVERY = [['顺丰速运', 'SF'], ['京东物流', 'JD'], ['中通快递', 'ZT'], ['圆通速递', 'YT']]

const orderRows = []
const itemRows = []
const historyRows = []
const payRows = []
const memberCouponRows = []
const couponUseCount = new Map()
const couponReceiveCount = new Map()

let orderId = 5001
let itemId = 6001
let historyId = 7001
let payId = 8001
let mcId = 1101

STATUS_PLAN.forEach((status, idx) => {
  const oid = orderId++
  // 会员轮转分配：每位会员拿到 4-5 笔订单，且状态、品类分布均匀
  const member = MEMBERS[idx % MEMBERS.length]
  const [memberId, uname, nick, phone, gender, city] = member
  const [prov, region] = CITIES[city]

  const days = DAY_PLAN[status][dayCursor[status]++ % DAY_PLAN[status].length]
  const createdAt = addMin(addDays(NOW, -days), -int(0, 480))
  // 注意：5=已取消，不能简单用 status>=3 判断“已支付”
  const isPaid = status === 3 || status === 4
  const confirmAt = status >= 1 ? addMin(createdAt, int(3, 90)) : null
  const payAt = isPaid ? addMin(confirmAt, int(10, 240)) : null
  const deliveryAt = status === 4 ? addMin(payAt, int(60 * 12, 60 * 72)) : null
  const cancelAt = status === 5 ? addMin(confirmAt || createdAt, int(5, 120)) : null

  // 选 1-3 件不同商品
  const count = int(1, 3)
  const chosen = new Set()
  while (chosen.size < count) chosen.add(PRODUCTS[int(0, PRODUCTS.length - 1)][0])

  let total = 0
  const items = []
  for (const pid of chosen) {
    const p = PRODUCTS.find((x) => x[0] === pid)
    const skus = skuByProduct.get(pid)
    const sku = pick(skus)
    const isFood = [1021, 1022, 1023].includes(p[1])
    const qty = isFood ? int(1, 4) : int(1, 2)
    const real = p[5] * qty
    total += real
    items.push({ p, sku, qty, real })
  }
  total = Math.round(total * 100) / 100

  // 优惠券：约 1/3 订单使用，且满足门槛
  let couponAmount = 0
  let memberCouponId = null
  if (rnd() < 0.34) {
    const usable = COUPONS.filter((c) => total >= c[4])
    if (usable.length) {
      const c = pick(usable)
      couponAmount = c[2] === 1
        ? Math.round(total * (1 - c[3]) * 100) / 100
        : Math.min(c[3], total)
      memberCouponId = mcId++
      const used = isPaid
      memberCouponRows.push(
        `(${memberCouponId}, ${memberId}, ${c[0]}, ${q('SD' + String(memberCouponId).slice(-8))}, ${used ? 1 : 0}, ` +
        `${q(fmtDate(addDays(createdAt, -1)))}, ${used ? q(fmtDate(payAt)) : 'NULL'}, ${used ? oid : 'NULL'})`
      )
      couponReceiveCount.set(c[0], (couponReceiveCount.get(c[0]) || 0) + 1)
      if (used) couponUseCount.set(c[0], (couponUseCount.get(c[0]) || 0) + 1)
    }
  }
  const payAmount = Math.round((total - couponAmount) * 100) / 100

  let deliveryCompany = null
  let deliverySn = null
  if (status === 4) {
    const [name, prefix] = pick(DELIVERY)
    deliveryCompany = name
    deliverySn = prefix + String(1000000000 + int(0, 899999999))
  }

  const orderSn = 'NO' + fmtDate(createdAt).replace(/[-: ]/g, '') + pad(memberId, 4)
  orderRows.push(
    `(${oid}, ${q(orderSn)}, ${memberId}, ${memberCouponId ?? 'NULL'}, ${money(total)}, ${money(couponAmount)}, ${money(payAmount)}, 0, ${status}, ` +
    `${q(nick)}, ${q(phone)}, ${q(prov)}, ${q(city + '市')}, ${q(region)}, ${q(STREETS[idx % STREETS.length] + ' ' + (idx % 20 + 1) + ' 号')}, ` +
    `${q(status === 5 ? '临时有事，取消订单' : '尽快发货，谢谢')}, ${q(fmtDate(createdAt))}, ` +
    `${confirmAt ? q(fmtDate(confirmAt)) : 'NULL'}, ${payAt ? q(fmtDate(payAt)) : 'NULL'}, ` +
    `${q(deliveryCompany)}, ${q(deliverySn)}, ${deliveryAt ? q(fmtDate(deliveryAt)) : 'NULL'})`
  )

  for (const it of items) {
    itemRows.push(
      `(${itemId++}, ${oid}, ${it.p[0]}, ${it.sku.id}, ${q(it.p[3])}, ${q('/images/products/' + it.p[8])}, ${money(it.p[5])}, ${it.qty}, ` +
      `${it.p[1]}, ${q(it.p[4])}, ${q(it.sku.code)}, ${money(it.real)})`
    )
  }

  historyRows.push(`(${historyId++}, ${oid}, ${q('会员' + nick)}, ${q(fmtDate(createdAt))}, 0, ${q('创建订单')})`)
  if (confirmAt) historyRows.push(`(${historyId++}, ${oid}, ${q('会员' + nick)}, ${q(fmtDate(confirmAt))}, 1, ${q('确认订单')})`)
  if (status >= 2) historyRows.push(`(${historyId++}, ${oid}, ${q('会员' + nick)}, ${q(fmtDate(addMin(confirmAt, 1)))}, 2, ${q('进入待支付')})`)
  if (payAt) historyRows.push(`(${historyId++}, ${oid}, ${q('会员' + nick)}, ${q(fmtDate(payAt))}, 3, ${q('支付成功(模拟)')})`)
  if (deliveryAt) historyRows.push(`(${historyId++}, ${oid}, ${q('管理员')}, ${q(fmtDate(deliveryAt))}, 4, ${q('已发货：' + deliveryCompany + ' ' + deliverySn)})`)
  if (cancelAt) historyRows.push(`(${historyId++}, ${oid}, ${q('会员' + nick)}, ${q(fmtDate(cancelAt))}, 5, ${q('取消订单')})`)

  if (payAt) {
    payRows.push(
      `(${payId++}, ${oid}, ${q(orderSn)}, ${memberId}, ${money(payAmount)}, 0, 1, ${q('模拟支付')}, ${q(fmtDate(payAt))}, ${q(fmtDate(payAt))})`
    )
  }
})

push('-- ---------------- 订单（36 笔，覆盖 0 创建 / 1 确认 / 2 待支付 / 3 支付成功 / 4 已发货 / 5 已取消） ----------------')
push('INSERT INTO oms_order (id, order_sn, member_id, coupon_id, total_amount, coupon_amount, pay_amount, pay_type, status, receiver_name, receiver_phone, receiver_province, receiver_city, receiver_region, receiver_detail_address, note, create_time, confirm_time, payment_time, delivery_company, delivery_sn, delivery_time) VALUES')
push(orderRows.join(',\n') + ';')
push('')
push('INSERT INTO oms_order_item (id, order_id, product_id, product_sku_id, product_name, product_pic, product_price, product_quantity, product_category_id, product_sn, product_sku_code, real_amount) VALUES')
push(itemRows.join(',\n') + ';')
push('')
push('INSERT INTO oms_order_operate_history (id, order_id, operate_man, create_time, order_status, note) VALUES')
push(historyRows.join(',\n') + ';')
push('')
push('INSERT INTO oms_payment_record (id, order_id, order_sn, member_id, amount, pay_type, status, remark, pay_time, create_time) VALUES')
push(payRows.join(',\n') + ';')
push('')
push('-- 会员领券记录（order.coupon_id 指向本表主键，与下单逻辑一致）')
push('INSERT INTO ums_member_coupon (id, member_id, coupon_id, coupon_code, use_status, get_time, use_time, order_id) VALUES')
push(memberCouponRows.join(',\n') + ';')
push('')

// 回写优惠券发放/使用数量
push('-- 按实际领用情况回写优惠券统计')
for (const [cid] of COUPONS) {
  const recv = couponReceiveCount.get(cid) || 0
  const used = couponUseCount.get(cid) || 0
  push(`UPDATE sms_coupon SET receive_count = ${recv}, use_count = ${used} WHERE id = ${cid};`)
}
push('')

// ---------------- 8. 购物车样本 ----------------
push('-- ---------------- 购物车样本（便于测试结算流程） ----------------')
const cartRows = []
let cartId = 4001
const cartSeeds = [[101, 2011, 1], [101, 2019, 2], [101, 2033, 1], [102, 2013, 1], [103, 2027, 2]]
for (const [mid, pid, qty] of cartSeeds) {
  const p = PRODUCTS.find((x) => x[0] === pid)
  const sku = skuByProduct.get(pid)[0]
  cartRows.push(
    `(${cartId++}, ${pid}, ${sku.id}, ${mid}, ${qty}, ${money(p[5])}, ${q(p[3])}, ${q('/images/products/' + p[8])}, ${q(BRANDS.find((b) => b[0] === p[2])[1])}, ${p[1]}, 0, ${q(fmtDate(addDays(NOW, -int(0, 3))))}, ${q(fmtDate(addDays(NOW, -int(0, 3))))})`
  )
}
push('INSERT INTO oms_cart_item (id, product_id, product_sku_id, member_id, quantity, price, product_name, product_pic, product_brand, product_category_id, delete_status, create_date, modify_date) VALUES')
push(cartRows.join(',\n') + ';')
push('')

// ---------------- 9. 首页人气推荐 ----------------
const recProducts = [...PRODUCTS].sort((a, b) => b[6] - a[6]).slice(0, 8)
push('-- ---------------- 首页人气推荐位 ----------------')
push('INSERT INTO sms_home_recommend_product (id, product_id, product_name, product_pic, recommend_status, sort) VALUES')
push(
  recProducts.map((p, i) => `(${1001 + i}, ${p[0]}, ${q(p[3])}, ${q('/images/products/' + p[8])}, 1, ${i + 1})`).join(',\n') + ';'
)
push('')

// ---------------- 10. 版本标记 ----------------
push('-- 种子数据版本标记：应用启动时据此判断是否已初始化')
push(`INSERT INTO sys_setting (setting_key, setting_value, description, update_time) VALUES ('seed_version', '${SEED_VERSION}', '种子数据版本，用于幂等初始化', NOW())`)
push("ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), update_time = NOW();")
push('')

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, out.join('\n'), 'utf8')

const stat = {
  分类: CATEGORIES.length,
  品牌: BRANDS.length,
  商品: PRODUCTS.length,
  SKU: skuRows.length,
  会员: MEMBERS.length,
  地址: addressRows.length,
  订单: orderRows.length,
  订单项: itemRows.length,
  状态历史: historyRows.length,
  收款流水: payRows.length,
  领券记录: memberCouponRows.length,
  购物车: cartRows.length,
  推荐位: recProducts.length
}
console.log('已生成:', OUT)
console.table(stat)
