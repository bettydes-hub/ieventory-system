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
  SwapOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useInventory } from '@/hooks/useInventory';
import { Transaction } from '@/types';
import { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const Transactions: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [form] = Form.useForm();

  const { items, stores } = useInventory();

  // Mock data - replace with actual API calls
  const transactions: Transaction[] = [
    {
      transactionId: '1',
      type: 'Borrow',
      itemId: '1',
      userId: '1',
      quantity: 1,
      dueDate: '2024-01-15',
      status: 'Pending',
      notes: 'Need for project',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
    {
      transactionId: '2',
      type: 'Return',
      itemId: '1',
      userId: '1',
      quantity: 1,
      status: 'Completed',
      notes: 'Returned on time',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z',
    },
  ];

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      // API call to approve transaction
      message.success('Transaction approved successfully');
    } catch (error) {
      message.error('Failed to approve transaction');
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    try {
      // API call to cancel transaction
      message.success('Transaction cancelled successfully');
    } catch (error) {
      message.error('Failed to cancel transaction');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Approved':
        return 'blue';
      case 'Completed':
        return 'green';
      case 'Overdue':
        return 'red';
      case 'Cancelled':
        return 'gray';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Borrow':
        return 'blue';
      case 'Return':
        return 'green';
      case 'Transfer':
        return 'orange';
      case 'Purchase':
        return 'purple';
      case 'Sale':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Item',
      dataIndex: 'itemId',
      key: 'itemId',
      render: (itemId) => {
        const item = items.find(i => i.itemId === itemId);
        return item ? item.name : 'Unknown Item';
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
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
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Created',
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
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewTransaction(record)}
          >
            View
          </Button>
          {record.status === 'Pending' && (
            <>
              <Button 
                icon={<CheckOutlined />} 
                size="small"
                type="primary"
                onClick={() => handleApproveTransaction(record.transactionId)}
              >
                Approve
              </Button>
              <Button 
                icon={<CloseOutlined />} 
                size="small"
                danger
                onClick={() => handleCancelTransaction(record.transactionId)}
              >
                Cancel
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.notes?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || transaction.status === statusFilter;
    const matchesType = !typeFilter || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Transaction Management
        </Title>
        <Button 
          type="primary" 
          icon={<SwapOutlined />}
        >
          New Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search transactions..."
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
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Overdue">Overdue</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by type"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="Borrow">Borrow</Option>
              <Option value="Return">Return</Option>
              <Option value="Transfer">Transfer</Option>
              <Option value="Purchase">Purchase</Option>
              <Option value="Sale">Sale</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="transactionId"
          pagination={{
            total: filteredTransactions.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
        />
      </Card>

      {/* Transaction Details Modal */}
      <Modal
        title="Transaction Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTransaction && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Type:</strong> {selectedTransaction.type}
              </Col>
              <Col span={12}>
                <strong>Status:</strong> 
                <Tag color={getStatusColor(selectedTransaction.status)} style={{ marginLeft: 8 }}>
                  {selectedTransaction.status}
                </Tag>
              </Col>
              <Col span={12}>
                <strong>Quantity:</strong> {selectedTransaction.quantity}
              </Col>
              <Col span={12}>
                <strong>Due Date:</strong> {selectedTransaction.dueDate ? new Date(selectedTransaction.dueDate).toLocaleDateString() : 'N/A'}
              </Col>
              <Col span={24}>
                <strong>Notes:</strong> {selectedTransaction.notes || 'No notes'}
              </Col>
              <Col span={12}>
                <strong>Created:</strong> {new Date(selectedTransaction.createdAt).toLocaleString()}
              </Col>
              <Col span={12}>
                <strong>Updated:</strong> {new Date(selectedTransaction.updatedAt).toLocaleString()}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Transactions;
