import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Select, DatePicker, Table, Tag, Statistic, Tabs, message } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined, FilterOutlined, BarChartOutlined, LineChartOutlined, FileTextOutlined } from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { ColumnsType } from 'antd/es/table';
import LoadingSpinner from '@/components/LoadingSpinner';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>('inventory');

  // Mock data for demonstration
  const mockInventoryData = [
    { key: '1', item: 'Laptop Dell XPS 13', category: 'Electronics', quantity: 5, status: 'Available' },
    { key: '2', item: 'Monitor Samsung 24"', category: 'Electronics', quantity: 8, status: 'Available' },
    { key: '3', item: 'Mouse Logitech MX', category: 'Accessories', quantity: 12, status: 'Available' },
  ];

  const mockTransactionData = [
    { key: '1', type: 'Borrow', item: 'Laptop Dell XPS 13', user: 'John Doe', date: '2024-01-20', status: 'Completed' },
    { key: '2', type: 'Return', item: 'Monitor Samsung 24"', user: 'Jane Smith', date: '2024-01-19', status: 'Completed' },
    { key: '3', type: 'Borrow', item: 'Mouse Logitech MX', user: 'Mike Johnson', date: '2024-01-18', status: 'Pending' },
  ];

  const mockDamageData = [
    { key: '1', item: 'Keyboard Mechanical', user: 'Alice Brown', date: '2024-01-17', severity: 'High', status: 'Pending' },
    { key: '2', item: 'Monitor Stand', user: 'Bob Wilson', date: '2024-01-16', severity: 'Medium', status: 'In Progress' },
  ];

  const inventoryColumns: ColumnsType<any> = [
    { title: 'Item', dataIndex: 'item', key: 'item' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Available' ? 'green' : 'orange'}>
          {status}
        </Tag>
      )
    },
  ];

  const transactionColumns: ColumnsType<any> = [
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Item', dataIndex: 'item', key: 'item' },
    { title: 'User', dataIndex: 'user', key: 'user' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Completed' ? 'green' : status === 'Pending' ? 'orange' : 'blue'}>
          {status}
        </Tag>
      )
    },
  ];

  const damageColumns: ColumnsType<any> = [
    { title: 'Item', dataIndex: 'item', key: 'item' },
    { title: 'Reported By', dataIndex: 'user', key: 'user' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={severity === 'High' ? 'red' : severity === 'Medium' ? 'orange' : 'green'}>
          {severity}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Pending' ? 'orange' : status === 'In Progress' ? 'blue' : 'green'}>
          {status}
        </Tag>
      )
    },
  ];

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    setLoading(true);
    // Simulate export process
    setTimeout(() => {
      setLoading(false);
      message.success(`Report exported as ${format.toUpperCase()}`);
    }, 2000);
  };

  const handleFilter = () => {
    setLoading(true);
    // Simulate filter process
    setTimeout(() => {
      setLoading(false);
      message.success('Report filtered successfully');
    }, 1000);
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Generating report..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Reports & Analytics
        </Title>
        <Space>
          <Button 
            icon={<FilePdfOutlined />} 
            onClick={() => handleExport('pdf')}
            loading={loading}
          >
            Export PDF
          </Button>
          <Button 
            icon={<FileExcelOutlined />} 
            onClick={() => handleExport('excel')}
            loading={loading}
          >
            Export Excel
          </Button>
          <Button 
            icon={<FileTextOutlined />} 
            onClick={() => handleExport('csv')}
            loading={loading}
          >
            Export CSV
          </Button>
        </Space>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Items"
              value={112}
              prefix={<BarChartOutlined style={{ color: brandColors.primary }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Transactions"
              value={23}
              prefix={<LineChartOutlined style={{ color: brandColors.success }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Damage Reports"
              value={5}
              prefix={<FileTextOutlined style={{ color: brandColors.warning }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Text strong>Report Type:</Text>
            <Select
              value={selectedReportType}
              onChange={setSelectedReportType}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value="inventory">Inventory Report</Option>
              <Option value="transactions">Transaction Report</Option>
              <Option value="damage">Damage Report</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Text strong>Date Range:</Text>
            <RangePicker
              style={{ width: '100%', marginTop: 8 }}
              value={selectedDateRange}
              onChange={setSelectedDateRange}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Button
              type="primary" 
              icon={<FilterOutlined />}
              onClick={handleFilter}
              loading={loading}
              style={{ marginTop: 24 }}
            >
              Apply Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Report Tabs */}
      <Card>
        <Tabs defaultActiveKey="inventory">
          <TabPane tab="Inventory Report" key="inventory">
            <Table
              columns={inventoryColumns}
              dataSource={mockInventoryData}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Transaction Report" key="transactions">
            <Table
              columns={transactionColumns}
              dataSource={mockTransactionData}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Damage Report" key="damage">
            <Table
              columns={damageColumns}
              dataSource={mockDamageData}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Reports;
