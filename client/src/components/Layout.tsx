import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Badge, Button, Drawer, ConfigProvider } from 'antd';
import {
  MenuOutlined,
  DashboardOutlined,
  InboxOutlined,
  AppstoreOutlined,
  ShopOutlined,
  TeamOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
  TruckOutlined,
  SearchOutlined,
  AuditOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  HomeOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { themeConfig, brandColors, commonStyles } from '@/theme';
import NotificationDropdown from './NotificationDropdown';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useSelector((state: RootState) => state.notifications);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: 'Inventory',
    },
    {
      key: '/transactions',
      icon: <FileTextOutlined />,
      label: 'Requests',
    },
    {
      key: '/deliveries',
      icon: <TruckOutlined />,
      label: 'Deliveries',
    },
    {
      key: '/audit',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: 'Categories',
    },
    {
      key: '/stores',
      icon: <ShopOutlined />,
      label: 'Stores',
    },
    {
      key: '/suppliers',
      icon: <TeamOutlined />,
      label: 'Suppliers',
    },
    {
      key: '/damage-reports',
      icon: <ExclamationCircleOutlined />,
      label: 'Damage Reports',
    },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: 'Search',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setMobileMenuVisible(false);
  };

  const handleLogout = () => {
    logout();
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const siderContent = (
    <div>
      <div style={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryActive} 100%)`
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#fff',
          fontSize: collapsed ? '16px' : '18px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}>
          {collapsed ? 'INV' : 'Inventory'}
        </h2>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ 
          borderRight: 0,
          background: '#001529',
          color: '#fff'
        }}
        theme="dark"
      />
    </div>
  );

  return (
    <ConfigProvider theme={themeConfig}>
      <AntLayout style={{ minHeight: '100vh' }}>
        {/* Desktop Sider */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
            background: '#001529',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          }}
          width={250}
          collapsedWidth={80}
          breakpoint="lg"
          onBreakpoint={(broken: boolean) => {
            if (broken) {
              setCollapsed(true);
            }
          }}
        >
          {siderContent}
        </Sider>

        {/* Mobile Drawer */}
        <Drawer
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#1890ff',
              fontWeight: 'bold'
            }}>
              <InboxOutlined style={{ marginRight: 8 }} />
              Inventory System
            </div>
          }
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          width={250}
          styles={{
            body: { padding: 0, background: '#001529' }
          }}
        >
          {siderContent}
        </Drawer>

        <AntLayout 
          style={{ 
            marginLeft: window.innerWidth >= 992 ? (collapsed ? 80 : 250) : 0, 
            transition: 'margin-left 0.2s',
            background: '#f5f5f5'
          }}
        >
          <Header
            style={{
              padding: '0 16px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f0f0f0',
              ...commonStyles.shadow,
              position: 'sticky',
              top: 0,
              zIndex: 999,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => {
                  if (window.innerWidth < 992) {
                    setMobileMenuVisible(true);
                  } else {
                    setCollapsed(!collapsed);
                  }
                }}
                style={{ 
                  marginRight: 16,
                  fontSize: '16px',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <NotificationDropdown />
              
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }}>
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ 
                      marginRight: 8,
                      background: '#1890ff'
                    }} 
                  />
                  <span style={{ fontWeight: 500 }}>{user?.name}</span>
                </div>
              </Dropdown>
            </div>
          </Header>

          <Content
            style={{
              margin: '16px',
              padding: 24,
              background: '#fff',
              ...commonStyles.borderRadius,
              minHeight: 'calc(100vh - 112px)',
              ...commonStyles.shadow,
            }}
          >
            {children}
          </Content>
        </AntLayout>
      </AntLayout>
    </ConfigProvider>
  );
};

export default Layout;