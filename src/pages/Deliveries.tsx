import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Typography,
  Tag,
  Modal,
  Form,
  DatePicker,
  message,
  Row,
  Col,
} from 'antd';
import {
  TruckOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useInventory } from '@/hooks/useInventory';
import { Delivery } from '@/types';
import { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const Deliveries: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [form] = Form.useForm();

  const { stores } = useInventory();

  // Mock data - replace with actual API calls
  const deliveries: Delivery[] = [
    {
      deliveryId: '1',
      transactionId: '1',
      assignedTo: 'John Doe',
      status: 'Assigned',
      pickupAddress: 'Store A, 123 Main St',
      deliveryAddress: 'Store B, 456 Oak Ave',
      scheduledDate: '2024-01-15',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
    {
      deliveryId: '2',
      transactionId: '2',
      assignedTo: 'Jane Smith',
      status: 'Completed',
      pickupAddress: 'Store B, 456 Oak Ave',
      deliveryAddress: 'Store C, 789 Pine St',
      scheduledDate: '2024-01-10',
      completedDate: '2024-01-10T15:30:00Z',
      createdAt: '2024-01-05T10:00:00Z',
      updatedAt: '2024-01-10T15:30:00Z',
    },
  ];

  const handleViewDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    form.setFieldsValue({
      ...delivery,
      scheduledDate: delivery.scheduledDate ? new Date(delivery.scheduledDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleUpdateStatus = async (values: any) => {
    try {
      // API call to update delivery status
      message.success('Delivery status updated successfully');
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to update delivery status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'blue';
      case 'Picked Up':
        return 'orange';
      case 'In Progress':
        return 'purple';
      case 'Completed':
        return 'green';
      case 'Cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Delivery> = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
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
      title: 'Pickup Address',
      dataIndex: 'pickupAddress',
      key: 'pickupAddress',
      ellipsis: true,
    },
    {
      title: 'Delivery Address',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      ellipsis: true,
    },
    {
      title: 'Scheduled Date',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDelivery(record)}
          >
            View
          </Button>
          {record.status !== 'Completed' && record.status !== 'Cancelled' && (
            <Button 
              icon={<EditOutlined />} 
              size="small"
              type="primary"
              onClick={() => handleViewDelivery(record)}
            >
              Update
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.pickupAddress.toLowerCase().includes(searchText.toLowerCase()) ||
                         delivery.deliveryAddress.toLowerCase().includes(searchText.toLowerCase()) ||
                         delivery.assignedTo.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Delivery Management
        </Title>
        <Button 
          type="primary" 
          icon={<TruckOutlined />}
        >
          Assign Delivery
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search deliveries..."
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
              <Option value="Assigned">Assigned</Option>
              <Option value="Picked Up">Picked Up</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredDeliveries}
          rowKey="deliveryId"
          pagination={{
            total: filteredDeliveries.length,
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
        title="Delivery Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateStatus}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Status" name="status">
                <Select>
                  <Option value="Assigned">Assigned</Option>
                  <Option value="Picked Up">Picked Up</Option>
                  <Option value="In Progress">In Progress</Option>
                  <Option value="Completed">Completed</Option>
                  <Option value="Cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Scheduled Date" name="scheduledDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Pickup Address" name="pickupAddress">
            <Input readOnly />
          </Form.Item>

          <Form.Item label="Delivery Address" name="deliveryAddress">
            <Input readOnly />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} placeholder="Enter delivery notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Deliveries;
