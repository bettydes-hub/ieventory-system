import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Tag,
  Modal,
  Form,
  InputNumber,
  Upload,
  message,
  Typography,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  QrcodeOutlined,
  SwapOutlined,
  EyeOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useInventory } from '@/hooks/useInventory';
import { Item, CreateItemData } from '@/types';
import { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const Inventory: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [form] = Form.useForm();

  const {
    items,
    itemsLoading,
    categories,
    stores,
    suppliers,
    createItem,
    updateItem,
    deleteItem,
    isCreatingItem,
    isUpdatingItem,
    isDeletingItem,
  } = useInventory();

  const handleAddItem = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : undefined,
    });
    setIsModalVisible(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      message.success('Item deleted successfully');
    } catch (error) {
      message.error('Failed to delete item');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingItem) {
        await updateItem(editingItem.itemId, values);
        message.success('Item updated successfully');
      } else {
        await createItem(values);
        message.success('Item created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save item');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'maintenance':
        return 'orange';
      case 'damaged':
        return 'red';
      case 'retired':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const columns: ColumnsType<Item> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.serialNumber && `SN: ${record.serialNumber}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? category.name : 'Unknown';
      },
    },
    {
      title: 'Store',
      dataIndex: 'storeId',
      key: 'storeId',
      render: (storeId) => {
        const store = stores.find(s => s.storeId === storeId);
        return store ? store.name : 'Unknown';
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <div>
          <div>{quantity}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Min: {record.minStockLevel} | Max: {record.maxStockLevel}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      render: (price) => price ? `$${price.toFixed(2)}` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEditItem(record)}
            />
          </Tooltip>
          <Tooltip title="Generate QR Code">
            <Button icon={<QrcodeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Transfer">
            <Button icon={<SwapOutlined />} size="small" />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDeleteItem(record.itemId)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
                loading={isDeletingItem}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.serialNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.manufacturer?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesCategory = !categoryFilter || item.categoryId === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Inventory Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddItem}
          loading={isCreatingItem}
        >
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="available">Available</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="damaged">Damaged</Option>
              <Option value="retired">Retired</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
              allowClear
            >
              {categories.map(category => (
                <Option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Items Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredItems}
          loading={itemsLoading}
          rowKey="itemId"
          pagination={{
            total: filteredItems.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      {/* Add/Edit Item Modal */}
      <Modal
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        confirmLoading={isCreatingItem || isUpdatingItem}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            quantity: 1,
            minStockLevel: 0,
            maxStockLevel: 100,
            status: 'available',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Item Name"
                rules={[{ required: true, message: 'Please enter item name' }]}
              >
                <Input placeholder="Enter item name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="serialNumber"
                label="Serial Number"
              >
                <Input placeholder="Enter serial number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  {categories.map(category => (
                    <Option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="storeId"
                label="Store"
                rules={[{ required: true, message: 'Please select store' }]}
              >
                <Select placeholder="Select store">
                  {stores.map(store => (
                    <Option key={store.storeId} value={store.storeId}>
                      {store.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="manufacturer"
                label="Manufacturer"
              >
                <Input placeholder="Enter manufacturer" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="model"
                label="Model"
              >
                <Input placeholder="Enter model" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minStockLevel"
                label="Min Stock Level"
                rules={[{ required: true, message: 'Please enter min stock level' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxStockLevel"
                label="Max Stock Level"
                rules={[{ required: true, message: 'Please enter max stock level' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purchasePrice"
                label="Purchase Price"
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="purchaseDate"
                label="Purchase Date"
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={2} placeholder="Enter additional notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inventory;