import React from 'react';
import { Badge, Dropdown, Button, List, Typography, Space, Tag } from 'antd';
import { BellOutlined, ExclamationCircleOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { brandColors } from '@/theme';

const { Text } = Typography;

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: brandColors.success }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: brandColors.warning }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: brandColors.error }} />;
      default:
        return <InfoCircleOutlined style={{ color: brandColors.info }} />;
    }
  };

  const getNotificationTag = (type: string) => {
    switch (type) {
      case 'success':
        return <Tag color="success">Success</Tag>;
      case 'warning':
        return <Tag color="warning">Warning</Tag>;
      case 'error':
        return <Tag color="error">Error</Tag>;
      default:
        return <Tag color="processing">Info</Tag>;
    }
  };

  const notificationItems = [
    {
      key: 'notifications',
      label: (
        <div style={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text strong>Notifications</Text>
            {unreadCount > 0 && (
              <Tag color="red">{unreadCount} unread</Tag>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div style={{ 
              padding: '24px', 
              textAlign: 'center',
              color: '#8c8c8c'
            }}>
              <BellOutlined style={{ fontSize: 24, marginBottom: 8 }} />
              <div>No notifications</div>
            </div>
          ) : (
            <List
              dataSource={notifications}
              renderItem={(notification: Notification) => (
                <List.Item
                  style={{
                    padding: '12px 16px',
                    backgroundColor: notification.read ? '#fff' : '#f6ffed',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    // Handle notification click
                    console.log('Notification clicked:', notification.id);
                  }}
                >
                  <List.Item.Meta
                    avatar={getNotificationIcon(notification.type)}
                    title={
                      <Space>
                        <Text strong={!notification.read}>{notification.title}</Text>
                        {getNotificationTag(notification.type)}
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>{notification.message}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {notification.timestamp}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
          
          {notifications.length > 0 && (
            <div style={{ 
              padding: '12px 16px', 
              borderTop: '1px solid #f0f0f0',
              textAlign: 'center'
            }}>
              <Button type="link" size="small">
                Mark all as read
              </Button>
              <Button type="link" size="small">
                View all notifications
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items: notificationItems }}
      placement="bottomRight"
      trigger={['click']}
      arrow
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button 
          type="text" 
          icon={<BellOutlined />} 
          style={{ 
            fontSize: '16px',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
