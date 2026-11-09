import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Switch,
  Table,
  Tag,
  message
} from 'antd'
import {
  assignRoles,
  createUser,
  deleteUser,
  getRoles,
  getUsers,
  updateUser
} from '../../api/admin'

const pageSize = 10

export default function UserList() {
  const [form] = Form.useForm()
  const [rows, setRows] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [roleOpen, setRoleOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])

  const load = async (page = pageNum, kw = keyword) => {
    setLoading(true)
    try {
      const r = await getUsers({ keyword: kw, pageNum: page, pageSize })
      setRows(r.data?.list || [])
      setTotal(r.data?.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      const r = await getRoles()
      setRoles(r.data || [])
      load(1, '')
    })()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    form.setFieldsValue({ username: '', password: '', nickName: '', status: 1 })
    setOpen(true)
  }

  const openEdit = (row: any) => {
    setEditingId(row.id)
    form.setFieldsValue({ username: row.username, password: '', nickName: row.nickName, status: row.status })
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    if (editingId) {
      await updateUser(editingId, {
        nickName: values.nickName,
        status: values.status,
        password: values.password
      })
    } else {
      await createUser({
        username: values.username,
        password: values.password,
        nickName: values.nickName,
        status: values.status
      })
    }
    message.success('保存成功')
    setOpen(false)
    load()
  }

  const openRoles = (row: any) => {
    setCurrentUserId(row.id)
    setSelectedRoles([...(row.roleIds || [])])
    setRoleOpen(true)
  }

  const saveRoles = async () => {
    if (currentUserId) await assignRoles(currentUserId, selectedRoles)
    message.success('分配成功')
    setRoleOpen(false)
    load()
  }

  const remove = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除用户「${row.username}」？`,
      okType: 'danger',
      onOk: async () => {
        await deleteUser(row.id)
        message.success('删除成功')
        load()
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username', width: 140 },
    { title: '昵称', dataIndex: 'nickName', width: 140 },
    {
      title: '角色',
      dataIndex: 'roleNames',
      render: (names: string[]) => (
        <>
          {(names || []).map((n) => (
            <Tag key={n} style={{ marginRight: 6 }}>
              {n}
            </Tag>
          ))}
        </>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: number) =>
        v === 1 ? <Tag color="success">正常</Tag> : <Tag color="default">禁用</Tag>
    },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right' as const,
      render: (_: any, row: any) => (
        <>
          <Button type="link" size="small" onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Button type="link" size="small" style={{ color: '#e6a23c' }} onClick={() => openRoles(row)}>
            分配角色
          </Button>
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
            placeholder="用户名/昵称"
            allowClear
            style={{ width: 220 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPageNum(1)
              load(1)
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
          <Button type="primary" ghost onClick={openCreate}>
            新增用户
          </Button>
        </div>

        <Table
          rowKey="id"
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

      <Modal
        title={editingId ? '编辑用户' : '新增用户'}
        width={480}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} preserve={false}>
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input disabled={!!editingId} />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={editingId ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="留空则不修改" />
          </Form.Item>
          <Form.Item label="昵称" name="nickName">
            <Input />
          </Form.Item>
          <Form.Item label="状态" name="status" getValueProps={(v) => ({ checked: v === 1 })} normalize={(v) => (v ? 1 : 0)}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配角色"
        width={420}
        open={roleOpen}
        onCancel={() => setRoleOpen(false)}
        onOk={saveRoles}
        okText="确定"
        cancelText="取消"
      >
        <Checkbox.Group
          value={selectedRoles}
          onChange={(vals) => setSelectedRoles(vals as number[])}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          options={roles.map((r) => ({ label: r.name, value: r.id }))}
        />
      </Modal>
    </div>
  )
}
