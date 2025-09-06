import React from 'react';
import { Row, Col, Card, Statistic, Table, List, Avatar, Tag, Typography, Space, Button } from 'antd';
import {
  InboxOutlined,
  ShopOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  SwapOutlined,
  TruckOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
} from '@ant-design/icons';
import { useInventory } from '@/hooks/useInventory';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    inventorySummary,
    summaryLoading,
    lowStockAlerts,
    alertsLoading,
  } = useInventory();

  const stats = [
    {
      title: 'Total Items',
      value: inventorySummary?.totalItems || 0,
      icon: <InboxOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: 'Total Stores',
      value: inventorySummary?.totalStores || 0,
      icon: <ShopOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      title: 'Total Suppliers',
      value: inventorySummary?.totalSuppliers || 0,
      icon: <TeamOutlined style={{ color: '#faad14' }} />,
      color: '#faad14',
    },
    {
      title: 'Low Stock Items',
      value: inventorySummary?.lowStockItems || 0,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      color: '#ff4d4f',
    },
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Item Added',
      item: 'Laptop Dell XPS 13',
      user: 'John Doe',
      time: '2 minutes ago',
      type: 'success',
    },
    {
      id: '2',
      action: 'Item Borrowed',
      item: 'iPhone 14 Pro',
      user: 'Jane Smith',
      time: '15 minutes ago',
      type: 'info',
    },
    {
      id: '3',
      action: 'Low Stock Alert',
      item: 'USB Cable Type-C',
      user: 'System',
      time: '1 hour ago',
      type: 'warning',
    },
    {
      id: '4',
      action: 'Damage Reported',
      item: 'Monitor Samsung 24"',
      user: 'Mike Johnson',
      time: '2 hours ago',
      type: 'error',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUpOutlined style={{ color: '#52c41a' }} />;
      case 'info':
        return <SwapOutlined style={{ color: '#1890ff' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <InboxOutlined />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'info':
        return 'processing';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Welcome back, {user?.name}!
        </Title>
        <Text type="secondary">
          Here's what's happening with your inventory today.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card loading={summaryLoading}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Low Stock Alerts */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                Low Stock Alerts
              </Space>
            }
            extra={<Button type="link">View All</Button>}
            loading={alertsLoading}
          >
            {lowStockAlerts && lowStockAlerts.length > 0 ? (
              <List
                dataSource={lowStockAlerts.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<InboxOutlined />} />}
                      title={item.name}
                      description={
                        <Space>
                          <Text type="secondary">Current: {item.quantity}</Text>
                          <Text type="secondary">Min: {item.minStockLevel}</Text>
                          <Tag color="red">Low Stock</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">No low stock alerts</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrendingUpOutlined style={{ color: '#1890ff' }} />
                Recent Activity
              </Space>
            }
            extra={<Button type="link">View All</Button>}
          >
            <List
              dataSource={recentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={getActivityIcon(item.type)} />}
                    title={
                      <Space>
                        <Text strong>{item.action}</Text>
                        <Tag color={getActivityColor(item.type)}>{item.type}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text>{item.item}</Text>
                        <Space>
                          <Text type="secondary">by {item.user}</Text>
                          <Text type="secondary">•</Text>
                          <Text type="secondary">{item.time}</Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginTop: 16 }}>
        <Space wrap>
          <Button type="primary" icon={<InboxOutlined />}>
            Add New Item
          </Button>
          <Button icon={<SwapOutlined />}>
            Borrow Item
          </Button>
          <Button icon={<TruckOutlined />}>
            Track Delivery
          </Button>
          <Button icon={<ExclamationCircleOutlined />}>
            Report Damage
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Dashboard;