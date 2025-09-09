import React from 'react';
import { Card, Row, Col, Statistic, Typography, List, Avatar, Tag, Button, Space, Progress, message, Spin } from 'antd';
import {
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { brandColors } from '@/theme';
import { useDashboard } from '@/hooks/useDashboard';

const { Title, Text } = Typography;

const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    deliveryStats, 
    deliveryStatsLoading,
    activities,
    activitiesLoading
  } = useDashboard();

  // Action handlers with feedback
  const handleQuickAction = (action: string, path: string) => {
    message.success(`Opening ${action}...`);
    navigate(path);
  };

  const handleStartDelivery = (deliveryId: string) => {
    message.success('Starting delivery...');
    navigate('/delivery/update-status');
  };

  // Show loading spinner if data is being fetched
  if (deliveryStatsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Use real delivery data from the dashboard service
  const assignedDeliveries = activities.length > 0 ? activities : [
    {
      id: '1',
      item: 'No assigned deliveries',
      fromStore: 'System',
      toStore: 'System',
      status: 'Completed',
      priority: 'Low',
      scheduledDate: new Date().toISOString().split('T')[0],
      estimatedTime: '0 hours',
    },
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Delivery Completed',
      item: 'Laptop - Dell XPS 13',
      from: 'Main Store',
      to: 'Branch Store A',
      timestamp: '2024-01-19 14:30',
      status: 'completed',
    },
    {
      id: '2',
      action: 'Delivery Started',
      item: 'Monitor - Samsung 24"',
      from: 'Branch Store B',
      to: 'Main Store',
      timestamp: '2024-01-19 10:15',
      status: 'in_progress',
    },
    {
      id: '3',
      action: 'New Assignment',
      item: 'Keyboard - Mechanical',
      from: 'Main Store',
      to: 'Branch Store C',
      timestamp: '2024-01-19 09:00',
      status: 'assigned',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'warning';
      case 'In Progress':
        return 'processing';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: brandColors.success }} />;
      case 'in_progress':
        return <ClockCircleOutlined style={{ color: brandColors.warning }} />;
      case 'assigned':
        return <TruckOutlined style={{ color: brandColors.primary }} />;
      default:
        return <TruckOutlined />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'assigned':
        return 'processing';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Delivery Dashboard
        </Title>
        <Text type="secondary">
          Manage deliveries between stores and track delivery status
        </Text>
      </div>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => handleQuickAction('Assigned Deliveries', '/delivery/assigned-deliveries')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <TruckOutlined style={{ fontSize: 32, color: brandColors.primary, marginBottom: 8 }} />
            <div>
              <Text strong>Assigned Deliveries</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Button type="primary" size="small" icon={<TruckOutlined />}>
                View All
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => handleQuickAction('Update Status', '/delivery/update-status')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <CheckCircleOutlined style={{ fontSize: 32, color: brandColors.success, marginBottom: 8 }} />
            <div>
              <Text strong>Update Status</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Button type="primary" size="small" icon={<PlayCircleOutlined />}>
                Quick Update
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => navigate('/delivery/route-optimization')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <EnvironmentOutlined style={{ fontSize: 32, color: brandColors.warning, marginBottom: 8 }} />
            <div>
              <Text strong>Route Planning</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => navigate('/delivery/history')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <CalendarOutlined style={{ fontSize: 32, color: brandColors.error, marginBottom: 8 }} />
            <div>
              <Text strong>Delivery History</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Assigned Deliveries"
              value={deliveryStats.assigned}
              prefix={<TruckOutlined style={{ color: brandColors.primary }} />}
              valueStyle={{ color: brandColors.primary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={deliveryStats.inProgress}
              prefix={<ClockCircleOutlined style={{ color: brandColors.warning }} />}
              valueStyle={{ color: brandColors.warning }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Today"
              value={deliveryStats.completed}
              prefix={<CheckCircleOutlined style={{ color: brandColors.success }} />}
              valueStyle={{ color: brandColors.success }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending"
              value={deliveryStats.pending}
              prefix={<ExclamationCircleOutlined style={{ color: brandColors.error }} />}
              valueStyle={{ color: brandColors.error }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Assigned Deliveries */}
        <Col xs={24} lg={12}>
          <Card
            title="Assigned Deliveries"
            extra={
              <Button type="link" onClick={() => navigate('/delivery/assigned-deliveries')}>
                View All
              </Button>
            }
          >
            <List
              dataSource={assignedDeliveries}
              renderItem={(delivery) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleStartDelivery(delivery.id)}
                    >
                      Update
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<TruckOutlined />} />}
                    title={delivery.item}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">
                          From: {delivery.fromStore} → To: {delivery.toStore}
                        </Text>
                        <Text type="secondary">
                          Scheduled: {new Date(delivery.scheduledDate).toLocaleDateString()}
                        </Text>
                        <div>
                          <Tag color={getStatusColor(delivery.status)}>{delivery.status}</Tag>
                          <Tag color={getPriorityColor(delivery.priority)}>{delivery.priority} Priority</Tag>
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Activity"
            extra={
              <Button type="link" onClick={() => navigate('/delivery/history')}>
                View All
              </Button>
            }
          >
            <List
              dataSource={recentActivity}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={getActivityIcon(activity.status)} />}
                    title={
                      <Space>
                        <Text strong>{activity.action}</Text>
                        <Tag color={getActivityColor(activity.status)}>
                          {activity.status.replace('_', ' ').toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text>{activity.item}</Text>
                        <Text type="secondary">
                          {activity.from} → {activity.to}
                        </Text>
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
      </Row>
    </div>
  );
};

export default DeliveryDashboard;
