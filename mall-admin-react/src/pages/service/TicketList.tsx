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
import {
  changeTicketStatus,
  deleteTicket,
  getTicket,
  getTickets,
  getTicketStats,
  replyTicket
} from '../../api/admin'

const pageSize = 10

const typeMap: Record<number, string> = { 1: '咨询', 2: '投诉', 3: '退换货', 4: '售后' }
const statusMap: Record<number, string> = { 0: '待处理', 1: '处理中', 2: '已回复', 3: '已关闭' }
const typeText = (t: number) => typeMap[t] || '其他'
const statusText = (s: number) => statusMap[s] || '未知'
const statusColor = (s: number) => {
  if (s === 0) return 'warning'
  if (s === 1) return 'blue'
  if (s === 2) return 'success'
  return 'default'
}

const statStyle: React.CSSProperties = {
  flex: 1,
  background: '#f5f7fa',
  borderRadius: 8,
  padding: 12,
  textAlign: 'center',
  color: '#606266',
  fontSize: 13
}

export default function TicketList() {
  const [rows, setRows] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<number | undefined>(undefined)
  const [type, setType] = useState<number | undefined>(undefined)
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [current, setCurrent] = useState<any>(null)
  const [replyContent, setReplyContent] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async (page = pageNum, kw = keyword, st = status, tp = type) => {
    setLoading(true)
    try {
      const r = await getTickets({ keyword: kw, status: st, type: tp, pageNum: page, pageSize })
      setRows(r.data?.list || [])
      setTotal(r.data?.total || 0)
      const s = await getTicketStats()
      setStats(s.data || {})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1, '', undefined, undefined)
  }, [])

  const openDetail = async (t: any) => {
    const r = await getTicket(t.id)
    setCurrent(r.data?.ticket || null)
    setReplyContent(r.data?.ticket?.replyContent || '')
    setDrawerOpen(true)
  }

  const doReply = async () => {
    if (!replyContent.trim()) {
      message.warning('请填写回复内容')
      return
    }
    setSaving(true)
    try {
      await replyTicket(current.id, { replyContent, replyMan: '客服' })
      message.success('回复成功')
      setDrawerOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const closeTicket = (t: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认关闭工单「${t.ticketSn}」？`,
      onOk: async () => {
        await changeTicketStatus(t.id, 3)
        message.success('工单已关闭')
        load()
      }
    })
  }

  const remove = (t: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除工单「${t.ticketSn}」？`,
      okType: 'danger',
      onOk: async () => {
        await deleteTicket(t.id)
        message.success('删除成功')
        load()
      }
    })
  }

  const columns = [
    { title: '工单号', key: 'sn', width: 165, render: (_: any, row: any) => row.ticket.ticketSn },
    { title: '会员', dataIndex: 'memberName', width: 110 },
    {
      title: '类型',
      key: 'type',
      width: 90,
      render: (_: any, row: any) => <Tag>{typeText(row.ticket.type)}</Tag>
    },
    { title: '标题', key: 'title', render: (_: any, row: any) => row.ticket.title },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, row: any) => (
        <Tag color={statusColor(row.ticket.status)}>{statusText(row.ticket.status)}</Tag>
      )
    },
    {
      title: '提交时间',
      key: 'createTime',
      width: 170,
      render: (_: any, row: any) => row.ticket.createTime
    },
    {
      title: '操作',
      key: 'action',
      width: 190,
      fixed: 'right' as const,
      render: (_: any, row: any) => (
        <>
          <Button type="link" size="small" onClick={() => openDetail(row.ticket)}>
            处理
          </Button>
          {row.ticket.status !== 3 && (
            <Button type="link" size="small" onClick={() => closeTicket(row.ticket)}>
              关闭
            </Button>
          )}
          <Button type="link" size="small" danger onClick={() => remove(row.ticket)}>
            删除
          </Button>
        </>
      )
    }
  ]

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={statStyle}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#e6a23c' }}>{stats.pending ?? 0}</div>
            <div>待处理</div>
          </div>
          <div style={statStyle}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#303133' }}>{stats.processing ?? 0}</div>
            <div>处理中</div>
          </div>
          <div style={statStyle}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#67c23a' }}>{stats.replied ?? 0}</div>
            <div>已回复</div>
          </div>
          <div style={statStyle}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#909399' }}>{stats.closed ?? 0}</div>
            <div>已关闭</div>
          </div>
          <div style={statStyle}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#303133' }}>{stats.total ?? 0}</div>
            <div>总计</div>
          </div>
        </div>

        <div className="page-toolbar">
          <Input
            placeholder="工单号 / 标题 / 内容"
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
            options={Object.keys(statusMap).map((k) => ({ label: statusMap[+k], value: +k }))}
          />
          <Select
            placeholder="类型"
            allowClear
            style={{ width: 130 }}
            value={type}
            onChange={(v) => {
              setType(v)
              setPageNum(1)
              load(1, keyword, status, v)
            }}
            options={Object.keys(typeMap).map((k) => ({ label: typeMap[+k], value: +k }))}
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
          rowKey={(row: any) => row.ticket.id}
          bordered
          loading={loading}
          dataSource={rows}
          columns={columns}
          scroll={{ x: 1050 }}
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

      <Drawer title="工单处理" width={520} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {current && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="工单号">{current.ticketSn}</Descriptions.Item>
              <Descriptions.Item label="类型">{typeText(current.type)}</Descriptions.Item>
              <Descriptions.Item label="标题">{current.title}</Descriptions.Item>
              <Descriptions.Item label="内容">{current.content}</Descriptions.Item>
              <Descriptions.Item label="提交时间">{current.createTime}</Descriptions.Item>
              {current.replyContent && (
                <Descriptions.Item label="已有回复">{current.replyContent}</Descriptions.Item>
              )}
            </Descriptions>
            <h4 style={{ margin: '18px 0 8px' }}>客服回复</h4>
            <Input.TextArea
              rows={5}
              placeholder="请输入回复内容"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Button type="primary" loading={saving} onClick={doReply}>
                提交回复
              </Button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}
