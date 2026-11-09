import { useEffect, useState } from 'react'
import { Button, Card, Form, Image, Input, InputNumber, Modal, Table, message } from 'antd'
import { createBrand, deleteBrand, getBrands, updateBrand } from '../../api/admin'

export default function BrandList() {
  const [form] = Form.useForm()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await getBrands()
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
    form.setFieldsValue({ name: '', logo: '', description: '', sort: 0, showStatus: 1 })
    setOpen(true)
  }

  const openEdit = (row: any) => {
    setEditingId(row.id)
    form.setFieldsValue(row)
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    if (editingId) await updateBrand(editingId, { ...values, id: editingId })
    else await createBrand({ ...values })
    message.success('保存成功')
    setOpen(false)
    load()
  }

  const remove = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除品牌「${row.name}」？`,
      okType: 'danger',
      onOk: async () => {
        await deleteBrand(row.id)
        message.success('删除成功')
        load()
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '品牌名称', dataIndex: 'name' },
    {
      title: 'Logo',
      dataIndex: 'logo',
      width: 110,
      render: (logo: string) => (
        <Image src={logo} width={64} height={40} style={{ objectFit: 'contain' }} />
      )
    },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '操作',
      key: 'action',
      width: 160,
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
            新增品牌
          </Button>
          <Button onClick={load}>刷新</Button>
        </div>
        <Table rowKey="id" bordered loading={loading} dataSource={rows} columns={columns} pagination={false} />
      </Card>

      <Modal
        title={editingId ? '编辑品牌' : '新增品牌'}
        width={480}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} preserve={false}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入品牌名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Logo地址" name="logo">
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="排序" name="sort">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
