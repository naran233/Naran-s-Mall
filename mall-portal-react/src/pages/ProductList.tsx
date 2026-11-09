import { useEffect, useState } from 'react'
import { Col, Empty, Pagination, Radio, Row, Spin } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { searchProducts } from '../api/portal'

const pageSize = 12

const sorts = [
  { label: '销量', value: 'sale' },
  { label: '最新', value: 'new' },
  { label: '价格↑', value: 'priceAsc' },
  { label: '价格↓', value: 'priceDesc' }
]

export default function ProductList() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('sale')
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)

  const keyword = params.get('keyword') || ''
  const categoryId = params.get('categoryId') || undefined
  const brandId = params.get('brandId') || undefined

  const load = async (page = pageNum) => {
    setLoading(true)
    try {
      const r = await searchProducts({
        keyword,
        categoryId,
        brandId,
        pageNum: page,
        pageSize,
        sort
      })
      setRows(r.data?.list || [])
      setTotal(r.data?.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPageNum(1)
    setSort('sale')
    load(1)
  }, [params.toString()])

  return (
    <div>
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16
        }}
      >
        <span style={{ color: '#606266', fontSize: 14 }}>排序：</span>
        <Radio.Group
          value={sort}
          optionType="button"
          buttonStyle="solid"
          options={sorts}
          onChange={(e) => {
            setSort(e.target.value)
            load(1)
          }}
        />
        {keyword && <span style={{ color: '#909399', fontSize: 14 }}>搜索：{keyword}</span>}
      </div>

      <Spin spinning={loading}>
        <Row gutter={16}>
          {rows.map((p) => (
            <Col span={6} key={p.id}>
              <div className="product-card" onClick={() => navigate('/product/' + p.id)}>
                <img
                  src={p.pic}
                  style={{
                    width: '100%',
                    height: 200,
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
        </Row>
        {!loading && !rows.length && <Empty description="没有找到商品" />}
      </Spin>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          current={pageNum}
          pageSize={pageSize}
          total={total}
          showSizeChanger={false}
          onChange={(p) => {
            setPageNum(p)
            load(p)
          }}
        />
      </div>
    </div>
  )
}
