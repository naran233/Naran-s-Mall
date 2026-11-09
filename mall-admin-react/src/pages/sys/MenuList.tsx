import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, InputNumber, Modal, Table, message } from 'antd'
import { createMenu, deleteMenu, getMenuTree, updateMenu } from '../../api/admin'

const flattenIds = (list: any[]): number[] =>
  (list || []).flatMap((n) => [n.id, ...flattenIds(n.children || [])])

export default function MenuList() {
  const [form] = Form.useForm()
  const [tree, setTree] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedKeys, setExpandedKeys] = useState<number[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await getMenuTree()
      setTree(r.data || [])
      setExpandedKeys(flattenIds(r.data || []))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = (parentId: number) => {
    setEditingId(null)
    form.setFieldsValue({ title: '', name: '', icon: '', parentId, sort: 0 })
    setOpen(true)
  }

  const openEdit = (row: any) => {
    setEditingId(row.id)
    form.setFieldsValue({
      title: row.title,
      name: row.name,
      icon: row.icon,
      parentId: row.parentId,
      sort: row.sort
    })
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    if (editingId) await updateMenu(editingId, { ...values, id: editingId, type: 1, hidden: 0 })
    else await createMenu({ ...values, type: 1, hidden: 0 })
    message.success('保存成功')
    setOpen(false)
    load()
  }

  const remove = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除菜单「${row.title}」？`,
      okType: 'danger',
      onOk: async () => {
        await deleteMenu(row.id)
        message.success('删除成功')
        load()
      }
    })
  }

  const columns = [
    { title: '菜单名', dataIndex: 'title', width: 200 },
    { title: '路由名', dataIndex: 'name', width: 160 },
    { title: '图标', dataIndex: 'icon', width: 130 },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: any, row: any) => (
        <>
          <Button type="link" size="small" onClick={() => openCreate(row.id)}>
            添加子项
          </Button>
          <Button type="link" size="small" style={{ color: '#e6a23c' }} onClick={() => openEdit(row)}>
            编辑
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
          <Button type="primary" ghost onClick={() => openCreate(0)}>
            新增菜单
          </Button>
          <Button onClick={load}>刷新</Button>
        </div>
        <Table
          rowKey="id"
          bordered
          loading={loading}
          dataSource={tree}
          columns={columns}
          pagination={false}
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpandedRowsChange: (keys) => setExpandedKeys(keys as number[])
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑菜单' : '新增菜单'}
        width={500}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} preserve={false}>
          <Form.Item label="菜单名" name="title" rules={[{ required: true, message: '请输入菜单名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="路由名" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="图标" name="icon">
            <Input placeholder="Ant Design 图标名，如 DashboardOutlined" />
          </Form.Item>
          <Form.Item label="上级ID" name="parentId">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="排序" name="sort">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
