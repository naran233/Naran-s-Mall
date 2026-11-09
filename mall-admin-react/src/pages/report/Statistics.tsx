import { useEffect, useMemo, useState } from 'react'
import { Card, Col, Radio, Row, Spin } from 'antd'
import EChart from '../../components/EChart'
import {
  getCategorySales,
  getOrderStatusStat,
  getSalesTrend,
  getStatisticsOverview,
  getTopProducts
} from '../../api/admin'

const COLORS = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9254de']

const money = (v: any) =>
  Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const kpiCardStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }

export default function Statistics() {
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<any>({})
  const [days, setDays] = useState(30)
  const [trend, setTrend] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [topData, setTopData] = useState<any[]>([])

  const loadTrend = async (d = days) => {
    const r = await getSalesTrend(d)
    setTrend(r.data || [])
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const [o, st, cat, top] = await Promise.all([
          getStatisticsOverview(),
          getOrderStatusStat(),
          getCategorySales(),
          getTopProducts(8)
        ])
        setOverview(o.data || {})
        setStatusData(st.data || [])
        setCategoryData(cat.data || [])
        setTopData(top.data || [])
        await loadTrend(days)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const trendOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      legend: { data: ['销售额', '订单数'], right: 10 },
      grid: { left: 60, right: 50, top: 40, bottom: 40 },
      xAxis: { type: 'category', data: trend.map((d) => String(d.date).slice(5)) },
      yAxis: [
        { type: 'value', name: '销售额' },
        { type: 'value', name: '订单数', splitLine: { show: false } }
      ],
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          data: trend.map((d) => Number(d.amount || 0)),
          areaStyle: { opacity: 0.12 },
          itemStyle: { color: '#409eff' }
        },
        {
          name: '订单数',
          type: 'bar',
          yAxisIndex: 1,
          data: trend.map((d) => Number(d.orders || 0)),
          barWidth: 8,
          itemStyle: { color: '#c6e2ff' }
        }
      ]
    }),
    [trend]
  )

  const statusOption = useMemo(
    () => ({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      color: COLORS,
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '45%'],
          label: { formatter: '{b}\n{c} 单' },
          data: statusData.map((d) => ({ name: d.name, value: d.count }))
        }
      ]
    }),
    [statusData]
  )

  const categoryOption = useMemo(
    () => ({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      color: COLORS,
      series: [
        {
          type: 'pie',
          radius: '62%',
          center: ['50%', '44%'],
          label: { formatter: '{b}\n￥{c}' },
          data: categoryData.map((d) => ({ name: d.name, value: Number(d.amount || 0) }))
        }
      ]
    }),
    [categoryData]
  )

  const topOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 130, right: 40, top: 20, bottom: 30 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: topData.map((d) => d.productName).reverse() },
      series: [
        {
          type: 'bar',
          data: topData.map((d) => Number(d.quantity || 0)).reverse(),
          itemStyle: { color: '#409eff', borderRadius: [0, 4, 4, 0] },
          barWidth: 16
        }
      ]
    }),
    [topData]
  )

  return (
    <Spin spinning={loading}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card hoverable>
            <div style={kpiCardStyle}>
              <span style={{ color: '#909399', fontSize: 13 }}>总销售额</span>
              <b style={{ fontSize: 26, color: '#f56c6c' }}>￥{money(overview.totalSales)}</b>
              <em style={{ fontSize: 12, color: '#c0c4cc', fontStyle: 'normal' }}>累计已支付订单</em>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <div style={kpiCardStyle}>
              <span style={{ color: '#909399', fontSize: 13 }}>今日销售额</span>
              <b style={{ fontSize: 26, color: '#303133' }}>￥{money(overview.todaySales)}</b>
              <em style={{ fontSize: 12, color: '#c0c4cc', fontStyle: 'normal' }}>
                本月 ￥{money(overview.monthSales)}
              </em>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <div style={kpiCardStyle}>
              <span style={{ color: '#909399', fontSize: 13 }}>订单总数</span>
              <b style={{ fontSize: 26, color: '#303133' }}>{overview.orderCount ?? 0}</b>
              <em style={{ fontSize: 12, color: '#c0c4cc', fontStyle: 'normal' }}>
                已支付 {overview.paidOrderCount ?? 0} 单
              </em>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <div style={kpiCardStyle}>
              <span style={{ color: '#909399', fontSize: 13 }}>会员总数</span>
              <b style={{ fontSize: 26, color: '#303133' }}>{overview.memberCount ?? 0}</b>
              <em style={{ fontSize: 12, color: '#c0c4cc', fontStyle: 'normal' }}>
                今日新增 {overview.newMemberToday ?? 0}
              </em>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card hoverable>
            <div style={kpiCardStyle}>
              <span style={{ color: '#909399', fontSize: 13 }}>在售商品</span>
              <b style={{ fontSize: 20, color: '#303133' }}>{overview.productCount ?? 0}</b>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <div style={kpiCardStyle}>
              <span style={{ color: '#909399', fontSize: 13 }}>待发货订单</span>
              <b style={{ fontSize: 20, color: '#e6a23c' }}>{overview.waitDeliverCount ?? 0}</b>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <div style={kpiCardStyle}>
              <span style={{ color: '#909399', fontSize: 13 }}>待处理工单</span>
              <b style={{ fontSize: 20, color: '#e6a23c' }}>{overview.pendingTicketCount ?? 0}</b>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <div style={kpiCardStyle}>
              <span style={{ color: '#909399', fontSize: 13 }}>数据范围</span>
              <b style={{ fontSize: 20, color: '#303133' }}>近 {days} 天</b>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        style={{ marginBottom: 16 }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b>销售趋势</b>
            <Radio.Group
              size="small"
              value={days}
              optionType="button"
              buttonStyle="solid"
              onChange={(e) => {
                setDays(e.target.value)
                loadTrend(e.target.value)
              }}
              options={[
                { label: '近 7 天', value: 7 },
                { label: '近 30 天', value: 30 },
                { label: '近 90 天', value: 90 }
              ]}
            />
          </div>
        }
      >
        <EChart option={trendOption} height={340} />
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title={<b>订单状态分布</b>} style={{ marginBottom: 16 }}>
            <EChart option={statusOption} height={300} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<b>分类销售占比</b>} style={{ marginBottom: 16 }}>
            <EChart option={categoryOption} height={300} />
          </Card>
        </Col>
      </Row>

      <Card title={<b>热销商品 Top 8</b>} style={{ marginBottom: 16 }}>
        <EChart option={topOption} height={300} />
      </Card>
    </Spin>
  )
}
