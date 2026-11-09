import { useEffect, useState } from 'react'
import { Card, Empty, Input, Modal, Spin } from 'antd'
import { getHelpCategories, getHelpDetail, getHelps } from '../api/portal'

export default function Help() {
  const [categories, setCategories] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<any>(null)

  const loadArticles = async (catId = categoryId, kw = keyword) => {
    setLoading(true)
    try {
      const r = await getHelps({ categoryId: catId, keyword: kw })
      setArticles(r.data?.articles || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      const c = await getHelpCategories()
      setCategories(c.data || [])
      loadArticles(undefined, '')
    })()
  }, [])

  const currentCategoryName =
    categoryId === undefined
      ? '全部问题'
      : categories.find((c) => c.id === categoryId)?.name || '全部问题'

  const openArticle = async (id: number) => {
    const r = await getHelpDetail(id)
    setCurrent(r.data)
    setOpen(true)
    setArticles((list) => list.map((a) => (a.id === id ? { ...a, readCount: r.data.readCount } : a)))
  }

  return (
    <div>
      <Card
        style={{
          marginBottom: 16,
          background: 'linear-gradient(120deg, #409eff 0%, #79bbff 100%)',
          border: 'none'
        }}
        styles={{ body: { padding: '18px 24px' } }}
      >
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 26 }}>帮助中心</h2>
          <p style={{ margin: '0 0 16px', opacity: 0.92, fontSize: 14 }}>
            购物、支付、配送与售后问题，这里都有答案
          </p>
          <Input.Search
            size="large"
            allowClear
            placeholder="搜索问题，如「支付」「退换货」"
            style={{ maxWidth: 520 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={(v) => loadArticles(categoryId, v)}
          />
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <Card title={<b>问题分类</b>} style={{ width: 220, flexShrink: 0 }}>
          <div
            onClick={() => {
              setCategoryId(undefined)
              loadArticles(undefined)
            }}
            style={{
              padding: '10px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              color: categoryId === undefined ? '#409eff' : '#606266',
              background: categoryId === undefined ? '#ecf5ff' : undefined,
              fontWeight: categoryId === undefined ? 600 : 400
            }}
          >
            全部问题
          </div>
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setCategoryId(c.id)
                loadArticles(c.id)
              }}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                color: categoryId === c.id ? '#409eff' : '#606266',
                background: categoryId === c.id ? '#ecf5ff' : undefined,
                fontWeight: categoryId === c.id ? 600 : 400
              }}
            >
              {c.name}
            </div>
          ))}
        </Card>

        <Card
          style={{ flex: 1, minHeight: 360 }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>{currentCategoryName}</b>
              <span style={{ color: '#909399', fontSize: 13 }}>共 {articles.length} 篇</span>
            </div>
          }
        >
          <Spin spinning={loading}>
            {!articles.length && <Empty description="暂无相关文章" />}
            {articles.map((a) => (
              <div
                key={a.id}
                onClick={() => openArticle(a.id)}
                style={{ padding: '14px 6px', borderBottom: '1px solid #f0f2f5', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 15, color: '#303133' }}>{a.title}</div>
                <div style={{ marginTop: 6, color: '#c0c4cc', fontSize: 12 }}>
                  阅读 {a.readCount} · {a.createTime}
                </div>
              </div>
            ))}
          </Spin>
        </Card>
      </div>

      <Modal
        title={current?.title}
        width={680}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        {current && (
          <>
            <p style={{ color: '#c0c4cc', fontSize: 12, margin: '0 0 12px' }}>
              阅读 {current.readCount} · {current.createTime}
            </p>
            <div style={{ lineHeight: 1.9, color: '#303133', whiteSpace: 'pre-wrap' }}>{current.content}</div>
          </>
        )}
      </Modal>
    </div>
  )
}
