import React from 'react';
import { Card, Row, Col, Statistic, Typography, List, Avatar, Tag, Button, Space, Progress, Alert, Spin } from 'antd';
import {
  InboxOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { brandColors } from '@/theme';
import { useDashboard } from '@/hooks/useDashboard';

const { Title, Text } = Typography;

const StoreKeeperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    stats, 
    statsLoading, 
    lowStockAlerts, 
    lowStockLoading,
    pendingRequests,
    pendingRequestsLoading
  } = useDashboard();

  // Show loading spinner if data is being fetched
  if (statsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

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

  // Use real pending requests from the dashboard service
  const recentRequests = pendingRequests.length > 0 ? pendingRequests : [
    {
      id: '1',
      itemName: 'No pending requests',
      requestedBy: 'System',
      quantity: 0,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      priority: 'Low',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
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

  const getStockLevel = (current: number, min: number) => {
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
          Store Keeper Dashboard
        </Title>
        <Text type="secondary">
          Manage inventory, approve requests, and track stock levels
        </Text>
      </div>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => navigate('/storekeeper/manage-items')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <InboxOutlined style={{ fontSize: 32, color: brandColors.primary, marginBottom: 8 }} />
            <div>
              <Text strong>Manage Items</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => navigate('/storekeeper/approve-requests')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <CheckCircleOutlined style={{ fontSize: 32, color: brandColors.success, marginBottom: 8 }} />
            <div>
              <Text strong>Approve Requests</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => navigate('/storekeeper/track-stock')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <BarChartOutlined style={{ fontSize: 32, color: brandColors.warning, marginBottom: 8 }} />
            <div>
              <Text strong>Track Stock</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => navigate('/storekeeper/reports')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <ExclamationCircleOutlined style={{ fontSize: 32, color: brandColors.error, marginBottom: 8 }} />
            <div>
              <Text strong>Reports</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
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
              title="Low Stock Items"
              value={stats.lowStockItems}
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
              title="Approved Today"
              value={stats.approvedRequests}
              prefix={<CheckCircleOutlined style={{ color: brandColors.success }} />}
              valueStyle={{ color: brandColors.success }}
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert
          message={`${lowStockItems.length} items are running low on stock`}
          description="Please review and restock these items to avoid stockouts."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" onClick={() => navigate('/storekeeper/track-stock')}>
              View Details
            </Button>
          }
        />
      )}

      <Row gutter={[16, 16]}>
        {/* Low Stock Items */}
        <Col xs={24} lg={12}>
          <Card
            title="Low Stock Items"
            extra={
              <Button type="link" onClick={() => navigate('/storekeeper/track-stock')}>
                View All
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

        {/* Recent Requests */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Requests"
            extra={
              <Button type="link" onClick={() => navigate('/storekeeper/approve-requests')}>
                View All
              </Button>
            }
          >
            <List
              dataSource={recentRequests}
              renderItem={(request) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => navigate('/storekeeper/approve-requests')}
                    >
                      Review
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<ShoppingCartOutlined />} />}
                    title={request.itemName}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">
                          Requested by: {request.requestedBy}
                        </Text>
                        <Text type="secondary">
                          Quantity: {request.quantity} • Date: {new Date(request.requestDate).toLocaleDateString()}
                        </Text>
                        <div>
                          <Tag color={getStatusColor(request.status)}>{request.status}</Tag>
                          <Tag color={getPriorityColor(request.priority)}>{request.priority} Priority</Tag>
                        </div>
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

export default StoreKeeperDashboard;
