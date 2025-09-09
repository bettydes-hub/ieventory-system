import React, { useState } from 'react';
import { Table, Button, Input, Select, Card, Typography, Space, Tag, Modal, Form, DatePicker, message } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { ColumnsType } from 'antd/es/table';
import type { Item } from '@/types';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const BorrowItem: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const items: Item[] = [
    {
      itemId: '1',
      name: 'Laptop - Dell XPS 13',
      description: 'High-performance laptop for development work',
      model: 'XPS 13 9320',
      serialNumber: 'DLX001',
      manufacturer: 'Dell',
      categoryId: 'cat1',
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
      description: '24-inch LED monitor with Full HD resolution',
      model: 'S24F350',
      serialNumber: 'SAM001',
      manufacturer: 'Samsung',
      categoryId: 'cat2',
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
      description: 'Wireless mouse with advanced features',
      model: 'MX Master 3',
      serialNumber: 'LOG001',
      manufacturer: 'Logitech',
      categoryId: 'cat3',
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
      description: 'RGB mechanical keyboard with blue switches',
      model: 'K95 RGB',
      serialNumber: 'COR001',
      manufacturer: 'Corsair',
      categoryId: 'cat3',
      storeId: 'store1',
      quantity: 3,
      minStockLevel: 2,
      maxStockLevel: 8,
      status: 'available',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const categories = [
    { id: 'cat1', name: 'Laptops' },
    { id: 'cat2', name: 'Monitors' },
    { id: 'cat3', name: 'Accessories' },
  ];

  const handleRequest = (item: Item) => {
    setSelectedItem(item);
    setRequestModalVisible(true);
    form.resetFields();
  };

  const handleRequestSubmit = async (values: any) => {
    try {
      // API call to submit borrow request
      console.log('Borrow request:', {
        itemId: selectedItem?.itemId,
        ...values,
      });
      
      message.success('Borrow request submitted successfully!');
      setRequestModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to submit borrow request');
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
      title: 'Available',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <Text strong style={{ color: quantity > 0 ? brandColors.success : brandColors.error }}>
          {quantity}
        </Text>
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
            onClick={() => {
              // Show item details
              console.log('View details:', record);
            }}
          >
            Details
          </Button>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleRequest(record)}
            disabled={record.quantity === 0 || record.status !== 'available'}
          >
            Request
          </Button>
        </Space>
      ),
    },
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.manufacturer?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !categoryFilter || item.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Borrow Item
        </Title>
        <Text type="secondary">
          Browse available items and submit borrow requests
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
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
        </Space>
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

      {/* Request Modal */}
      <Modal
        title={`Request to Borrow: ${selectedItem?.name}`}
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRequestSubmit}
        >
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[
              { required: true, message: 'Please enter quantity' },
              { type: 'number', min: 1, message: 'Quantity must be at least 1' },
            ]}
            initialValue={1}
          >
            <Input
              type="number"
              min={1}
              max={selectedItem?.quantity}
              placeholder="Enter quantity to borrow"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason for Borrowing"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Explain why you need this item..."
            />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Expected Return Date"
            rules={[{ required: true, message: 'Please select return date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Select return date"
              disabledDate={(current) => current && current < new Date()}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Additional Notes"
          >
            <Input.TextArea
              rows={2}
              placeholder="Any additional information..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRequestModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit Request
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BorrowItem;
