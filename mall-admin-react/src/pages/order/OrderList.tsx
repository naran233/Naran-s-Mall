import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Timeline,
  message
} from 'antd'
import { deleteOrder, deliverOrder, getOrderDetail, getOrders } from '../../api/admin'

const pageSize = 10

const statusList = [
  { label: '创建订单', value: 0 },
  { label: '确认订单', value: 1 },
  { label: '待支付', value: 2 },
  { label: '支付成功(待发货)', value: 3 },
  { label: '已发货', value: 4 },
  { label: '已取消', value: 5 }
]

const companies = ['顺丰速运', '京东物流', '中通快递', '圆通速递', '韵达快递', 'EMS']

const statusText = (s: number) => statusList.find((x) => x.value === s)?.label || '未知'
const statusColor = (s: number) => {
  if (s === 3) return 'success'
  if (s === 4) return 'blue'
  if (s === 2) return 'warning'
  return 'default'
}

export default function OrderList() {
  const [form] = Form.useForm()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<number | undefined>(undefined)
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detail, setDetail] = useState<any>({ order: null, items: [], history: [] })

  const [deliverOpen, setDeliverOpen] = useState(false)
  const [deliverId, setDeliverId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async (page = pageNum, kw = keyword, st = status) => {
    setLoading(true)
    try {
      const r = await getOrders({ keyword: kw, status: st, pageNum: page, pageSize })
      setRows(r.data?.list || [])
      setTotal(r.data?.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1, '', undefined)
  }, [])

  const openDetail = async (row: any) => {
    const r = await getOrderDetail(row.id)
    setDetail(r.data || { order: null, items: [], history: [] })
    setDrawerOpen(true)
  }

  const openDeliver = (row: any) => {
    setDeliverId(row.id)
    form.setFieldsValue({ deliveryCompany: '顺丰速运', deliverySn: '', note: '' })
    setDeliverOpen(true)
  }

  const doDeliver = async () => {
    const values = await form.validateFields()
    if (!deliverId) return
    setSaving(true)
    try {
      await deliverOrder(deliverId, values)
      message.success('发货成功，订单已置为「已发货」')
      setDeliverOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const remove = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除订单「${row.orderSn}」？`,
      okType: 'danger',
      onOk: async () => {
        await deleteOrder(row.id)
        message.success('删除成功')
        load()
      }
    })
  }

  const columns = [
    { title: '订单号', dataIndex: 'orderSn', width: 195 },
    { title: '会员ID', dataIndex: 'memberId', width: 85 },
    { title: '实付', dataIndex: 'payAmount', width: 105, render: (v: any) => `￥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      width: 130,
      render: (s: number) => <Tag color={statusColor(s)}>{statusText(s)}</Tag>
    },
    {
      title: '物流',
      dataIndex: 'deliverySn',
      render: (sn: string, row: any) =>
        sn ? `${row.deliveryCompany} / ${sn}` : <span className="muted">未发货</span>
    },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 210,
      fixed: 'right' as const,
      render: (_: any, row: any) => (
        <>
          <Button type="link" size="small" onClick={() => openDetail(row)}>
            详情
          </Button>
          {row.status === 3 && (
            <Button type="link" size="small" style={{ color: '#67c23a' }} onClick={() => openDeliver(row)}>
              发货
            </Button>
          )}
          <Button type="link" size="small" danger onClick={() => remove(row)}>
            删除
          </Button>
        </>
      )
    }
  ]

  return (
    <div>
      <Card>
        <div className="page-toolbar">
          <Input
            placeholder="订单号 / 会员ID"
            allowClear
            style={{ width: 220 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPageNum(1)
              load(1)
            }}
          />
          <Select
            placeholder="订单状态"
            allowClear
            style={{ width: 180 }}
            value={status}
            onChange={(v) => {
              setStatus(v)
              setPageNum(1)
              load(1, keyword, v)
            }}
            options={statusList.map((s) => ({ label: s.label, value: s.value }))}
          />
          <Button
            type="primary"
            onClick={() => {
              setPageNum(1)
              load(1)
            }}
          >
            查询
          </Button>
        </div>

        <Table
          rowKey="id"
          bordered
          loading={loading}
          dataSource={rows}
          columns={columns}
          scroll={{ x: 1150 }}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p) => {
              setPageNum(p)
              load(p)
            }
          }}
        />
      </Card>

      <Drawer title="订单详情" width={520} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {detail.order && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="订单号">{detail.order.orderSn}</Descriptions.Item>
              <Descriptions.Item label="状态">{statusText(detail.order.status)}</Descriptions.Item>
              <Descriptions.Item label="收货人">
                {detail.order.receiverName} / {detail.order.receiverPhone}
              </Descriptions.Item>
              <Descriptions.Item label="地址">{detail.order.receiverDetailAddress}</Descriptions.Item>
              <Descriptions.Item label="商品总额">￥{detail.order.totalAmount}</Descriptions.Item>
              <Descriptions.Item label="优惠金额">￥{detail.order.couponAmount}</Descriptions.Item>
              <Descriptions.Item label="实付金额">￥{detail.order.payAmount}</Descriptions.Item>
              <Descriptions.Item label="物流公司">{detail.order.deliveryCompany || '—'}</Descriptions.Item>
              <Descriptions.Item label="物流单号">{detail.order.deliverySn || '—'}</Descriptions.Item>
              <Descriptions.Item label="发货时间">{detail.order.deliveryTime || '—'}</Descriptions.Item>
            </Descriptions>

            <h4 style={{ margin: '18px 0 8px' }}>商品明细</h4>
            <Table
              rowKey="id"
              bordered
              size="small"
              pagination={false}
              dataSource={detail.items || []}
              columns={[
                { title: '商品', dataIndex: 'productName' },
                { title: '单价', dataIndex: 'productPrice', width: 90 },
                { title: '数量', dataIndex: 'productQuantity', width: 70 },
                { title: '小计', dataIndex: 'realAmount', width: 90 }
              ]}
            />

            <h4 style={{ margin: '18px 0 8px' }}>操作轨迹</h4>
            <Timeline
              items={(detail.history || []).map((h: any) => ({
                key: h.id,
                children: (
                  <>
                    {h.note}（状态 {statusText(h.orderStatus)}）
                    <div className="muted" style={{ fontSize: 12 }}>{h.createTime}</div>
                  </>
                )
              }))}
            />
          </>
        )}
      </Drawer>

      <Modal
        title="订单发货"
        width={440}
        open={deliverOpen}
        onCancel={() => setDeliverOpen(false)}
        onOk={doDeliver}
        confirmLoading={saving}
        okText="确认发货"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} preserve={false}>
          <Form.Item label="物流公司" name="deliveryCompany">
            <Select options={companies.map((c) => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item
            label="物流单号"
            name="deliverySn"
            rules={[{ required: true, message: '请填写物流单号' }]}
          >
            <Input placeholder="请输入物流单号" />
          </Form.Item>
          <Form.Item label="备注" name="note">
            <Input placeholder="选填" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
