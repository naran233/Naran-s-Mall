import { useEffect, useState } from 'react'
import { Button, Card, Empty, InputNumber, Modal, Spin, Table, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { deleteCart, getCart, updateCart } from '../api/portal'

export default function Cart() {
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [selectedKeys, setSelectedKeys] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await getCart()
      setItems(r.data || [])
      setSelectedKeys((keys) => keys.filter((k) => (r.data || []).some((i: any) => i.id === k)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const selected = items.filter((i) => selectedKeys.includes(i.id))
  const total = selected.reduce((s, r) => s + Number(r.price) * r.quantity, 0).toFixed(2)

  const changeQty = async (row: any, v: number) => {
    const qty = Number(v) || 1
    await updateCart(row.id, qty)
    setItems((list) => list.map((i) => (i.id === row.id ? { ...i, quantity: qty } : i)))
  }

  const remove = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: '确认从购物车删除该商品？',
      onOk: async () => {
        await deleteCart(row.id)
        message.success('已删除')
        load()
      }
    })
  }

  const checkout = () => {
    localStorage.setItem('checkout_items', JSON.stringify(selectedKeys))
    navigate('/checkout')
  }

  const columns = [
    {
      title: '商品',
      dataIndex: 'productName',
      render: (_: any, row: any) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img
            src={row.productPic}
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
          />
          <div>
            <div style={{ fontSize: 14, color: '#303133' }}>{row.productName}</div>
            <div style={{ fontSize: 12, color: '#909399', marginTop: 4 }}>
              规格ID：{row.productSkuId || '-'}
            </div>
          </div>
        </div>
      )
    },
    { title: '单价', dataIndex: 'price', width: 120, render: (v: any) => `￥${v}` },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 160,
      render: (_: any, row: any) => (
        <InputNumber
          size="small"
          min={1}
          value={row.quantity}
          onChange={(v) => changeQty(row, Number(v))}
        />
      )
    },
    {
      title: '小计',
      key: 'subtotal',
      width: 130,
      render: (_: any, row: any) => `￥${(Number(row.price) * row.quantity).toFixed(2)}`
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, row: any) => (
        <Button type="link" size="small" danger onClick={() => remove(row)}>
          删除
        </Button>
      )
    }
  ]

  return (
    <Spin spinning={loading}>
      <Card title={<b>我的购物车</b>}>
        <Table
          rowKey="id"
          dataSource={items}
          columns={columns}
          pagination={false}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: (keys) => setSelectedKeys(keys as number[])
          }}
        />
        {!loading && !items.length && <Empty description="购物车还是空的" />}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 24,
            marginTop: 20
          }}
        >
          <div>
            已选 <b>{selected.length}</b> 件，合计：
            <span style={{ color: '#f56c6c', fontSize: 22, fontWeight: 700 }}>￥{total}</span>
          </div>
          <Button type="primary" danger size="large" disabled={!selected.length} onClick={checkout}>
            去结算
          </Button>
        </div>
      </Card>
    </Spin>
  )
}
