import { useEffect, useState } from 'react'
import { Button, Card, Col, InputNumber, Radio, Row, Spin, message } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { addToCart, getProduct } from '../api/portal'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<any>({})
  const [quantity, setQuantity] = useState(1)
  const [skuId, setSkuId] = useState<number | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const r = await getProduct(Number(id))
        setProduct(r.data || {})
        if (r.data?.skus?.length) setSkuId(r.data.skus[0].id)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const add = async (stay: boolean) => {
    if (!localStorage.getItem('member_token')) {
      message.warning('请先登录')
      navigate(`/login?redirect=${encodeURIComponent('/product/' + id)}`)
      return
    }
    await addToCart({ productId: product.id, productSkuId: skuId, quantity })
    message.success('已加入购物车')
    if (!stay) navigate('/cart')
  }

  return (
    <Spin spinning={loading}>
      {product.id && (
        <Card>
          <Row gutter={24}>
            <Col span={10}>
              <img
                src={product.pic}
                style={{ width: '100%', height: 360, objectFit: 'cover', borderRadius: 8 }}
              />
            </Col>
            <Col span={14}>
              <h2 style={{ marginTop: 0, color: '#303133' }}>{product.name}</h2>
              <div style={{ background: '#fef0f0', padding: 16, borderRadius: 8, margin: '12px 0' }}>
                <span style={{ color: '#f56c6c', fontSize: 28, fontWeight: 700 }}>￥{product.price}</span>
                <span style={{ color: '#909399', fontSize: 13, marginLeft: 16 }}>
                  销量 {product.sale} ｜ 库存 {product.stock}
                </span>
              </div>
              <div style={{ color: '#606266', fontSize: 14, marginBottom: 12 }}>
                品牌：{product.brandName} ｜ 分类：{product.productCategoryName}
              </div>

              {product.skus && product.skus.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0' }}>
                  <span style={{ color: '#606266', width: 60 }}>规格：</span>
                  <Radio.Group
                    value={skuId}
                    optionType="button"
                    onChange={(e) => setSkuId(e.target.value)}
                    options={product.skus.map((s: any) => ({
                      label: `${s.sp1 || s.skuCode}${s.sp2 ? ' / ' + s.sp2 : ''}`,
                      value: s.id
                    }))}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0' }}>
                <span style={{ color: '#606266', width: 60 }}>数量：</span>
                <InputNumber min={1} max={99} value={quantity} onChange={(v) => setQuantity(Number(v) || 1)} />
              </div>

              <div style={{ margin: '24px 0', display: 'flex', gap: 12 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  style={{ background: '#e6a23c', borderColor: '#e6a23c' }}
                  onClick={() => add(true)}
                >
                  加入购物车
                </Button>
                <Button type="primary" danger size="large" onClick={() => add(false)}>
                  立即购买
                </Button>
              </div>

              <div>
                <h4 style={{ marginBottom: 6 }}>商品介绍</h4>
                <p style={{ color: '#606266', lineHeight: 1.8 }}>{product.description}</p>
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </Spin>
  )
}
