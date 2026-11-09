import { useEffect, useState } from 'react'
import { Card, Col, Empty, Menu, Row, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { getHome } from '../api/portal'
import BannerCarousel from '../components/BannerCarousel'

export default function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [home, setHome] = useState<any>({
    advertiseList: [],
    brandList: [],
    hotProducts: [],
    newProducts: [],
    recommendProducts: [],
    categoryTree: []
  })

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const r = await getHome()
        setHome((prev: any) => ({ ...prev, ...(r.data || {}) }))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const categoryItems = (home.categoryTree || []).map((c: any) => ({
    key: String(c.id),
    label: c.name,
    children: (c.children || []).map((s: any) => ({ key: String(s.id), label: s.name }))
  }))

  const blocks = [
    { title: '人气推荐', list: home.hotProducts },
    { title: '新鲜好物', list: home.newProducts },
    { title: '猜你喜欢', list: home.recommendProducts }
  ]

  return (
    <Spin spinning={loading}>
      <Row gutter={16}>
        <Col span={4}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 8, height: 320, overflow: 'auto' }}>
            <div style={{ fontWeight: 600, padding: 10, color: '#303133' }}>商品分类</div>
            <Menu
              mode="inline"
              style={{ borderInlineEnd: 'none' }}
              items={categoryItems}
              onClick={({ key }) => navigate(`/products?categoryId=${key}`)}
            />
            {!categoryItems.length && <div style={{ padding: 10, color: '#909399' }}>暂无分类</div>}
          </div>
        </Col>
        <Col span={20}>
          <BannerCarousel banners={home.advertiseList || []} height={320} />
        </Col>
      </Row>

      {blocks.map((block) => (
        <section key={block.title} style={{ marginTop: 28 }}>
          <div className="block-title">{block.title}</div>
          <Row gutter={16}>
            {(block.list || []).map((p: any) => (
              <Col span={6} key={p.id}>
                <div className="product-card" onClick={() => navigate('/product/' + p.id)}>
                  <img
                    src={p.pic}
                    style={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 6,
                      background: '#f5f7fa'
                    }}
                  />
                  <div style={{ margin: '10px 0 6px', fontSize: 14, height: 40, overflow: 'hidden' }}>
                    {p.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#f56c6c', fontWeight: 700, fontSize: 16 }}>￥{p.price}</span>
                    <span style={{ color: '#909399', fontSize: 12 }}>已售 {p.sale}</span>
                  </div>
                </div>
              </Col>
            ))}
            {!(block.list || []).length && (
              <Col span={24}>
                <Empty description="暂无商品" styles={{ image: { height: 80 } }} />
              </Col>
            )}
          </Row>
        </section>
      ))}

      <section style={{ marginTop: 28 }}>
        <div className="block-title">品牌制造商直供</div>
        <Row gutter={16}>
          {(home.brandList || []).map((b: any) => (
            <Col span={4} key={b.id}>
              <Card
                hoverable
                style={{ textAlign: 'center', marginBottom: 16 }}
                onClick={() => navigate(`/products?brandId=${b.id}`)}
              >
                <img src={b.logo} style={{ width: 90, height: 50, objectFit: 'contain' }} />
                <div style={{ marginTop: 8 }}>{b.name}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </Spin>
  )
}
