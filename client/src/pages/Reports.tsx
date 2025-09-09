import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Select, DatePicker, Table, Tag, Statistic, Tabs, message } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined, FilterOutlined, BarChartOutlined, LineChartOutlined, FileTextOutlined } from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { ColumnsType } from 'antd/es/table';
import type { AuditLog, Transaction, DamageReport } from '@/types';
import { exportToPDF, exportToExcel, exportToCSV, formatAuditLogData, formatInventoryReportData, formatUserReportData } from '@/utils/exportUtils';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<string>('audit');
  const [dateRange, setDateRange] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Export handlers
  const handleExportPDF = () => {
    try {
      let data;
      let filename;
      
      switch (reportType) {
        case 'audit':
          data = formatAuditLogData(auditLogs);
          filename = `audit-logs-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'inventory':
          data = formatInventoryReportData(mockItems);
          filename = `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'users':
          data = formatUserReportData(mockUsers);
          filename = `users-report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        default:
          data = formatAuditLogData(auditLogs);
          filename = `report-${new Date().toISOString().split('T')[0]}.pdf`;
      }
      
      exportToPDF(data, filename);
      message.success('PDF exported successfully!');
    } catch (error) {
      message.error('Failed to export PDF');
      console.error('PDF export error:', error);
    }
  };

  const handleExportExcel = () => {
    try {
      let data;
      let filename;
      
      switch (reportType) {
        case 'audit':
          data = formatAuditLogData(auditLogs);
          filename = `audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'inventory':
          data = formatInventoryReportData(mockItems);
          filename = `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'users':
          data = formatUserReportData(mockUsers);
          filename = `users-report-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        default:
          data = formatAuditLogData(auditLogs);
          filename = `report-${new Date().toISOString().split('T')[0]}.xlsx`;
      }
      
      exportToExcel(data, filename);
      message.success('Excel file exported successfully!');
    } catch (error) {
      message.error('Failed to export Excel file');
      console.error('Excel export error:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      let data;
      let filename;
      
      switch (reportType) {
        case 'audit':
          data = formatAuditLogData(auditLogs);
          filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'inventory':
          data = formatInventoryReportData(mockItems);
          filename = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'users':
          data = formatUserReportData(mockUsers);
          filename = `users-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          data = formatAuditLogData(auditLogs);
          filename = `report-${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      exportToCSV(data, filename);
      message.success('CSV file exported successfully!');
    } catch (error) {
      message.error('Failed to export CSV file');
      console.error('CSV export error:', error);
    }
  };

  // Mock data - replace with actual API calls
  const auditLogs: AuditLog[] = [
    {
      auditId: '1',
      userId: 'user1',
      action: 'CREATE_ITEM',
      entityType: 'Item',
      entityId: 'item1',
      oldValues: null,
      newValues: { name: 'Laptop - Dell XPS 13', quantity: 5 },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      createdAt: '2024-01-19 10:30:00',
    },
    {
      auditId: '2',
      userId: 'user2',
      action: 'UPDATE_ITEM',
      entityType: 'Item',
      entityId: 'item2',
      oldValues: { quantity: 8 },
      newValues: { quantity: 6 },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      createdAt: '2024-01-19 09:15:00',
    },
    {
      auditId: '3',
      userId: 'user3',
      action: 'BORROW_ITEM',
      entityType: 'Transaction',
      entityId: 'trans1',
      oldValues: null,
      newValues: { itemId: 'item1', userId: 'user3', quantity: 1 },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0...',
      createdAt: '2024-01-18 16:45:00',
    },
  ];

  const transactions: Transaction[] = [
    {
      transactionId: '1',
      type: 'Borrow',
      itemId: 'item1',
      userId: 'user1',
      quantity: 1,
      dueDate: '2024-02-15',
      status: 'Completed',
      notes: 'Laptop for remote work',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
    },
    {
      transactionId: '2',
      type: 'Return',
      itemId: 'item2',
      userId: 'user2',
      quantity: 1,
      status: 'Completed',
      notes: 'Monitor returned in good condition',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18',
    },
    {
      transactionId: '3',
      type: 'Borrow',
      itemId: 'item3',
      userId: 'user3',
      quantity: 1,
      dueDate: '2024-02-20',
      status: 'Pending',
      notes: 'Mouse for new workstation',
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17',
    },
  ];

  const damageReports: DamageReport[] = [
    {
      damageId: '1',
      itemId: 'item1',
      reportedBy: 'user1',
      description: 'Screen has a crack in the corner',
      severity: 'High',
      status: 'Pending',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      damageId: '2',
      itemId: 'item3',
      reportedBy: 'user2',
      description: 'Left click button not working properly',
      severity: 'Medium',
      status: 'In Progress',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12',
    },
  ];

  // Mock data for inventory and users reports
  const mockItems = [
    {
      name: 'Laptop - Dell XPS 13',
      category: 'Laptops',
      manufacturer: 'Dell',
      model: 'XPS 13 9320',
      serialNumber: 'DLX001',
      quantity: 5,
      status: 'Available',
      location: 'Main Office',
      purchaseDate: '2024-01-15',
    },
    {
      name: 'Monitor - Samsung 24"',
      category: 'Monitors',
      manufacturer: 'Samsung',
      model: 'S24F350',
      serialNumber: 'SAM001',
      quantity: 8,
      status: 'Available',
      location: 'Main Office',
      purchaseDate: '2024-01-10',
    },
    {
      name: 'Mouse - Logitech MX Master',
      category: 'Accessories',
      manufacturer: 'Logitech',
      model: 'MX Master 3',
      serialNumber: 'LOG001',
      quantity: 12,
      status: 'Available',
      location: 'Main Office',
      purchaseDate: '2024-01-05',
    },
  ];

  const mockUsers = [
    {
      name: 'John Employee',
      email: 'employee@inventory.com',
      role: 'Employee',
      department: 'IT',
      status: 'Active',
      lastLogin: '2024-01-19',
      createdAt: '2024-01-01',
    },
    {
      name: 'Jane StoreKeeper',
      email: 'storekeeper@inventory.com',
      role: 'Store Keeper',
      department: 'Operations',
      status: 'Active',
      lastLogin: '2024-01-18',
      createdAt: '2024-01-01',
    },
    {
      name: 'Bob Manager',
      email: 'admin@inventory.com',
      role: 'Admin',
      department: 'Management',
      status: 'Active',
      lastLogin: '2024-01-19',
      createdAt: '2024-01-01',
    },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE_ITEM':
        return 'success';
      case 'UPDATE_ITEM':
        return 'warning';
      case 'DELETE_ITEM':
        return 'error';
      case 'BORROW_ITEM':
        return 'blue';
      case 'RETURN_ITEM':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'High':
        return 'error';
      case 'Critical':
        return 'red';
      default:
        return 'default';
    }
  };

  const auditColumns: ColumnsType<AuditLog> = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Entity',
      dataIndex: 'entityType',
      key: 'entityType',
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
  ];

  const transactionColumns: ColumnsType<Transaction> = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Borrow' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Item ID',
      dataIndex: 'itemId',
      key: 'itemId',
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (id) => <Text code>{id}</Text>,
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
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const damageColumns: ColumnsType<DamageReport> = [
    {
      title: 'Report ID',
      dataIndex: 'damageId',
      key: 'damageId',
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'Item ID',
      dataIndex: 'itemId',
      key: 'itemId',
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'Reported By',
      dataIndex: 'reportedBy',
      key: 'reportedBy',
      render: (id) => <Text code>{id}</Text>,
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
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const tabItems = [
    {
      key: 'audit',
      label: 'Audit Logs',
      children: (
        <Table
          columns={auditColumns}
          dataSource={auditLogs}
          rowKey="auditId"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'transactions',
      label: 'Transactions',
      children: (
        <Table
          columns={transactionColumns}
          dataSource={transactions}
          rowKey="transactionId"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'damage',
      label: 'Damage Reports',
      children: (
        <Table
          columns={damageColumns}
          dataSource={damageReports}
          rowKey="damageId"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Reports & Audit Logs
        </Title>
        <Text type="secondary">
          Generate and export system reports and audit logs
        </Text>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Audit Logs"
              value={auditLogs.length}
              prefix={<BarChartOutlined style={{ color: brandColors.primary }} />}
              valueStyle={{ color: brandColors.primary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={transactions.length}
              prefix={<LineChartOutlined style={{ color: brandColors.success }} />}
              valueStyle={{ color: brandColors.success }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Damage Reports"
              value={damageReports.length}
              prefix={<FilePdfOutlined style={{ color: brandColors.error }} />}
              valueStyle={{ color: brandColors.error }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Items"
              value={transactions.filter(t => t.status === 'Pending').length}
              prefix={<FilterOutlined style={{ color: brandColors.warning }} />}
              valueStyle={{ color: brandColors.warning }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Export Options */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space wrap>
            <Select
              placeholder="Report Type"
              style={{ width: 150 }}
              value={reportType}
              onChange={setReportType}
            >
              <Option value="audit">Audit Logs</Option>
              <Option value="transactions">Transactions</Option>
              <Option value="damage">Damage Reports</Option>
              <Option value="inventory">Inventory</Option>
              <Option value="users">Users</Option>
            </Select>
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              value={dateRange}
              onChange={setDateRange}
            />
            <Select
              placeholder="Category"
              allowClear
              style={{ width: 150 }}
              value={categoryFilter}
              onChange={setCategoryFilter}
            >
              <Option value="items">Items</Option>
              <Option value="users">Users</Option>
              <Option value="transactions">Transactions</Option>
              <Option value="damage">Damage</Option>
            </Select>
          </Space>
          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                // Apply filters
                console.log('Applying filters:', { reportType, dateRange, categoryFilter });
              }}
            >
              Apply Filters
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              onClick={handleExportPDF}
              type="primary"
            >
              Export PDF
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              type="primary"
            >
              Export Excel
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Space>
        </div>
      </Card>

      {/* Reports Table */}
      <Card>
        <Tabs defaultActiveKey="audit" items={tabItems} />
      </Card>
    </div>
  );
};

export default Reports;
