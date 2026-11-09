import { useEffect, useState } from 'react'
import {
  Image,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
  TreeSelect,
  Row,
  Col,
  message
} from 'antd'
import {
  createProduct,
  deleteProduct,
  getBrands,
  getCategoryTree,
  getProducts,
  publishProduct,
  updateProduct
} from '../../api/admin'

const pageSize = 10

const mapTree = (list: any[]): any[] =>
  (list || []).map((n) => ({
    title: n.name,
    value: n.id,
    children: n.children?.length ? mapTree(n.children) : undefined
  }))

export default function ProductList() {
  const [form] = Form.useForm()
  const [rows, setRows] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async (page = pageNum, kw = keyword) => {
    setLoading(true)
    try {
      const r = await getProducts({ keyword: kw, pageNum: page, pageSize })
      setRows(r.data?.list || [])
      setTotal(r.data?.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      const [b, c] = await Promise.all([getBrands(), getCategoryTree()])
      setBrands(b.data || [])
      setCategories(c.data || [])
      load(1, '')
    })()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      name: '',
      price: 0,
      stock: 0,
      brandId: null,
      productCategoryId: null,
      pic: '',
      description: '',
      newStatus: 0,
      recommandStatus: 0,
      publishStatus: 1
    })
    setOpen(true)
  }

  const openEdit = (row: any) => {
    setEditingId(row.id)
    form.resetFields()
    form.setFieldsValue(row)
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (editingId) {
        await updateProduct(editingId, { ...values, id: editingId })
      } else {
        await createProduct({ product: { ...values }, skus: [] })
      }
      message.success('保存成功')
      setOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async (row: any) => {
    await publishProduct(row.id, row.publishStatus === 1 ? 0 : 1)
    message.success('操作成功')
    load()
  }

  const remove = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除商品「${row.name}」？`,
      okType: 'danger',
      onOk: async () => {
        await deleteProduct(row.id)
        message.success('删除成功')
        load()
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '商品名称', dataIndex: 'name', ellipsis: true },
    {
      title: '图片',
      dataIndex: 'pic',
      width: 90,
      render: (pic: string) => (
        <Image src={pic} width={56} height={56} style={{ objectFit: 'cover', borderRadius: 4 }} />
      )
    },
    { title: '价格', dataIndex: 'price', width: 100, render: (v: any) => `￥${v}` },
    { title: '库存', dataIndex: 'stock', width: 90 },
    { title: '销量', dataIndex: 'sale', width: 90 },
    {
      title: '状态',
      dataIndex: 'publishStatus',
      width: 100,
      render: (v: number) =>
        v === 1 ? <Tag color="success">已上架</Tag> : <Tag color="default">已下架</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, row: any) => (
        <>
          <Button type="link" size="small" onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Button type="link" size="small" style={{ color: '#e6a23c' }} onClick={() => togglePublish(row)}>
            {row.publishStatus === 1 ? '下架' : '上架'}
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
            placeholder="搜索商品名称"
            allowClear
            style={{ width: 240 }}
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
            新增商品
          </Button>
        </div>

        <Table
          rowKey="id"
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
        title={editingId ? '编辑商品' : '新增商品'}
        width={620}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={save}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} preserve={false}>
          <Form.Item label="商品名称" name="name" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input />
          </Form.Item>
          <Row>
            <Col span={12}>
              <Form.Item label="价格" name="price" labelCol={{ span: 8 }}>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="库存" name="stock" labelCol={{ span: 8 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="品牌" name="brandId" labelCol={{ span: 8 }}>
                <Select
                  placeholder="选择品牌"
                  allowClear
                  options={brands.map((b) => ({ label: b.name, value: b.id }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="分类" name="productCategoryId" labelCol={{ span: 8 }}>
                <TreeSelect
                  placeholder="选择分类"
                  allowClear
                  treeDefaultExpandAll
                  treeData={mapTree(categories)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="图片地址" name="pic">
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row>
            <Col span={8}>
              <Form.Item
                label="新品"
                name="newStatus"
                labelCol={{ span: 10 }}
                getValueProps={(v) => ({ checked: v === 1 })}
                normalize={(v) => (v ? 1 : 0)}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="推荐"
                name="recommandStatus"
                labelCol={{ span: 10 }}
                getValueProps={(v) => ({ checked: v === 1 })}
                normalize={(v) => (v ? 1 : 0)}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="上架"
                name="publishStatus"
                labelCol={{ span: 10 }}
                getValueProps={(v) => ({ checked: v === 1 })}
                normalize={(v) => (v ? 1 : 0)}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
