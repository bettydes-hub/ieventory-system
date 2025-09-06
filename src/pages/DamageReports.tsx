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
  InputNumber,
  message,
  Row,
  Col,
} from 'antd';
import {
  ExclamationCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useInventory } from '@/hooks/useInventory';
import { DamageReport } from '@/types';
import { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const DamageReports: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [form] = Form.useForm();

  const { items } = useInventory();

  // Mock data - replace with actual API calls
  const damageReports: DamageReport[] = [
    {
      damageId: '1',
      itemId: '1',
      reportedBy: 'John Doe',
      description: 'Screen cracked due to accidental drop',
      severity: 'High',
      status: 'Pending',
      estimatedCost: 200,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
    {
      damageId: '2',
      itemId: '2',
      reportedBy: 'Jane Smith',
      description: 'Minor scratches on surface',
      severity: 'Low',
      status: 'Fixed',
      estimatedCost: 50,
      actualCost: 45,
      resolvedBy: 'Admin',
      resolutionNotes: 'Replaced scratched panel',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z',
    },
  ];

  const handleViewReport = (report: DamageReport) => {
    setSelectedReport(report);
    form.setFieldsValue(report);
    setIsModalVisible(true);
  };

  const handleUpdateStatus = async (values: any) => {
    try {
      // API call to update damage report status
      message.success('Damage report updated successfully');
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to update damage report');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low':
        return 'green';
      case 'Medium':
        return 'orange';
      case 'High':
        return 'red';
      case 'Critical':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'In Progress':
        return 'blue';
      case 'Fixed':
        return 'green';
      case 'Discarded':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<DamageReport> = [
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity}
        </Tag>
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
      title: 'Cost',
      key: 'cost',
      render: (_, record) => (
        <div>
          {record.estimatedCost && (
            <div>Est: ${record.estimatedCost}</div>
          )}
          {record.actualCost && (
            <div>Actual: ${record.actualCost}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Reported By',
      dataIndex: 'reportedBy',
      key: 'reportedBy',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewReport(record)}
          >
            View
          </Button>
          {record.status === 'Pending' && (
            <Button 
              icon={<EditOutlined />} 
              size="small"
              type="primary"
              onClick={() => handleViewReport(record)}
            >
              Update
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredReports = damageReports.filter(report => {
    const matchesSearch = report.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         report.reportedBy.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || report.status === statusFilter;
    const matchesSeverity = !severityFilter || report.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Damage Reports
        </Title>
        <Button 
          type="primary" 
          icon={<ExclamationCircleOutlined />}
        >
          Report Damage
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search damage reports..."
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
              <Option value="In Progress">In Progress</Option>
              <Option value="Fixed">Fixed</Option>
              <Option value="Discarded">Discarded</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by severity"
              value={severityFilter}
              onChange={setSeverityFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
              <Option value="Critical">Critical</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Damage Reports Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredReports}
          rowKey="damageId"
          pagination={{
            total: filteredReports.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} reports`,
          }}
        />
      </Card>

      {/* Damage Report Details Modal */}
      <Modal
        title="Damage Report Details"
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
                  <Option value="Pending">Pending</Option>
                  <Option value="In Progress">In Progress</Option>
                  <Option value="Fixed">Fixed</Option>
                  <Option value="Discarded">Discarded</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Severity" name="severity">
                <Select>
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} readOnly />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Estimated Cost" name="estimatedCost">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Actual Cost" name="actualCost">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Resolution Notes" name="resolutionNotes">
            <TextArea rows={3} placeholder="Enter resolution notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DamageReports;
