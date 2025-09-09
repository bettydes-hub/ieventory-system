import React, { useState } from 'react';
import { Table, Button, Card, Typography, Space, Tag, Modal, Form, Input, message, Alert } from 'antd';
import { UndoOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { ColumnsType } from 'antd/es/table';
import type { BorrowedItem } from '@/types';

const { Title, Text } = Typography;

const ReturnItem: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<BorrowedItem | null>(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const borrowedItems: BorrowedItem[] = [
    {
      borrowId: '1',
      itemId: '1',
      item: {
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
      userId: 'user1',
      quantity: 1,
      borrowDate: '2024-01-15',
      dueDate: '2024-01-22',
      status: 'Active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      borrowId: '2',
      itemId: '2',
      item: {
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
      userId: 'user1',
      quantity: 1,
      borrowDate: '2024-01-10',
      dueDate: '2024-01-17',
      status: 'Overdue',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
    },
    {
      borrowId: '3',
      itemId: '3',
      item: {
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
      userId: 'user1',
      quantity: 1,
      borrowDate: '2024-01-18',
      dueDate: '2024-01-25',
      status: 'Active',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18',
    },
  ];

  const handleReturn = (item: BorrowedItem) => {
    setSelectedItem(item);
    setReturnModalVisible(true);
    form.resetFields();
  };

  const handleReturnSubmit = async (values: any) => {
    try {
      // API call to return item
      console.log('Return item:', {
        borrowId: selectedItem?.borrowId,
        ...values,
      });
      
      message.success('Item returned successfully!');
      setReturnModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to return item');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Overdue':
        return 'error';
      case 'Returned':
        return 'default';
      default:
        return 'default';
    }
  };

  const getDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft < 0) return '#ff4d4f';
    if (daysLeft <= 2) return '#faad14';
    return '#52c41a';
  };

  const columns: ColumnsType<BorrowedItem> = [
    {
      title: 'Item Name',
      dataIndex: ['item', 'name'],
      key: 'itemName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.item.model && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Model: {record.item.model}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: ['item', 'description'],
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <Text strong>{quantity}</Text>
      ),
    },
    {
      title: 'Borrow Date',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => {
        const daysLeft = getDaysLeft(date);
        return (
          <div>
            <div>{new Date(date).toLocaleDateString()}</div>
            <Text
              style={{
                color: getDaysLeftColor(daysLeft),
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              {daysLeft < 0
                ? `${Math.abs(daysLeft)} days overdue`
                : `${daysLeft} days left`}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
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
            icon={<UndoOutlined />}
            onClick={() => handleReturn(record)}
            disabled={record.status === 'Returned'}
          >
            Return
          </Button>
        </Space>
      ),
    },
  ];

  const overdueItems = borrowedItems.filter(item => item.status === 'Overdue');
  const activeItems = borrowedItems.filter(item => item.status === 'Active');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Return Item
        </Title>
        <Text type="secondary">
          View your borrowed items and return them when done
        </Text>
      </div>

      {/* Overdue Items Alert */}
      {overdueItems.length > 0 && (
        <Alert
          message={`You have ${overdueItems.length} overdue item(s)`}
          description="Please return overdue items as soon as possible to avoid penalties."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Summary Cards */}
      <div style={{ marginBottom: 16 }}>
        <Space size="large">
          <Card size="small">
            <Text strong>Active Borrows: </Text>
            <Text style={{ color: brandColors.success, fontWeight: 'bold' }}>
              {activeItems.length}
            </Text>
          </Card>
          <Card size="small">
            <Text strong>Overdue Items: </Text>
            <Text style={{ color: brandColors.error, fontWeight: 'bold' }}>
              {overdueItems.length}
            </Text>
          </Card>
        </Space>
      </div>

      {/* Borrowed Items Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={borrowedItems}
          rowKey="borrowId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} borrowed items`,
          }}
        />
      </Card>

      {/* Return Modal */}
      <Modal
        title={`Return Item: ${selectedItem?.item.name}`}
        open={returnModalVisible}
        onCancel={() => setReturnModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReturnSubmit}
        >
          <Form.Item
            name="condition"
            label="Item Condition"
            rules={[{ required: true, message: 'Please select item condition' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Describe the current condition of the item..."
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Return Notes"
          >
            <Input.TextArea
              rows={2}
              placeholder="Any additional notes about the return..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setReturnModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<UndoOutlined />}>
                Confirm Return
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReturnItem;
