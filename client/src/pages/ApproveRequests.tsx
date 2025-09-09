import React, { useState } from 'react';
import { Table, Button, Card, Typography, Space, Tag, Modal, Form, Input, message, Tabs, Badge } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { ColumnsType } from 'antd/es/table';
import type { BorrowRequest } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ApproveRequests: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const [requests, setRequests] = useState<BorrowRequest[]>([
    {
      requestId: '1',
      itemId: '1',
      userId: 'user1',
      quantity: 1,
      reason: 'Need laptop for remote work project',
      dueDate: '2024-02-15',
      status: 'Pending',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
    },
    {
      requestId: '2',
      itemId: '2',
      userId: 'user2',
      quantity: 2,
      reason: 'Setting up new workstation for team member',
      dueDate: '2024-02-20',
      status: 'Pending',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18',
    },
    {
      requestId: '3',
      itemId: '3',
      userId: 'user3',
      quantity: 1,
      reason: 'Replacement for broken mouse',
      dueDate: '2024-02-10',
      status: 'Approved',
      approvedBy: 'storekeeper1',
      approvedAt: '2024-01-17',
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17',
    },
    {
      requestId: '4',
      itemId: '4',
      userId: 'user4',
      quantity: 1,
      reason: 'Need mechanical keyboard for programming',
      dueDate: '2024-02-25',
      status: 'Rejected',
      approvedBy: 'storekeeper1',
      approvedAt: '2024-01-16',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16',
    },
  ]);

  const items = [
    { itemId: '1', name: 'Laptop - Dell XPS 13', available: 5 },
    { itemId: '2', name: 'Monitor - Samsung 24"', available: 8 },
    { itemId: '3', name: 'Mouse - Logitech MX Master', available: 12 },
    { itemId: '4', name: 'Keyboard - Mechanical', available: 0 },
  ];

  const users = [
    { userId: 'user1', name: 'John Doe', email: 'john@company.com' },
    { userId: 'user2', name: 'Jane Smith', email: 'jane@company.com' },
    { userId: 'user3', name: 'Bob Johnson', email: 'bob@company.com' },
    { userId: 'user4', name: 'Alice Brown', email: 'alice@company.com' },
  ];

  const handleApprove = (request: BorrowRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ action: 'approve' });
  };

  const handleReject = (request: BorrowRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ action: 'reject' });
  };

  const handleView = (request: BorrowRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ action: 'view', ...request });
  };

  const handleSubmit = async (values: any) => {
    try {
      const updatedRequests = requests.map(request =>
        request.requestId === selectedRequest?.requestId
          ? {
              ...request,
              status: values.action === 'approve' ? 'Approved' : 'Rejected',
              approvedBy: 'current-user-id', // Replace with actual user ID
              approvedAt: new Date().toISOString(),
              notes: values.notes,
            }
          : request
      );
      setRequests(updatedRequests);
      
      message.success(`Request ${values.action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getItemName = (itemId: string) => {
    const item = items.find(i => i.itemId === itemId);
    return item?.name || 'Unknown Item';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.userId === userId);
    return user?.name || 'Unknown User';
  };

  const columns: ColumnsType<BorrowRequest> = [
    {
      title: 'Request ID',
      dataIndex: 'requestId',
      key: 'requestId',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Item',
      dataIndex: 'itemId',
      key: 'itemName',
      render: (itemId) => {
        const item = items.find(i => i.itemId === itemId);
        return (
          <div>
            <Text strong>{item?.name}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Available: {item?.available}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Requested By',
      dataIndex: 'userId',
      key: 'userName',
      render: (userId) => {
        const user = users.find(u => u.userId === userId);
        return (
          <div>
            <Text strong>{user?.name}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {user?.email}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => <Text strong>{quantity}</Text>,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => new Date(date).toLocaleDateString(),
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
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          {record.status === 'Pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const approvedRequests = requests.filter(r => r.status === 'Approved');
  const rejectedRequests = requests.filter(r => r.status === 'Rejected');

  const tabItems = [
    {
      key: 'pending',
      label: (
        <Badge count={pendingRequests.length} size="small">
          <span>Pending</span>
        </Badge>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={pendingRequests}
          rowKey="requestId"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'approved',
      label: `Approved (${approvedRequests.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={approvedRequests}
          rowKey="requestId"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'rejected',
      label: `Rejected (${rejectedRequests.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={rejectedRequests}
          rowKey="requestId"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Approve Requests
        </Title>
        <Text type="secondary">
          Review and approve/reject borrow requests from employees
        </Text>
      </div>

      {/* Summary Cards */}
      <div style={{ marginBottom: 24 }}>
        <Space size="large">
          <Card size="small">
            <Text strong>Pending Requests: </Text>
            <Text style={{ color: brandColors.warning, fontWeight: 'bold' }}>
              {pendingRequests.length}
            </Text>
          </Card>
          <Card size="small">
            <Text strong>Approved Today: </Text>
            <Text style={{ color: brandColors.success, fontWeight: 'bold' }}>
              {approvedRequests.length}
            </Text>
          </Card>
          <Card size="small">
            <Text strong>Rejected Today: </Text>
            <Text style={{ color: brandColors.error, fontWeight: 'bold' }}>
              {rejectedRequests.length}
            </Text>
          </Card>
        </Space>
      </div>

      {/* Requests Table */}
      <Card>
        <Tabs defaultActiveKey="pending" items={tabItems} />
      </Card>

      {/* Approval Modal */}
      <Modal
        title={`${form.getFieldValue('action') === 'approve' ? 'Approve' : form.getFieldValue('action') === 'reject' ? 'Reject' : 'View'} Request`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={form.getFieldValue('action') === 'view' ? [
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ] : null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {selectedRequest && (
            <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
              <Space direction="vertical" size="small">
                <Text strong>Request Details:</Text>
                <Text>Item: {getItemName(selectedRequest.itemId)}</Text>
                <Text>Requested by: {getUserName(selectedRequest.userId)}</Text>
                <Text>Quantity: {selectedRequest.quantity}</Text>
                <Text>Due Date: {new Date(selectedRequest.dueDate).toLocaleDateString()}</Text>
                <Text>Reason: {selectedRequest.reason}</Text>
              </Space>
            </div>
          )}

          {form.getFieldValue('action') !== 'view' && (
            <Form.Item
              name="notes"
              label="Notes"
              rules={[{ required: true, message: 'Please enter notes' }]}
            >
              <TextArea
                rows={3}
                placeholder={`Enter notes for ${form.getFieldValue('action') === 'approve' ? 'approval' : 'rejection'}...`}
              />
            </Form.Item>
          )}

          {form.getFieldValue('action') !== 'view' && (
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={form.getFieldValue('action') === 'approve' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  danger={form.getFieldValue('action') === 'reject'}
                >
                  {form.getFieldValue('action') === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ApproveRequests;
