import React, { useState } from 'react';
import { Table, Button, Input, Select, Card, Typography, Space, Tag, Modal, Form, Input as AntInput, message } from 'antd';
import { SearchOutlined, EyeOutlined, TruckOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { ColumnsType } from 'antd/es/table';
import type { Delivery } from '@/types';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = AntInput;

const AssignedDeliveries: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const deliveries: Delivery[] = [
    {
      deliveryId: '1',
      transactionId: 'trans1',
      assignedTo: 'delivery1',
      status: 'Assigned',
      pickupAddress: 'Main Store, 123 Main St, City A',
      deliveryAddress: 'Branch Store A, 456 Branch St, City B',
      scheduledDate: '2024-01-20',
      completedDate: undefined,
      notes: 'Handle with care - fragile items',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
    },
    {
      deliveryId: '2',
      transactionId: 'trans2',
      assignedTo: 'delivery1',
      status: 'In Progress',
      pickupAddress: 'Branch Store B, 789 Branch St, City C',
      deliveryAddress: 'Main Store, 123 Main St, City A',
      scheduledDate: '2024-01-19',
      completedDate: undefined,
      notes: 'Urgent delivery - customer waiting',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-19',
    },
    {
      deliveryId: '3',
      transactionId: 'trans3',
      assignedTo: 'delivery1',
      status: 'Completed',
      pickupAddress: 'Main Store, 123 Main St, City A',
      deliveryAddress: 'Branch Store C, 321 Branch St, City D',
      scheduledDate: '2024-01-18',
      completedDate: '2024-01-18',
      notes: 'Delivered successfully',
      createdAt: '2024-01-17',
      updatedAt: '2024-01-18',
    },
    {
      deliveryId: '4',
      transactionId: 'trans4',
      assignedTo: 'delivery1',
      status: 'Assigned',
      pickupAddress: 'Branch Store D, 654 Branch St, City E',
      deliveryAddress: 'Main Store, 123 Main St, City A',
      scheduledDate: '2024-01-21',
      completedDate: undefined,
      notes: 'Large items - need assistance',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
    },
  ];

  const items = [
    { transactionId: 'trans1', itemName: 'Laptop - Dell XPS 13', quantity: 2 },
    { transactionId: 'trans2', itemName: 'Monitor - Samsung 24"', quantity: 1 },
    { transactionId: 'trans3', itemName: 'Mouse - Logitech MX Master', quantity: 5 },
    { transactionId: 'trans4', itemName: 'Keyboard - Mechanical', quantity: 3 },
  ];

  const handleViewDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue(delivery);
  };

  const handleStartDelivery = (deliveryId: string) => {
    // Mock API call to start delivery
    console.log('Starting delivery:', deliveryId);
    message.success('Delivery started successfully');
  };

  const handleCompleteDelivery = async (values: any) => {
    try {
      // Mock API call to complete delivery
      console.log('Completing delivery:', selectedDelivery?.deliveryId, values);
      message.success('Delivery completed successfully');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to complete delivery');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'warning';
      case 'Picked Up':
        return 'processing';
      case 'In Progress':
        return 'processing';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getItemName = (transactionId: string) => {
    const item = items.find(i => i.transactionId === transactionId);
    return item?.itemName || 'Unknown Item';
  };

  const getItemQuantity = (transactionId: string) => {
    const item = items.find(i => i.transactionId === transactionId);
    return item?.quantity || 0;
  };

  const columns: ColumnsType<Delivery> = [
    {
      title: 'Delivery ID',
      dataIndex: 'deliveryId',
      key: 'deliveryId',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Item',
      dataIndex: 'transactionId',
      key: 'itemName',
      render: (transactionId) => {
        const itemName = getItemName(transactionId);
        const quantity = getItemQuantity(transactionId);
        return (
          <div>
            <Text strong>{itemName}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Quantity: {quantity}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'From Store',
      dataIndex: 'pickupAddress',
      key: 'pickupAddress',
      render: (address) => (
        <div>
          <EnvironmentOutlined style={{ marginRight: 4, color: brandColors.primary }} />
          <Text>{address.split(',')[0]}</Text>
        </div>
      ),
    },
    {
      title: 'To Store',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      render: (address) => (
        <div>
          <EnvironmentOutlined style={{ marginRight: 4, color: brandColors.success }} />
          <Text>{address.split(',')[0]}</Text>
        </div>
      ),
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
      title: 'Scheduled Date',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4, color: brandColors.warning }} />
          <Text>{new Date(date).toLocaleDateString()}</Text>
        </div>
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
          >
            Details
          </Button>
          {record.status === 'Assigned' && (
            <Button
              type="primary"
              icon={<TruckOutlined />}
              onClick={() => handleStartDelivery(record.deliveryId)}
            >
              Start
            </Button>
          )}
          {record.status === 'In Progress' && (
            <Button
              type="primary"
              icon={<TruckOutlined />}
              onClick={() => handleViewDetails(record)}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredDeliveries = deliveries.filter(delivery => {
    const itemName = getItemName(delivery.transactionId);
    const matchesSearch = itemName.toLowerCase().includes(searchText.toLowerCase()) ||
                         delivery.pickupAddress.toLowerCase().includes(searchText.toLowerCase()) ||
                         delivery.deliveryAddress.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || delivery.status === statusFilter;
    const matchesPriority = !priorityFilter; // Add priority logic if needed
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Assigned Deliveries
        </Title>
        <Text type="secondary">
          View and manage your assigned deliveries between stores
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Search deliveries..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="Assigned">Assigned</Option>
            <Option value="Picked Up">Picked Up</Option>
            <Option value="In Progress">In Progress</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
          <Select
            placeholder="Filter by priority"
            allowClear
            style={{ width: 150 }}
            value={priorityFilter}
            onChange={setPriorityFilter}
          >
            <Option value="High">High</Option>
            <Option value="Medium">Medium</Option>
            <Option value="Low">Low</Option>
          </Select>
        </Space>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredDeliveries}
          rowKey="deliveryId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} deliveries`,
          }}
        />
      </Card>

      {/* Delivery Details Modal */}
      <Modal
        title={`Delivery Details - ${selectedDelivery?.deliveryId}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCompleteDelivery}
        >
          {selectedDelivery && (
            <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
              <Space direction="vertical" size="small">
                <Text strong>Delivery Information:</Text>
                <Text>Item: {getItemName(selectedDelivery.transactionId)}</Text>
                <Text>Quantity: {getItemQuantity(selectedDelivery.transactionId)}</Text>
                <Text>From: {selectedDelivery.pickupAddress}</Text>
                <Text>To: {selectedDelivery.deliveryAddress}</Text>
                <Text>Scheduled: {new Date(selectedDelivery.scheduledDate).toLocaleDateString()}</Text>
                <Text>Status: <Tag color={getStatusColor(selectedDelivery.status)}>{selectedDelivery.status}</Tag></Text>
                {selectedDelivery.notes && <Text>Notes: {selectedDelivery.notes}</Text>}
              </Space>
            </div>
          )}

          {selectedDelivery?.status === 'In Progress' && (
            <>
              <Form.Item
                name="deliveryNotes"
                label="Delivery Notes"
                rules={[{ required: true, message: 'Please enter delivery notes' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Enter any notes about the delivery completion..."
                />
              </Form.Item>

              <Form.Item
                name="recipientName"
                label="Recipient Name"
                rules={[{ required: true, message: 'Please enter recipient name' }]}
              >
                <AntInput placeholder="Enter recipient name" />
              </Form.Item>

              <Form.Item
                name="deliveryTime"
                label="Actual Delivery Time"
                rules={[{ required: true, message: 'Please enter delivery time' }]}
              >
                <AntInput placeholder="e.g., 2:30 PM" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setModalVisible(false)}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" icon={<TruckOutlined />}>
                    Complete Delivery
                  </Button>
                </Space>
              </Form.Item>
            </>
          )}

          {selectedDelivery?.status !== 'In Progress' && (
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setModalVisible(false)}>
                Close
              </Button>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AssignedDeliveries;
