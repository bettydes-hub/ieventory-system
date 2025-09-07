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
  DatePicker,
  Row,
  Col,
  message,
  Modal,
  Descriptions,
} from 'antd';
import {
  AuditOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { AuditLog } from '@/types';
import { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Audit: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Mock data - replace with actual API calls
  const auditLogs: AuditLog[] = [
    {
      auditId: '1',
      userId: '1',
      action: 'CREATE',
      entityType: 'Item',
      entityId: '1',
      oldValues: null,
      newValues: { name: 'Laptop Dell XPS 13', quantity: 5 },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      createdAt: '2024-01-01T10:00:00Z',
    },
    {
      auditId: '2',
      userId: '1',
      action: 'UPDATE',
      entityType: 'Item',
      entityId: '1',
      oldValues: { quantity: 5 },
      newValues: { quantity: 4 },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      createdAt: '2024-01-01T11:00:00Z',
    },
    {
      auditId: '3',
      userId: '2',
      action: 'BORROW',
      entityType: 'Transaction',
      entityId: '1',
      oldValues: null,
      newValues: { itemId: '1', quantity: 1, dueDate: '2024-01-15' },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      createdAt: '2024-01-01T12:00:00Z',
    },
  ];

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalVisible(true);
  };

  const handleExportLogs = () => {
    message.success('Audit logs exported successfully');
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'green';
      case 'UPDATE':
        return 'blue';
      case 'DELETE':
        return 'red';
      case 'BORROW':
        return 'orange';
      case 'RETURN':
        return 'cyan';
      case 'TRANSFER':
        return 'purple';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action}
        </Tag>
      ),
    },
    {
      title: 'Entity',
      key: 'entity',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.entityType}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ID: {record.entityId}
          </div>
        </div>
      ),
    },
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId) => `User ${userId}`,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewLog(record)}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchText.toLowerCase()) ||
                         log.entityType.toLowerCase().includes(searchText.toLowerCase()) ||
                         log.entityId.toLowerCase().includes(searchText.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesEntity = !entityFilter || log.entityType === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Audit Logs
        </Title>
        <Button 
          icon={<DownloadOutlined />}
          onClick={handleExportLogs}
        >
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search audit logs..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by action"
              value={actionFilter}
              onChange={setActionFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="CREATE">Create</Option>
              <Option value="UPDATE">Update</Option>
              <Option value="DELETE">Delete</Option>
              <Option value="BORROW">Borrow</Option>
              <Option value="RETURN">Return</Option>
              <Option value="TRANSFER">Transfer</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by entity"
              value={entityFilter}
              onChange={setEntityFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="Item">Item</Option>
              <Option value="Transaction">Transaction</Option>
              <Option value="Delivery">Delivery</Option>
              <Option value="Category">Category</Option>
              <Option value="Store">Store</Option>
              <Option value="Supplier">Supplier</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="auditId"
          pagination={{
            total: filteredLogs.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} logs`,
          }}
        />
      </Card>

      {/* Audit Log Details Modal */}
      <Modal
        title="Audit Log Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Action">
              <Tag color={getActionColor(selectedLog.action)}>
                {selectedLog.action}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Entity Type">
              {selectedLog.entityType}
            </Descriptions.Item>
            <Descriptions.Item label="Entity ID">
              {selectedLog.entityId}
            </Descriptions.Item>
            <Descriptions.Item label="User ID">
              {selectedLog.userId}
            </Descriptions.Item>
            <Descriptions.Item label="IP Address">
              {selectedLog.ipAddress}
            </Descriptions.Item>
            <Descriptions.Item label="User Agent">
              <div style={{ wordBreak: 'break-all' }}>
                {selectedLog.userAgent}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Timestamp">
              {new Date(selectedLog.createdAt).toLocaleString()}
            </Descriptions.Item>
            {selectedLog.oldValues && (
              <Descriptions.Item label="Old Values">
                <pre style={{ margin: 0, fontSize: '12px' }}>
                  {JSON.stringify(selectedLog.oldValues, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
            {selectedLog.newValues && (
              <Descriptions.Item label="New Values">
                <pre style={{ margin: 0, fontSize: '12px' }}>
                  {JSON.stringify(selectedLog.newValues, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Audit;