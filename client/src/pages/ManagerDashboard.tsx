import React from 'react';
import { Card, Row, Col, Statistic, Typography, List, Avatar, Tag, Button, Space, Progress, message, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import {
  InboxOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  TruckOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { brandColors } from '@/theme';
import { useDashboard } from '@/hooks/useDashboard';

const { Title, Text } = Typography;

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    stats, 
    statsLoading, 
    categories, 
    categoriesLoading, 
    trends, 
    trendsLoading,
    activities,
    activitiesLoading,
    lowStockAlerts,
    lowStockLoading
  } = useDashboard();

  // Action handlers with feedback
  const handleQuickAction = (action: string, path: string) => {
    message.success(`Opening ${action}...`);
    navigate(path);
  };

  // Use real data from the dashboard service
  const monthlyData = trends.length > 0 ? trends : [
    { month: 'Jan', items: 0, users: 0, borrows: 0, returns: 0 },
    { month: 'Feb', items: 0, users: 0, borrows: 0, returns: 0 },
    { month: 'Mar', items: 0, users: 0, borrows: 0, returns: 0 },
    { month: 'Apr', items: 0, users: 0, borrows: 0, returns: 0 },
    { month: 'May', items: 0, users: 0, borrows: 0, returns: 0 },
    { month: 'Jun', items: 0, users: 0, borrows: 0, returns: 0 },
  ];

  const categoryData = categories.length > 0 ? categories : [
    { name: 'No Data', value: 0, color: brandColors.primary },
  ];

  const statusData = [
    { name: 'Available', value: stats.totalItems - stats.activeBorrowed - stats.damagedItems, color: brandColors.success },
    { name: 'Borrowed', value: stats.activeBorrowed, color: brandColors.primary },
    { name: 'Maintenance', value: 0, color: brandColors.warning },
    { name: 'Damaged', value: stats.damagedItems, color: brandColors.error },
  ];

  // Show loading spinner if data is being fetched
  if (statsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Use real activity data from the dashboard service
  const recentActivity = activities.length > 0 ? activities : [
    {
      id: '1',
      type: 'info',
      user: 'System',
      item: 'No recent activity',
      timestamp: new Date().toISOString(),
      status: 'completed',
    },
  ];

  // Use real low stock alerts from the dashboard service
  const lowStockItems = lowStockAlerts.length > 0 ? lowStockAlerts : [
    {
      id: '1',
      name: 'No low stock items',
      currentStock: 0,
      minStock: 0,
      category: 'System',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'borrow':
        return <ShoppingCartOutlined style={{ color: brandColors.primary }} />;
      case 'return':
        return <CheckCircleOutlined style={{ color: brandColors.success }} />;
      case 'damage':
        return <ExclamationCircleOutlined style={{ color: brandColors.error }} />;
      case 'delivery':
        return <TruckOutlined style={{ color: brandColors.warning }} />;
      default:
        return <InboxOutlined />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStockLevel = (current: number, min: number) => {
    if (min === 0) return { status: 'success', percentage: 100 };
    const percentage = (current / min) * 100;
    if (current === 0) return { status: 'exception', percentage: 0 };
    if (current < min) return { status: 'exception', percentage };
    if (current <= min * 1.5) return { status: 'active', percentage };
    return { status: 'success', percentage: 100 };
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Manager Dashboard
        </Title>
        <Text type="secondary">
          Complete overview of inventory management system
        </Text>
      </div>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => handleQuickAction('User Management', '/manager/manage-users')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <UserOutlined style={{ fontSize: 32, color: brandColors.primary, marginBottom: 8 }} />
            <div>
              <Text strong>Manage Users</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Button type="primary" size="small" icon={<UserOutlined />}>
                User Admin
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => handleQuickAction('Item Management', '/manager/manage-items')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <InboxOutlined style={{ fontSize: 32, color: brandColors.success, marginBottom: 8 }} />
            <div>
              <Text strong>Manage Items</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Button type="primary" size="small" icon={<InboxOutlined />}>
                Inventory
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => handleQuickAction('Reports & Analytics', '/manager/reports')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <BarChartOutlined style={{ fontSize: 32, color: brandColors.warning, marginBottom: 8 }} />
            <div>
              <Text strong>Reports & Logs</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Button type="primary" size="small" icon={<BarChartOutlined />}>
                Analytics
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => handleQuickAction('System Analytics', '/manager/analytics')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <PieChartOutlined style={{ fontSize: 32, color: brandColors.error, marginBottom: 8 }} />
            <div>
              <Text strong>Analytics</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Button type="primary" size="small" icon={<PieChartOutlined />}>
                Insights
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={stats.totalItems}
              prefix={<InboxOutlined style={{ color: brandColors.primary }} />}
              valueStyle={{ color: brandColors.primary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Borrowed"
              value={stats.activeBorrowed}
              prefix={<ShoppingCartOutlined style={{ color: brandColors.success }} />}
              valueStyle={{ color: brandColors.success }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Deliveries"
              value={stats.pendingDeliveries}
              prefix={<TruckOutlined style={{ color: brandColors.warning }} />}
              valueStyle={{ color: brandColors.warning }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Damaged Items"
              value={stats.damagedItems}
              prefix={<ExclamationCircleOutlined style={{ color: brandColors.error }} />}
              valueStyle={{ color: brandColors.error }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: brandColors.primary }} />}
              valueStyle={{ color: brandColors.primary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Requests"
              value={stats.pendingRequests}
              prefix={<ClockCircleOutlined style={{ color: brandColors.warning }} />}
              valueStyle={{ color: brandColors.warning }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Overdue Returns"
              value={stats.overdueReturns}
              prefix={<WarningOutlined style={{ color: brandColors.error }} />}
              valueStyle={{ color: brandColors.error }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={stats.lowStockItems}
              prefix={<ExclamationCircleOutlined style={{ color: brandColors.error }} />}
              valueStyle={{ color: brandColors.error }}
            />
          </Card>
        </Col>
      </Row>

      {/* Analytics Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Monthly Trends" icon={<BarChartOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="items" stroke={brandColors.primary} name="Items" />
                <Line type="monotone" dataKey="users" stroke={brandColors.success} name="Users" />
                <Line type="monotone" dataKey="deliveries" stroke={brandColors.warning} name="Deliveries" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Item Categories" icon={<PieChartOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Activity"
            extra={
              <Button type="link" onClick={() => navigate('/manager/reports')}>
                View All
              </Button>
            }
          >
            <List
              dataSource={recentActivity}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={getActivityIcon(activity.type)} />}
                    title={
                      <Space>
                        <Text strong>{activity.user}</Text>
                        <Tag color={getActivityColor(activity.status)}>
                          {activity.status.replace('_', ' ').toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text>{activity.item}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {activity.timestamp}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Low Stock Alerts */}
        <Col xs={24} lg={12}>
          <Card
            title="Low Stock Alerts"
            extra={
              <Button type="link" onClick={() => navigate('/manager/manage-items')}>
                Manage
              </Button>
            }
          >
            <List
              dataSource={lowStockItems}
              renderItem={(item) => {
                const stockLevel = getStockLevel(item.currentStock, item.minStock);
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<InboxOutlined />} />}
                      title={item.name}
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">Category: {item.category}</Text>
                          <div>
                            <Text strong>Stock: {item.currentStock} / {item.minStock} (min)</Text>
                            <Progress
                              percent={stockLevel.percentage}
                              status={stockLevel.status}
                              size="small"
                              style={{ marginTop: 4 }}
                            />
                          </div>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDashboard;
