import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Alert, Space } from 'antd';
import { LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { ChangePasswordRequest } from '@/types';

const { Title, Text } = Typography;

interface FirstTimeLoginModalProps {
  visible: boolean;
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const FirstTimeLoginModal: React.FC<FirstTimeLoginModalProps> = ({
  visible,
  userEmail,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ChangePasswordRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Validate passwords match
      if (values.newPassword !== values.confirmPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }

      // Validate password strength
      if (values.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      // Simulate password change API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success - close modal and proceed
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError(null);
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <span>First Time Login - Change Password</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      maskClosable={false}
      width={500}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        <Alert
          message="Welcome to the Inventory System!"
          description={
            <div>
              <p>You are logging in for the first time with the default password.</p>
              <p><strong>Email:</strong> {userEmail}</p>
              <p>Please set a new password to continue.</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: 'Please enter your current password' },
              { 
                validator: (_, value) => {
                  if (value === 'changeme') {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Current password is incorrect'));
                }
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter current password (changeme)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter new password"
              size="large"
            />
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
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm new password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              style={{ height: 45 }}
            >
              Change Password & Continue
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            You must change your password before accessing the system
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default FirstTimeLoginModal;
