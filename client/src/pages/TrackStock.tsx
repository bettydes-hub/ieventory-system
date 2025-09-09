import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Progress, Tag, Space, Select, DatePicker, Button } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  InboxOutlined, 
  WarningOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  DownloadOutlined,
  FilterOutlined 
} from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { ColumnsType } from 'antd/es/table';
import type { Item } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const TrackStock: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Mock data - replace with actual API calls
  const items: Item[] = [
    {
      itemId: '1',
      name: 'Laptop - Dell XPS 13',
      categoryId: 'cat1',
      storeId: 'store1',
      quantity: 2,
      minStockLevel: 5,
      maxStockLevel: 10,
      status: 'available',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      itemId: '2',
      name: 'Monitor - Samsung 24"',
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
      categoryId: 'cat3',
      storeId: 'store1',
      quantity: 0,
      minStockLevel: 2,
      maxStockLevel: 8,
      status: 'maintenance',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const categories = [
    { id: 'cat1', name: 'Laptops' },
    { id: 'cat2', name: 'Monitors' },
    { id: 'cat3', name: 'Accessories' },
  ];

  // Chart data
  const stockLevelData = [
    { name: 'Laptops', current: 2, min: 5, max: 10 },
    { name: 'Monitors', current: 8, min: 3, max: 15 },
    { name: 'Accessories', current: 12, min: 7, max: 28 },
  ];

  const statusData = [
    { name: 'Available', value: 3, color: brandColors.success },
    { name: 'Low Stock', value: 1, color: brandColors.warning },
    { name: 'Out of Stock', value: 1, color: brandColors.error },
    { name: 'Maintenance', value: 1, color: brandColors.info },
  ];

  const monthlyTrendData = [
    { month: 'Jan', stock: 120, requests: 15 },
    { month: 'Feb', stock: 115, requests: 18 },
    { month: 'Mar', stock: 110, requests: 22 },
    { month: 'Apr', stock: 105, requests: 20 },
    { month: 'May', stock: 100, requests: 25 },
    { month: 'Jun', stock: 95, requests: 28 },
  ];

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

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { status: 'Out of Stock', color: brandColors.error };
    if (current < min) return { status: 'Low Stock', color: brandColors.warning };
    if (current <= min * 1.5) return { status: 'Adequate', color: brandColors.info };
    return { status: 'Good Stock', color: brandColors.success };
  };

  const columns: ColumnsType<Item> = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'category',
      render: (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'Unknown';
      },
    },
    {
      title: 'Current Stock',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => {
        const stockStatus = getStockStatus(quantity, record.minStockLevel);
        return (
          <div>
            <Text strong style={{ color: stockStatus.color }}>
              {quantity}
            </Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stockStatus.status}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Stock Level',
      key: 'stockLevel',
      render: (_, record) => {
        const percentage = (record.quantity / record.maxStockLevel) * 100;
        const stockStatus = getStockStatus(record.quantity, record.minStockLevel);
        
        return (
          <div>
            <Progress
              percent={percentage}
              status={record.quantity === 0 ? 'exception' : record.quantity < record.minStockLevel ? 'active' : 'success'}
              size="small"
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              Min: {record.minStockLevel} | Max: {record.maxStockLevel}
            </div>
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
          {getStatusText(status)}
        </Tag>
      ),
    },
  ];

  const filteredItems = items.filter(item => {
    const matchesCategory = !categoryFilter || item.categoryId === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const lowStockItems = items.filter(item => item.quantity < item.minStockLevel);
  const outOfStockItems = items.filter(item => item.quantity === 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Track Stock
        </Title>
        <Text type="secondary">
          Monitor stock levels, analyze trends, and manage inventory
        </Text>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={items.length}
              prefix={<InboxOutlined style={{ color: brandColors.primary }} />}
              valueStyle={{ color: brandColors.primary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={lowStockItems.length}
              prefix={<WarningOutlined style={{ color: brandColors.warning }} />}
              valueStyle={{ color: brandColors.warning }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={outOfStockItems.length}
              prefix={<ExclamationCircleOutlined style={{ color: brandColors.error }} />}
              valueStyle={{ color: brandColors.error }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Good Stock"
              value={items.length - lowStockItems.length - outOfStockItems.length}
              prefix={<CheckCircleOutlined style={{ color: brandColors.success }} />}
              valueStyle={{ color: brandColors.success }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Stock Levels by Category">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockLevelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" fill={brandColors.primary} name="Current Stock" />
                <Bar dataKey="min" fill={brandColors.warning} name="Min Required" />
                <Bar dataKey="max" fill={brandColors.success} name="Max Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Stock Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Monthly Trend */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title="Monthly Stock Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="stock" stroke={brandColors.primary} name="Stock Level" />
                <Line yAxisId="right" type="monotone" dataKey="requests" stroke={brandColors.warning} name="Requests" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space wrap>
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
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="available">Available</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="damaged">Damaged</Option>
              <Option value="retired">Retired</Option>
            </Select>
            <RangePicker placeholder={['Start Date', 'End Date']} />
          </Space>
          <Space>
            <Button icon={<FilterOutlined />}>
              Apply Filters
            </Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              Export Report
            </Button>
          </Space>
        </div>
      </Card>

      {/* Stock Table */}
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
    </div>
  );
};

export default TrackStock;
