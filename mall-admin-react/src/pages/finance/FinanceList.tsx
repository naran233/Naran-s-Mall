import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Tag,
  message
} from 'antd'
import type { Dayjs } from 'dayjs'
import EChart from '../../components/EChart'
import { getFinanceDaily, getFinanceOverview, getFinanceRecords, refundRecord } from '../../api/admin'

const pageSize = 10

const money = (v: any) =>
  Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const statusText = (s: number) => (s === 1 ? '已收款' : s === 2 ? '已退款' : '待收款')

export default function FinanceList() {
  const [overview, setOverview] = useState<any>({})
  const [rows, setRows] = useState<any[]>([])
  const [daily, setDaily] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<number | undefined>(undefined)
  const [range, setRange] = useState<[string, string] | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)

  const [refundTarget, setRefundTarget] = useState<any>(null)
  const [remark, setRemark] = useState('')

  const load = async (
    page = pageNum,
    kw = keyword,
    st = status,
    rg: [string, string] | null = range
  ) => {
    setLoading(true)
    try {
      const r = await getFinanceRecords({
        keyword: kw,
        status: st,
        startDate: rg?.[0],
        endDate: rg?.[1],
        pageNum: page,
        pageSize
      })
      setRows(r.data?.list || [])
      setTotal(r.data?.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      const [o, d] = await Promise.all([getFinanceOverview(), getFinanceDaily(30)])
      setOverview(o.data || {})
      setDaily(d.data || [])
      load(1, '', undefined, null)
    })()
  }, [])

  const chartOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 60, right: 30, top: 30, bottom: 40 },
      xAxis: { type: 'category', data: daily.map((d) => String(d.date).slice(5)) },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar',
          data: daily.map((d) => Number(d.amount || 0)),
          barWidth: '55%',
          itemStyle: { color: '#67c23a', borderRadius: [4, 4, 0, 0] }
        }
      ]
    }),
    [daily]
  )

  const submitRefund = async () => {
    if (!refundTarget) return
    await refundRecord(refundTarget.id, remark || '管理员登记退款')
    message.success('退款已登记')
    setRefundTarget(null)
    setRemark('')
    const o = await getFinanceOverview()
    setOverview(o.data || {})
    load()
  }

  const columns = [
    { title: '流水号', key: 'id', width: 90, render: (_: any, row: any) => row.record.id },
    { title: '订单号', key: 'orderSn', width: 190, render: (_: any, row: any) => row.record.orderSn },
    { title: '会员', dataIndex: 'memberName', width: 110 },
    {
      title: '金额',
      key: 'amount',
      width: 120,
      render: (_: any, row: any) => (
        <span style={{ color: Number(row.record.amount) < 0 ? '#67c23a' : undefined }}>
          ￥{money(row.record.amount)}
        </span>
      )
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, row: any) => (
        <Tag color={row.record.status === 1 ? 'success' : row.record.status === 2 ? 'error' : 'warning'}>
          {statusText(row.record.status)}
        </Tag>
      )
    },
    { title: '支付时间', key: 'payTime', width: 170, render: (_: any, row: any) => row.record.payTime },
    { title: '备注', key: 'remark', render: (_: any, row: any) => row.record.remark },
    {
      title: '操作',
      key: 'action',
      width: 110,
      fixed: 'right' as const,
      render: (_: any, row: any) =>
        row.record.status === 1 && Number(row.record.amount) > 0 ? (
          <Button
            type="link"
            size="small"
            danger
            onClick={() => {
              setRefundTarget(row.record)
              setRemark('')
            }}
          >
            登记退款
          </Button>
        ) : (
          <span className="muted">—</span>
        )
    }
  ]

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { label: '累计收款', value: `￥${money(overview.totalIncome)}`, color: '#f56c6c', sub: `${overview.recordCount ?? 0} 笔已收款` },
          { label: '今日收款', value: `￥${money(overview.todayIncome)}`, color: '#303133', sub: `本月 ￥${money(overview.monthIncome)}` },
          { label: '待收款', value: `￥${money(overview.pendingAmount)}`, color: '#e6a23c', sub: '待支付订单' },
          { label: '退款金额', value: `￥${money(overview.refundAmount)}`, color: '#909399', sub: '已登记退款' }
        ].map((k) => (
          <Col span={6} key={k.label}>
            <Card hoverable>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#909399', fontSize: 13 }}>{k.label}</span>
                <b style={{ fontSize: 24, color: k.color }}>{k.value}</b>
                <em style={{ fontSize: 12, color: '#c0c4cc', fontStyle: 'normal' }}>{k.sub}</em>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={<b>近 30 天回款趋势</b>} style={{ marginBottom: 16 }}>
        <EChart option={chartOption} height={280} />
      </Card>

      <Card>
        <div className="page-toolbar">
          <Input
            placeholder="订单号"
            allowClear
            style={{ width: 200 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPageNum(1)
              load(1)
            }}
          />
          <Select
            placeholder="流水状态"
            allowClear
            style={{ width: 140 }}
            value={status}
            onChange={(v) => {
              setStatus(v)
              setPageNum(1)
              load(1, keyword, v)
            }}
            options={[
              { label: '已收款', value: 1 },
              { label: '已退款', value: 2 }
            ]}
          />
          <DatePicker.RangePicker
            style={{ width: 260 }}
            onChange={(dates: (Dayjs | null)[] | null) => {
              const rg =
                dates && dates[0] && dates[1]
                  ? ([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')] as [string, string])
                  : null
              setRange(rg)
              setPageNum(1)
              load(1, keyword, status, rg)
            }}
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
          rowKey={(row: any) => row.record.id}
          bordered
          loading={loading}
          dataSource={rows}
          columns={columns}
          scroll={{ x: 1100 }}
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

      <Modal
        title="退款登记"
        open={!!refundTarget}
        onCancel={() => setRefundTarget(null)}
        onOk={submitRefund}
        okText="确认退款"
        cancelText="取消"
      >
        <p>
          对订单「{refundTarget?.orderSn}」登记退款 ￥{money(refundTarget?.amount)}？
        </p>
        <Input
          placeholder="退款原因（选填）"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
      </Modal>
    </div>
  )
}
