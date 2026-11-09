import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, InputNumber, Modal, Table, message } from 'antd'
import { createResource, deleteResource, getResources, updateResource } from '../../api/admin'

export default function ResourceList() {
  const [form] = Form.useForm()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await getResources()
      setRows(r.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    form.setFieldsValue({ name: '', url: '', categoryId: 1 })
    setOpen(true)
  }

  const openEdit = (row: any) => {
    setEditingId(row.id)
    form.setFieldsValue(row)
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    if (editingId) await updateResource(editingId, { ...values, id: editingId })
    else await createResource({ ...values })
    message.success('保存成功')
    setOpen(false)
    load()
  }

  const remove = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除资源「${row.name}」？`,
      okType: 'danger',
      onOk: async () => {
        await deleteResource(row.id)
        message.success('删除成功')
        load()
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '资源名', dataIndex: 'name', width: 180 },
    { title: '资源URL', dataIndex: 'url' },
    { title: '分类ID', dataIndex: 'categoryId', width: 100 },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, row: any) => (
        <>
          <Button type="link" size="small" onClick={() => openEdit(row)}>
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
          <Button type="primary" ghost onClick={openCreate}>
            新增资源
          </Button>
          <Button onClick={load}>刷新</Button>
        </div>
        <Table rowKey="id" bordered loading={loading} dataSource={rows} columns={columns} pagination={false} />
      </Card>

      <Modal
        title={editingId ? '编辑资源' : '新增资源'}
        width={480}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} preserve={false}>
          <Form.Item label="资源名" name="name" rules={[{ required: true, message: '请输入资源名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="URL" name="url">
            <Input />
          </Form.Item>
          <Form.Item label="分类ID" name="categoryId">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
