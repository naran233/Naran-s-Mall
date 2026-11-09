import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Switch,
  Table,
  Tabs,
  Tag,
  message
} from 'antd'
import {
  availableCoupons,
  createAddress,
  deleteAddress,
  getAddresses,
  getProfile,
  myCoupons,
  receiveCoupon,
  updateAddress,
  updateProfile
} from '../api/portal'

const couponDesc = (c: any) =>
  c.type === 1 ? `${(Number(c.amount) * 10).toFixed(1)} 折` : `满${c.minPoint}减${c.amount}`

export default function Member() {
  const [addrForm] = Form.useForm()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState<any>({})
  const [myList, setMyList] = useState<any[]>([])
  const [available, setAvailable] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [addrOpen, setAddrOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const loadProfile = async () => {
    const r = await getProfile()
    setProfile(r.data || {})
  }

  const loadCoupons = async () => {
    const [m, a] = await Promise.all([myCoupons(), availableCoupons()])
    setMyList(m.data || [])
    setAvailable(a.data || [])
  }

  const loadAddresses = async () => {
    const r = await getAddresses()
    setAddresses(r.data || [])
  }

  useEffect(() => {
    loadProfile()
    loadCoupons()
    loadAddresses()
  }, [])

  const saveProfile = async () => {
    await updateProfile({
      nickname: profile.nickname,
      phone: profile.phone,
      email: profile.email
    })
    message.success('保存成功')
  }

  const receive = async (id: number) => {
    await receiveCoupon(id)
    message.success('领取成功')
    loadCoupons()
  }

  const openAddr = (row?: any) => {
    setEditingId(row?.id ?? null)
    addrForm.setFieldsValue(
      row
        ? { ...row }
        : { name: '', phoneNumber: '', province: '', city: '', region: '', detailAddress: '', defaultStatus: 0 }
    )
    setAddrOpen(true)
  }

  const saveAddr = async () => {
    const values = await addrForm.validateFields()
    if (editingId) await updateAddress(editingId, { ...values, id: editingId })
    else await createAddress({ ...values })
    message.success('保存成功')
    setAddrOpen(false)
    loadAddresses()
  }

  const removeAddr = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: '确认删除该地址？',
      onOk: async () => {
        await deleteAddress(row.id)
        message.success('已删除')
        loadAddresses()
      }
    })
  }

  const couponCard = (c: any, used: boolean) => (
    <div
      key={c.memberCouponId ?? c.id}
      style={{
        border: `1px dashed ${used ? '#c0c4cc' : '#f56c6c'}`,
        borderRadius: 8,
        padding: 14,
        marginBottom: 14,
        background: used ? '#f5f7fa' : '#fef0f0',
        opacity: used ? 0.55 : 1
      }}
    >
      <div style={{ fontWeight: 600, color: '#303133' }}>{c.name}</div>
      <div style={{ color: '#f56c6c', margin: '6px 0', fontSize: 14 }}>{couponDesc(c)}</div>
      {used ? (
        <div style={{ color: '#909399', fontSize: 12 }}>
          {c.useStatus === 0 ? '未使用' : c.useStatus === 1 ? '已使用' : '已过期'}
        </div>
      ) : (
        <Button size="small" type="primary" danger onClick={() => receive(c.id)}>
          立即领取
        </Button>
      )}
    </div>
  )

  return (
    <Card>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: 'profile',
            label: '个人资料',
            children: (
              <div style={{ maxWidth: 480 }}>
                {[
                  { label: '用户名', key: 'username', disabled: true },
                  { label: '昵称', key: 'nickname' },
                  { label: '手机号', key: 'phone' },
                  { label: '邮箱', key: 'email' }
                ].map((f) => (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ width: 80, color: '#606266' }}>{f.label}</span>
                    <Input
                      disabled={f.disabled}
                      value={profile[f.key] || ''}
                      onChange={(e) => setProfile((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ width: 80, color: '#606266' }}>积分</span>
                  <span>{profile.integration ?? 0}</span>
                </div>
                <Button type="primary" onClick={saveProfile}>
                  保存资料
                </Button>
              </div>
            )
          },
          {
            key: 'coupon',
            label: '我的优惠券',
            children: (
              <>
                <h4>我的券</h4>
                {myList.length ? (
                  <Row gutter={16}>
                    {myList.map((c) => (
                      <Col span={8} key={c.memberCouponId}>
                        {couponCard(c, c.useStatus !== 0)}
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="暂无优惠券" styles={{ image: { height: 70 } }} />
                )}

                <h4 style={{ marginTop: 16 }}>领券中心</h4>
                {available.length ? (
                  <Row gutter={16}>
                    {available.map((c) => (
                      <Col span={8} key={c.id}>
                        {couponCard(c, false)}
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="暂无可领取优惠券" styles={{ image: { height: 70 } }} />
                )}
              </>
            )
          },
          {
            key: 'address',
            label: '收货地址',
            children: (
              <>
                <Button type="primary" style={{ marginBottom: 12 }} onClick={() => openAddr()}>
                  新增地址
                </Button>
                <Table
                  rowKey="id"
                  bordered
                  pagination={false}
                  dataSource={addresses}
                  columns={[
                    { title: '收货人', dataIndex: 'name', width: 120 },
                    { title: '电话', dataIndex: 'phoneNumber', width: 150 },
                    {
                      title: '地址',
                      key: 'addr',
                      render: (_: any, row: any) =>
                        `${row.province}${row.city}${row.region}${row.detailAddress}`
                    },
                    {
                      title: '默认',
                      dataIndex: 'defaultStatus',
                      width: 80,
                      render: (v: number) => (v === 1 ? <Tag color="success">默认</Tag> : null)
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 150,
                      render: (_: any, row: any) => (
                        <>
                          <Button type="link" size="small" onClick={() => openAddr(row)}>
                            编辑
                          </Button>
                          <Button type="link" size="small" danger onClick={() => removeAddr(row)}>
                            删除
                          </Button>
                        </>
                      )
                    }
                  ]}
                />
              </>
            )
          }
        ]}
      />

      <Modal
        title={editingId ? '编辑地址' : '新增地址'}
        width={520}
        open={addrOpen}
        onCancel={() => setAddrOpen(false)}
        onOk={saveAddr}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={addrForm} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} preserve={false}>
          <Form.Item label="收货人" name="name" rules={[{ required: true, message: '请填写收货人' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="电话" name="phoneNumber" rules={[{ required: true, message: '请填写电话' }]}>
            <Input />
          </Form.Item>
          <Row gutter={8}>
            <Col span={8}>
              <Form.Item label="省" name="province" labelCol={{ span: 8 }}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="市" name="city" labelCol={{ span: 8 }}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="区" name="region" labelCol={{ span: 8 }}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="详细" name="detailAddress">
            <Input />
          </Form.Item>
          <Form.Item label="默认" name="defaultStatus" getValueProps={(v) => ({ checked: v === 1 })} normalize={(v) => (v ? 1 : 0)}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
