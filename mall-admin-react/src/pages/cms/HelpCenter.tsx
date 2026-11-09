import { useEffect, useState } from 'react'
import {
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
  message
} from 'antd'
import {
  createHelp,
  createHelpCategory,
  deleteHelp,
  deleteHelpCategory,
  getHelpCategories,
  getHelps,
  updateHelp,
  updateHelpCategory
} from '../../api/admin'

const pageSize = 10

export default function HelpCenter() {
  const [catForm] = Form.useForm()
  const [artForm] = Form.useForm()
  const [categories, setCategories] = useState<any[]>([])
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)

  const [catOpen, setCatOpen] = useState(false)
  const [catEditingId, setCatEditingId] = useState<number | null>(null)
  const [artOpen, setArtOpen] = useState(false)
  const [artEditingId, setArtEditingId] = useState<number | null>(null)

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name || '—'

  const loadCategories = async () => {
    const r = await getHelpCategories()
    setCategories(r.data || [])
  }

  const load = async (page = pageNum, catId = categoryId, kw = keyword) => {
    setLoading(true)
    try {
      const r = await getHelps({ categoryId: catId, keyword: kw, pageNum: page, pageSize })
      setRows(r.data?.list || [])
      setTotal(r.data?.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadCategories()
      load(1, undefined, '')
    })()
  }, [])

  const selectCategory = (id?: number) => {
    setCategoryId(id)
    setPageNum(1)
    load(1, id)
  }

  const openCategory = (row?: any) => {
    setCatEditingId(row?.id ?? null)
    catForm.setFieldsValue(
      row
        ? { name: row.name, sort: row.sort, showStatus: row.showStatus }
        : { name: '', sort: 0, showStatus: 1 }
    )
    setCatOpen(true)
  }

  const saveCategory = async () => {
    const values = await catForm.validateFields()
    if (catEditingId) await updateHelpCategory(catEditingId, { ...values, id: catEditingId })
    else await createHelpCategory({ ...values })
    message.success('保存成功')
    setCatOpen(false)
    await loadCategories()
    load()
  }

  const removeCategory = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除分类「${row.name}」？`,
      okType: 'danger',
      onOk: async () => {
        await deleteHelpCategory(row.id)
        message.success('删除成功')
        await loadCategories()
        load()
      }
    })
  }

  const openArticle = (row?: any) => {
    setArtEditingId(row?.id ?? null)
    artForm.setFieldsValue(
      row
        ? {
            categoryId: row.categoryId,
            title: row.title,
            content: row.content,
            sort: row.sort,
            showStatus: row.showStatus
          }
        : {
            categoryId: categoryId ?? categories[0]?.id ?? null,
            title: '',
            content: '',
            sort: 0,
            showStatus: 1
          }
    )
    setArtOpen(true)
  }

  const saveArticle = async () => {
    const values = await artForm.validateFields()
    if (artEditingId) await updateHelp(artEditingId, { ...values, id: artEditingId })
    else await createHelp({ ...values })
    message.success('保存成功')
    setArtOpen(false)
    load()
  }

  const removeArticle = (row: any) => {
    Modal.confirm({
      title: '提示',
      content: `确认删除文章「${row.title}」？`,
      okType: 'danger',
      onOk: async () => {
        await deleteHelp(row.id)
        message.success('删除成功')
        load()
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: '分类',
      dataIndex: 'categoryId',
      width: 120,
      render: (id: number) => categoryName(id)
    },
    { title: '标题', dataIndex: 'title' },
    { title: '阅读量', dataIndex: 'readCount', width: 90 },
    {
      title: '状态',
      dataIndex: 'showStatus',
      width: 90,
      render: (v: number) =>
        v === 1 ? <Tag color="success">显示</Tag> : <Tag color="default">隐藏</Tag>
    },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_: any, row: any) => (
        <>
          <Button type="link" size="small" onClick={() => openArticle(row)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => removeArticle(row)}>
            删除
          </Button>
        </>
      )
    }
  ]

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <Card
        style={{ width: 240, flexShrink: 0 }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b>帮助分类</b>
            <Button type="primary" size="small" onClick={() => openCategory()}>
              新增
            </Button>
          </div>
        }
      >
        <div
          onClick={() => selectCategory(undefined)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '9px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            background: categoryId === undefined ? '#ecf5ff' : undefined,
            color: categoryId === undefined ? '#409eff' : '#606266',
            fontWeight: categoryId === undefined ? 600 : 400
          }}
        >
          全部文章
        </div>
        {categories.map((c) => (
          <div
            key={c.id}
            onClick={() => selectCategory(c.id)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '9px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              background: categoryId === c.id ? '#ecf5ff' : undefined,
              color: categoryId === c.id ? '#409eff' : '#606266',
              fontWeight: categoryId === c.id ? 600 : 400
            }}
          >
            <span>{c.name}</span>
            <span>
              <Button type="link" size="small" onClick={(e) => (e.stopPropagation(), openCategory(c))}>
                改
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={(e) => (e.stopPropagation(), removeCategory(c))}
              >
                删
              </Button>
            </span>
          </div>
        ))}
      </Card>

      <Card style={{ flex: 1, minWidth: 0 }}>
        <div className="page-toolbar">
          <Input
            placeholder="标题 / 内容关键词"
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
          <Button type="primary" ghost onClick={() => openArticle()}>
            新增文章
          </Button>
        </div>
        <Table
          rowKey="id"
          bordered
          loading={loading}
          dataSource={rows}
          columns={columns}
          scroll={{ x: 900 }}
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
        title={catEditingId ? '编辑分类' : '新增分类'}
        width={420}
        open={catOpen}
        onCancel={() => setCatOpen(false)}
        onOk={saveCategory}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={catForm} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} preserve={false}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请填写分类名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="排序" name="sort">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item label="状态" name="showStatus" getValueProps={(v) => ({ checked: v === 1 })} normalize={(v) => (v ? 1 : 0)}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={artEditingId ? '编辑文章' : '新增文章'}
        width={640}
        open={artOpen}
        onCancel={() => setArtOpen(false)}
        onOk={saveArticle}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={artForm} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} preserve={false}>
          <Form.Item label="分类" name="categoryId" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={categories.map((c) => ({ label: c.name, value: c.id }))} />
          </Form.Item>
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请填写标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="内容" name="content">
            <Input.TextArea rows={8} />
          </Form.Item>
          <Form.Item label="排序" name="sort">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item label="状态" name="showStatus" getValueProps={(v) => ({ checked: v === 1 })} normalize={(v) => (v ? 1 : 0)}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
