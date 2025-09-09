import React, { useState } from 'react';
import { Table, Button, Input, Select, Card, Typography, Space, Tag, Modal, Form, InputNumber, DatePicker, message, Popconfirm, Upload, Image } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { ColumnsType } from 'antd/es/table';
import type { Item, CreateItemData } from '@/types';
import ItemDetailModal from '@/components/ItemDetailModal';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ManageItems: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const [items, setItems] = useState<Item[]>([
    {
      itemId: '1',
      name: 'Laptop - Dell XPS 13',
      description: 'High-performance laptop for development work with 13.4" 4K display, Intel i7 processor, 16GB RAM, and 512GB SSD storage. Perfect for software development and design work.',
      model: 'XPS 13 9320',
      serialNumber: 'DLX001',
      manufacturer: 'Dell',
      categoryId: 'cat1',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      specifications: {
        brand: 'Dell',
        model: 'XPS 13 9320',
        serialNumber: 'DLX001',
        purchaseDate: '2024-01-15',
        warrantyExpiry: '2027-01-15',
        condition: 'Excellent'
      },
      storeId: 'store1',
      quantity: 5,
      minStockLevel: 2,
      maxStockLevel: 10,
      status: 'available',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      itemId: '2',
      name: 'Monitor - Samsung 24"',
      description: '24-inch LED monitor with Full HD resolution, 1920x1080 pixels, 60Hz refresh rate, and excellent color accuracy. Perfect for office work and multimedia consumption.',
      model: 'S24F350',
      serialNumber: 'SAM001',
      manufacturer: 'Samsung',
      categoryId: 'cat2',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
      specifications: {
        brand: 'Samsung',
        model: 'S24F350',
        serialNumber: 'SAM001',
        purchaseDate: '2024-01-10',
        warrantyExpiry: '2026-01-10',
        condition: 'Good'
      },
      storeId: 'store1',
      quantity: 8,
      minStockLevel: 3,
      maxStockLevel: 15,
      status: 'available',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      itemId: '3',
      name: 'Mouse - Logitech MX Master',
      description: 'Wireless mouse with advanced features including precision tracking, ergonomic design, and multi-device connectivity. Features 70-day battery life and customizable buttons.',
      model: 'MX Master 3',
      serialNumber: 'LOG001',
      manufacturer: 'Logitech',
      categoryId: 'cat3',
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
      specifications: {
        brand: 'Logitech',
        model: 'MX Master 3',
        serialNumber: 'LOG001',
        purchaseDate: '2024-01-05',
        warrantyExpiry: '2025-01-05',
        condition: 'Excellent'
      },
      storeId: 'store1',
      quantity: 12,
      minStockLevel: 5,
      maxStockLevel: 20,
      status: 'available',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      itemId: '4',
      name: 'Keyboard - Mechanical',
      description: 'RGB mechanical keyboard with blue switches, customizable lighting, and premium build quality. Features programmable keys and durable construction.',
      model: 'K95 RGB',
      serialNumber: 'COR001',
      manufacturer: 'Corsair',
      categoryId: 'cat3',
      imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop',
      specifications: {
        brand: 'Corsair',
        model: 'K95 RGB',
        serialNumber: 'COR001',
        purchaseDate: '2023-12-20',
        warrantyExpiry: '2025-12-20',
        condition: 'Under Maintenance'
      },
      storeId: 'store1',
      quantity: 0,
      minStockLevel: 2,
      maxStockLevel: 8,
      status: 'maintenance',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ]);

  const categories = [
    { id: 'cat1', name: 'Laptops' },
    { id: 'cat2', name: 'Monitors' },
    { id: 'cat3', name: 'Accessories' },
  ];

  const stores = [
    { id: 'store1', name: 'Main Store' },
    { id: 'store2', name: 'Branch Store' },
  ];

  const handleAdd = () => {
    setSelectedItem(null);
    setModalMode('add');
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setModalMode('edit');
    setModalVisible(true);
    form.setFieldsValue({
      ...item,
      purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
    });
  };

  const handleView = (item: Item) => {
    setSelectedItem(item);
    setModalMode('view');
    setModalVisible(true);
    form.setFieldsValue({
      ...item,
      purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
    });
  };

  const handleDelete = (itemId: string) => {
    setItems(items.filter(item => item.itemId !== itemId));
    message.success('Item deleted successfully');
  };

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (modalMode === 'add') {
        const newItem: Item = {
          itemId: Date.now().toString(),
          ...values,
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setItems([...items, newItem]);
        message.success('Item added successfully');
      } else if (modalMode === 'edit' && selectedItem) {
        const updatedItems = items.map(item =>
          item.itemId === selectedItem.itemId
            ? { ...item, ...values, updatedAt: new Date().toISOString() }
            : item
        );
        setItems(updatedItems);
        message.success('Item updated successfully');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save item');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'damaged':
        return 'error';
      case 'retired':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const columns: ColumnsType<Item> = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.model && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Model: {record.model}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_, record) => (
        <div>
          <Text strong style={{ color: record.quantity > 0 ? brandColors.success : brandColors.error }}>
            {record.quantity}
          </Text>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
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
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            title="View Details"
          >
            Details
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.itemId)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.manufacturer?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !categoryFilter || item.categoryId === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Manage Items
        </Title>
        <Text type="secondary">
          Add, edit, and manage inventory items
        </Text>
      </div>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space wrap>
            <Search
              placeholder="Search items..."
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by category"
              allowClear
              style={{ width: 200 }}
              value={categoryFilter}
              onChange={setCategoryFilter}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="available">Available</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="damaged">Damaged</Option>
              <Option value="retired">Retired</Option>
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Item
          </Button>
        </div>
      </Card>

      {/* Items Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="itemId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={`${modalMode === 'add' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Item`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={modalMode === 'view' ? [
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ] : null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={modalMode === 'view'}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Item Name"
              rules={[{ required: true, message: 'Please enter item name' }]}
            >
              <Input placeholder="Enter item name" />
            </Form.Item>

            <Form.Item
              name="model"
              label="Model"
            >
              <Input placeholder="Enter model number" />
            </Form.Item>

            <Form.Item
              name="manufacturer"
              label="Manufacturer"
            >
              <Input placeholder="Enter manufacturer" />
            </Form.Item>

            <Form.Item
              name="serialNumber"
              label="Serial Number"
            >
              <Input placeholder="Enter serial number" />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="storeId"
              label="Store"
              rules={[{ required: true, message: 'Please select store' }]}
            >
              <Select placeholder="Select store">
                {stores.map(store => (
                  <Option key={store.id} value={store.id}>
                    {store.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Please enter quantity' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter quantity" />
            </Form.Item>

            <Form.Item
              name="purchasePrice"
              label="Purchase Price"
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Enter price" />
            </Form.Item>

            <Form.Item
              name="minStockLevel"
              label="Minimum Stock Level"
              rules={[{ required: true, message: 'Please enter minimum stock level' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter minimum stock" />
            </Form.Item>

            <Form.Item
              name="maxStockLevel"
              label="Maximum Stock Level"
              rules={[{ required: true, message: 'Please enter maximum stock level' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter maximum stock" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter item description" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Item Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload.Dragger
              name="image"
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false} // Prevent auto upload
              accept="image/*"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag image to this area to upload</p>
              <p className="ant-upload-hint">
                Support for single image upload. Max size: 5MB
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            name="purchaseDate"
            label="Purchase Date"
          >
            <DatePicker style={{ width: '100%' }} placeholder="Select purchase date" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={2} placeholder="Enter additional notes" />
          </Form.Item>

          {modalMode !== 'view' && (
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {modalMode === 'add' ? 'Add Item' : 'Update Item'}
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Item Detail Modal */}
      <ItemDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default ManageItems;
