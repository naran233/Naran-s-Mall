import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Table,
  Tree,
  message
} from 'antd'
import {
  assignMenus,
  assignResources,
  createRole,
  deleteRole,
  getMenuTree,
  getResources,
  getRoles,
  updateRole
} from '../../api/admin'

const toTreeData = (list: any[]): any[] =>
  (list || []).map((n) => ({
    key: n.id,
    title: n.title,
    children: n.children?.length ? toTreeData(n.children) : undefined
  }))

export default function RoleList() {
  const [form] = Form.useForm()
  const [rows, setRows] = useState<any[]>([])
  const [menuTree, setMenuTree] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [resourceOpen, setResourceOpen] = useState(false)
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null)
  const [checkedMenus, setCheckedMenus] = useState<number[]>([])
  const [selectedResources, setSelectedResources] = useState<number[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const r = await getRoles()
      setRows(r.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      const [m, res] = await Promise.all([getMenuTree(), getResources()])
      setMenuTree(toTreeData(m.data || []))
      setResources(res.data || [])
      load()
    })()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    form.setFieldsValue({ name: '', description: '' })
    setOpen(true)
  }

  const openEdit = (row: any) => {
    setEditingId(row.id)
    form.setFieldsValue({ name: row.name, description: row.description })
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    if (editingId) await updateRole(editingId, { ...values, id: editingId })
    else await createRole({ ...values })
    message.success('保存成功')
    setOpen(false)
    load()
  }

  const openMenu = (row: any) => {
    setCurrentRoleId(row.id)
    setCheckedMenus([])
    setMenuOpen(true)
  }

  const saveMenus = async () => {
    if (currentRoleId) await assignMenus(currentRoleId, checkedMenus)
    message.success('分配成功')
    setMenuOpen(false)
  }

  const openResource = (row: any) => {
    setCurrentRoleId(row.id)
    setSelectedResources([])
    setResourceOpen(true)
  }

  const saveResources = async () => {
    if (currentRoleId) await assignResources(currentRoleId, selectedResources)
    message.success('分配成功')
    setResourceOpen(false)
  }

  const remove = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除角色「${row.name}」？`,
      okType: 'danger',
      onOk: async () => {
        await deleteRole(row.id)
        message.success('删除成功')
        load()
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '角色名', dataIndex: 'name', width: 160 },
    { title: '描述', dataIndex: 'description' },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right' as const,
      render: (_: any, row: any) => (
        <>
          <Button type="link" size="small" onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Button type="link" size="small" style={{ color: '#e6a23c' }} onClick={() => openMenu(row)}>
            分配菜单
          </Button>
          <Button type="link" size="small" style={{ color: '#e6a23c' }} onClick={() => openResource(row)}>
            分配资源
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
          <Button type="primary" ghost onClick={openCreate}>
            新增角色
          </Button>
          <Button onClick={load}>刷新</Button>
        </div>
        <Table rowKey="id" bordered loading={loading} dataSource={rows} columns={columns} scroll={{ x: 1000 }} pagination={false} />
      </Card>

      <Modal
        title={editingId ? '编辑角色' : '新增角色'}
        width={460}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} preserve={false}>
          <Form.Item label="角色名" name="name" rules={[{ required: true, message: '请输入角色名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配菜单"
        width={480}
        open={menuOpen}
        onCancel={() => setMenuOpen(false)}
        onOk={saveMenus}
        okText="确定"
        cancelText="取消"
      >
        <Tree
          checkable
          defaultExpandAll
          treeData={menuTree}
          checkedKeys={checkedMenus}
          onCheck={(keys) => setCheckedMenus(keys as number[])}
        />
      </Modal>

      <Modal
        title="分配资源"
        width={480}
        open={resourceOpen}
        onCancel={() => setResourceOpen(false)}
        onOk={saveResources}
        okText="确定"
        cancelText="取消"
      >
        <Checkbox.Group
          value={selectedResources}
          onChange={(vals) => setSelectedResources(vals as number[])}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          options={resources.map((r) => ({ label: `${r.name} (${r.url})`, value: r.id }))}
        />
      </Modal>
    </div>
  )
}
