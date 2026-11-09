import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, InputNumber, Modal, Table, message } from 'antd'
import { createCategory, deleteCategory, getCategoryTree, updateCategory } from '../../api/admin'

const flattenIds = (list: any[]): number[] =>
  (list || []).flatMap((n) => [n.id, ...flattenIds(n.children || [])])

export default function CategoryList() {
  const [form] = Form.useForm()
  const [tree, setTree] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<number[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const r = await getCategoryTree()
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
    form.setFieldsValue({ name: '', parentId, sort: 0 })
    setOpen(true)
  }

  const openEdit = (row: any) => {
    setEditingId(row.id)
    form.setFieldsValue({ name: row.name, parentId: row.parentId, sort: row.sort })
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    if (editingId) {
      await updateCategory(editingId, { ...values, id: editingId })
    } else {
      await createCategory({ ...values, level: values.parentId === 0 ? 0 : 1 })
    }
    message.success('保存成功')
    setOpen(false)
    load()
  }

  const remove = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除分类「${row.name}」及其子类？`,
      okType: 'danger',
      onOk: async () => {
        await deleteCategory(row.id)
        message.success('删除成功')
        load()
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '分类名称', dataIndex: 'name' },
    {
      title: '层级',
      dataIndex: 'level',
      width: 90,
      render: (v: number) => (v === 0 ? '一级' : '二级')
    },
    { title: '排序', dataIndex: 'sort', width: 90 },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_: any, row: any) => (
        <>
          <Button type="link" size="small" onClick={() => openCreate(row.id)}>
            添加子类
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
            新增一级分类
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
        title={editingId ? '编辑分类' : '新增分类'}
        width={480}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} preserve={false}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
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
