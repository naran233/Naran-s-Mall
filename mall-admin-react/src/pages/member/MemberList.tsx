import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  message
} from 'antd'
import { changeMemberStatus, getMember, getMemberLevels, getMembers } from '../../api/admin'

const pageSize = 10

export default function MemberList() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<number | undefined>(undefined)
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detail, setDetail] = useState<any>({ member: null, recentOrders: [] })

  const load = async (page = pageNum, kw = keyword, st = status) => {
    setLoading(true)
    try {
      const r = await getMembers({ keyword: kw, status: st, pageNum: page, pageSize })
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
    const r = await getMember(row.id)
    setDetail(r.data || { member: null, recentOrders: [] })
    setDrawerOpen(true)
  }

  const toggleStatus = (row: any) => {
    const next = row.status === 1 ? 0 : 1
    Modal.confirm({
      title: '提示',
      content: `确认${next === 1 ? '启用' : '禁用'}会员「${row.username}」？`,
      onOk: async () => {
        await changeMemberStatus(row.id, next)
        message.success('操作成功')
        load()
      }
    })
  }

  const loadLevels = async () => {
    const r = await getMemberLevels()
    message.success(`已加载 ${(r.data || []).length} 个会员等级`)
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '昵称', dataIndex: 'nickname', width: 110 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    {
      title: '等级',
      dataIndex: 'levelName',
      width: 110,
      render: (v: string) => <Tag color="warning">{v}</Tag>
    },
    { title: '成长值', dataIndex: 'growth', width: 90 },
    { title: '积分', dataIndex: 'integration', width: 80 },
    { title: '订单数', dataIndex: 'orderCount', width: 85 },
    { title: '累计消费', dataIndex: 'totalPay', width: 120, render: (v: any) => `￥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      width: 95,
      render: (v: number) =>
        v === 1 ? <Tag color="success">正常</Tag> : <Tag color="error">禁用</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: any, row: any) => (
        <>
          <Button type="link" size="small" onClick={() => openDetail(row)}>
            详情
          </Button>
          <Button
            type="link"
            size="small"
            danger={row.status === 1}
            style={{ color: row.status === 1 ? undefined : '#67c23a' }}
            onClick={() => toggleStatus(row)}
          >
            {row.status === 1 ? '禁用' : '启用'}
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
            placeholder="用户名 / 昵称 / 手机号"
            allowClear
            style={{ width: 240 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPageNum(1)
              load(1)
            }}
          />
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 130 }}
            value={status}
            onChange={(v) => {
              setStatus(v)
              setPageNum(1)
              load(1, keyword, v)
            }}
            options={[
              { label: '正常', value: 1 },
              { label: '已禁用', value: 0 }
            ]}
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
          <Button onClick={loadLevels}>刷新等级</Button>
        </div>

        <Table
          rowKey="id"
          bordered
          loading={loading}
          dataSource={rows}
          columns={columns}
          scroll={{ x: 1250 }}
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

      <Drawer title="会员详情" width={500} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {detail.member && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="会员ID">{detail.member.id}</Descriptions.Item>
              <Descriptions.Item label="用户名">{detail.member.username}</Descriptions.Item>
              <Descriptions.Item label="昵称">{detail.member.nickname}</Descriptions.Item>
              <Descriptions.Item label="手机号">{detail.member.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{detail.member.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="成长值 / 积分">
                {detail.member.growth} / {detail.member.integration}
              </Descriptions.Item>
              <Descriptions.Item label="订单数 / 消费">
                {detail.orderCount} 单 / ￥{detail.totalPay}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">{detail.member.createTime}</Descriptions.Item>
            </Descriptions>
            <h4 style={{ margin: '18px 0 8px' }}>最近订单</h4>
            <Table
              rowKey="id"
              bordered
              size="small"
              pagination={false}
              locale={{ emptyText: '暂无订单' }}
              dataSource={detail.recentOrders || []}
              columns={[
                { title: '订单号', dataIndex: 'orderSn' },
                { title: '实付', dataIndex: 'payAmount', width: 90 },
                { title: '时间', dataIndex: 'createTime' }
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  )
}
