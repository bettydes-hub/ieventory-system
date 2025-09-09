import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Form,
  Input,
  Divider,
  Space,
  Tag,
  message,
  Tabs,
  Switch,
  Select,
  DatePicker,
  InputNumber,
  Alert,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { brandColors } from '@/theme';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  bio: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  preferences: {
    notifications: boolean;
    emailNotifications: boolean;
    timezone: string;
  };
  security: {
    lastPasswordChange: string;
    loginHistory: Array<{
      date: string;
      ip: string;
      location: string;
      device: string;
    }>;
  };
}

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [preferencesForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Mock profile data - replace with actual API calls
  const [profileData, setProfileData] = useState<ProfileData>({
    id: user?.id || '1',
    name: user?.name || 'John Employee',
    email: user?.email || 'employee@inventory.com',
    role: user?.role || 'Employee',
    department: 'IT Department',
    bio: 'Experienced IT professional with expertise in inventory management and system administration.',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, City, State 12345',
    dateOfBirth: '1990-05-15',
    preferences: {
      notifications: true,
      emailNotifications: true,
      timezone: 'America/New_York',
    },
    security: {
      lastPasswordChange: '2024-01-01',
      loginHistory: [
        {
          date: '2024-01-19 10:30:00',
          ip: '192.168.1.100',
          location: 'New York, NY',
          device: 'Chrome on Windows',
        },
        {
          date: '2024-01-18 14:20:00',
          ip: '192.168.1.100',
          location: 'New York, NY',
          device: 'Chrome on Windows',
        },
        {
          date: '2024-01-17 09:15:00',
          ip: '192.168.1.100',
          location: 'New York, NY',
          device: 'Chrome on Windows',
        },
      ],
    },
  });

  const handleProfileUpdate = async (values: any) => {
    setLoading(true);
    try {
      await updateProfile(values);
      setProfileData({ ...profileData, ...values });
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    setLoading(true);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Password changed successfully!');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (values: any) => {
    setLoading(true);
    try {
      const updatedPreferences = { ...profileData.preferences, ...values };
      setProfileData({ ...profileData, preferences: updatedPreferences });
      message.success('Preferences updated successfully!');
    } catch (error) {
      message.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };


  const tabItems = [
    {
      key: 'personal',
      label: 'Personal Information',
      icon: <UserOutlined />,
      children: (
        <Card>
          <Form
            form={profileForm}
            layout="vertical"
            initialValues={{
              name: profileData.name,
              email: profileData.email,
              department: profileData.department,
              bio: profileData.bio,
              phone: profileData.phone,
              address: profileData.address,
              dateOfBirth: profileData.dateOfBirth ? dayjs(profileData.dateOfBirth) : null,
            }}
            onFinish={handleProfileUpdate}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Enter your email" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Enter your phone number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="department"
                  label="Department"
                >
                  <Input prefix={<TeamOutlined />} placeholder="Enter your department" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="dateOfBirth"
                  label="Date of Birth"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="Select your date of birth"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="Address"
                >
                  <Input prefix={<EnvironmentOutlined />} placeholder="Enter your address" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="bio"
                  label="Bio"
                >
                  <TextArea
                    rows={4}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} icon={<EditOutlined />}>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: 'Security',
      icon: <LockOutlined />,
      children: (
        <div>
          <Card title="Change Password" style={{ marginBottom: 16 }}>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please enter your current password' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter a new password' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SecurityScanOutlined />}>
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>


          <Card title="Login History" style={{ marginTop: 16 }}>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {profileData.security.loginHistory.map((login, index) => (
                <div key={index} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{login.device}</Text>
                      <div>
                        <Text type="secondary">{login.location}</Text>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text>{new Date(login.date).toLocaleString()}</Text>
                      <div>
                        <Text code>{login.ip}</Text>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'preferences',
      label: 'Preferences',
      icon: <SettingOutlined />,
      children: (
        <Card>
          <Form
            form={preferencesForm}
            layout="vertical"
            initialValues={profileData.preferences}
            onFinish={handlePreferencesUpdate}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="notifications"
                  label="Push Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="emailNotifications"
                  label="Email Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="timezone"
                  label="Timezone"
                >
                  <Select>
                    <Option value="America/New_York">Eastern Time</Option>
                    <Option value="America/Chicago">Central Time</Option>
                    <Option value="America/Denver">Mountain Time</Option>
                    <Option value="America/Los_Angeles">Pacific Time</Option>
                    <Option value="UTC">UTC</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SettingOutlined />}>
                Save Preferences
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Profile Settings
        </Title>
        <Text type="secondary">
          Manage your personal information, security settings, and preferences
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Overview */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: brandColors.primary }}
                />
              </div>
              <Title level={4} style={{ margin: 0 }}>
                {profileData.name}
              </Title>
              <Text type="secondary">{profileData.email}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">{profileData.role}</Tag>
                <Tag color="green">{profileData.department}</Tag>
              </div>
              <Divider />
              <div style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: 8 }}>
                  <PhoneOutlined style={{ marginRight: 8, color: brandColors.primary }} />
                  <Text>{profileData.phone}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <EnvironmentOutlined style={{ marginRight: 8, color: brandColors.primary }} />
                  <Text>{profileData.address}</Text>
                </div>
                <div>
                  <CalendarOutlined style={{ marginRight: 8, color: brandColors.primary }} />
                  <Text>Member since {new Date(profileData.id).getFullYear()}</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Profile Tabs */}
        <Col xs={24} lg={16}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
