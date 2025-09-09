import React from 'react';
import { Card, Row, Col, Statistic, Typography, List, Avatar, Tag, Button, Space, message, Spin } from 'antd';
import {
  ShoppingCartOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { brandColors } from '@/theme';
import { useDashboard } from '@/hooks/useDashboard';

const { Title, Text } = Typography;

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    stats, 
    statsLoading, 
    activities,
    activitiesLoading
  } = useDashboard();

  // Action handlers with feedback
  const handleQuickAction = (action: string, path: string) => {
    message.success(`Navigating to ${action}...`);
    navigate(path);
  };

  const handleReturnItem = (itemId: string) => {
    message.success('Opening return form...');
    navigate('/employee/return');
  };

  // Show loading spinner if data is being fetched
  if (statsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Use real activity data from the dashboard service
  const recentBorrows = activities.length > 0 ? activities : [
    {
      id: '1',
      itemName: 'No recent borrows',
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      daysLeft: 0,
    },
  ];

  const pendingRequests = [
    {
      id: '1',
      itemName: 'Keyboard - Mechanical',
      requestDate: '2024-01-19',
      status: 'Pending',
    },
    {
      id: '2',
      itemName: 'Headphones - Sony WH-1000XM4',
      requestDate: '2024-01-18',
      status: 'Pending',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Overdue':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft < 0) return '#ff4d4f';
    if (daysLeft <= 2) return '#faad14';
    return '#52c41a';
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Employee Dashboard
        </Title>
        <Text type="secondary">
          Manage your borrowed items, requests, and reports
        </Text>
      </div>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => handleQuickAction('Borrow Item', '/employee/borrow')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <ShoppingCartOutlined style={{ fontSize: 32, color: brandColors.primary, marginBottom: 8 }} />
            <div>
              <Text strong>Borrow Item</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Button type="primary" size="small" icon={<PlusOutlined />}>
                Quick Borrow
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => handleQuickAction('Return Item', '/employee/return')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <UndoOutlined style={{ fontSize: 32, color: brandColors.success, marginBottom: 8 }} />
            <div>
              <Text strong>Return Item</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Button type="primary" size="small" icon={<UndoOutlined />}>
                Quick Return
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => handleQuickAction('Report Damage', '/employee/damage-report')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <ExclamationCircleOutlined style={{ fontSize: 32, color: brandColors.error, marginBottom: 8 }} />
            <div>
              <Text strong>Report Damage</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Button type="primary" size="small" icon={<ExclamationCircleOutlined />}>
                Report Issue
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => handleQuickAction('My Requests', '/employee/requests')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <ClockCircleOutlined style={{ fontSize: 32, color: brandColors.warning, marginBottom: 8 }} />
            <div>
              <Text strong>My Requests</Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Button type="primary" size="small" icon={<ClockCircleOutlined />}>
                View Status
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Borrows"
              value={stats.activeBorrows}
              prefix={<CheckCircleOutlined style={{ color: brandColors.success }} />}
              valueStyle={{ color: brandColors.success }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Overdue Items"
              value={stats.overdueItems}
              prefix={<WarningOutlined style={{ color: brandColors.error }} />}
              valueStyle={{ color: brandColors.error }}
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
              title="Damage Reports"
              value={stats.damageReports}
              prefix={<ExclamationCircleOutlined style={{ color: brandColors.error }} />}
              valueStyle={{ color: brandColors.error }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Borrows */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Borrows"
            extra={
              <Button type="link" onClick={() => navigate('/employee/return')}>
                View All
              </Button>
            }
          >
            <List
              dataSource={recentBorrows}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleReturnItem(item.id)}
                    >
                      Return
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<ShoppingCartOutlined />} />}
                    title={item.itemName}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">
                          Borrowed: {new Date(item.borrowDate).toLocaleDateString()}
                        </Text>
                        <Text type="secondary">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </Text>
                        <div>
                          <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                          <Text
                            style={{
                              color: getDaysLeftColor(item.daysLeft),
                              fontWeight: 'bold',
                              marginLeft: 8,
                            }}
                          >
                            {item.daysLeft < 0
                              ? `${Math.abs(item.daysLeft)} days overdue`
                              : `${item.daysLeft} days left`}
                          </Text>
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Pending Requests */}
        <Col xs={24} lg={12}>
          <Card
            title="Pending Requests"
            extra={
              <Button type="link" onClick={() => navigate('/employee/requests')}>
                View All
              </Button>
            }
          >
            <List
              dataSource={pendingRequests}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ClockCircleOutlined />} />}
                    title={item.itemName}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">
                          Requested: {new Date(item.requestDate).toLocaleDateString()}
                        </Text>
                        <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
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

export default EmployeeDashboard;
