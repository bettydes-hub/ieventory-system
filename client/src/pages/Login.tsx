import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { LoginRequest } from '@/types';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const { login, basecampLogin, loading, error, clearError, isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{email?: string, password?: string}>({});

  // Clear field errors when user starts typing
  const handleFieldChange = (field: 'email' | 'password') => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Also clear general error when user starts typing
    if (error) {
      clearError();
    }
  };

  // Clear errors on component mount
  useEffect(() => {
    clearError();
    setFieldErrors({});
  }, [clearError]);

  // Handle Basecamp callback on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleBasecampLogin();
    }
  }, []);

  const handleSubmit = async (values: LoginRequest) => {
    console.log('🔍 handleSubmit called with values:', values);
    setIsSubmitting(true);
    clearError();
    setFieldErrors({}); // Clear field-specific errors
    
    try {
      console.log('🔍 Calling login function...');
      await login(values);
      console.log('🔍 Login function completed successfully');
    } catch (error: any) {
      console.log('🔍 Login function failed with error:', error);
      // Handle field-specific errors
      if (error.errorType) {
        switch (error.errorType) {
          case 'INVALID_EMAIL_FORMAT':
          case 'EMAIL_NOT_FOUND':
            setFieldErrors({ email: error.message });
            break;
          case 'INVALID_PASSWORD':
            setFieldErrors({ password: error.message });
            break;
          case 'MISSING_FIELDS':
            if (!values.email) {
              setFieldErrors(prev => ({ ...prev, email: 'Email is required' }));
            }
            if (!values.password) {
              setFieldErrors(prev => ({ ...prev, password: 'Password is required' }));
            }
            break;
        }
      }
      // Error is also handled by the auth hook for general display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBasecampLogin = async () => {
    try {
      setIsSubmitting(true);
      clearError();
      
      // Mock Basecamp login for demo purposes
      // In a real app, this would redirect to Basecamp OAuth2
      console.log('Basecamp login clicked - this is a demo');
      
      // Simulate Basecamp login with a demo user
      const mockBasecampUser = {
        id: '5',
        name: 'Demo Basecamp User',
        email: 'demo@basecamp.com',
        role: 'Employee',
        isFirstLogin: false,
        passwordChanged: true,
        createdAt: '2024-01-20'
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use the regular login flow with mock Basecamp user
      await login({
        email: mockBasecampUser.email,
        password: 'basecamp123' // This won't be used, just for the login function
      });
      
    } catch (error) {
      console.error('Basecamp login error:', error);
      // Show a demo message
      alert('Basecamp login is not fully implemented yet. This is a demo version. In a real app, this would redirect to Basecamp OAuth2.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
      role="main"
      aria-label="Login page"
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        role="form"
        aria-label="Login form"
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Inventory System
          </Title>
          <Text type="secondary">
            Sign in to your account
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
            onClose={clearError}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={(values) => {
            console.log('🔍 Form onFinish triggered with values:', values);
            handleSubmit(values);
            return false; // Prevent form submission
          }}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            validateStatus={fieldErrors.email ? 'error' : ''}
            help={fieldErrors.email}
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
            onChange={(e) => {
              console.log('🔍 Email field changed:', e.target.value);
            }}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email"
              autoComplete="email"
              onChange={() => handleFieldChange('email')}
              aria-label="Email address"
              aria-required="true"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            validateStatus={fieldErrors.password ? 'error' : ''}
            help={fieldErrors.password}
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
              onChange={() => handleFieldChange('password')}
              aria-label="Password"
              aria-required="true"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading || isSubmitting}
              style={{ width: '100%', height: 40 }}
              aria-label="Sign in to your account"
              onClick={() => {
                console.log('🔍 Sign In button clicked!');
                console.log('🔍 Form values:', form.getFieldsValue());
                console.log('🔍 Form validation status:', form.getFieldsError());
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {/* Debug Test Buttons - OUTSIDE the form */}
        <div style={{ marginTop: 16 }}>
          <Button
            type="dashed"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔍 TEST BUTTON CLICKED - Testing direct login');
              console.log('🔍 Current state before login:', { isAuthenticated, loading, user });
              
              try {
                const testValues = {
                  email: 'admin@inventory.com',
                  password: 'admin123'
                };
                console.log('🔍 Calling login function directly with:', testValues);
                
                // Call login directly without going through handleSubmit
                const result = await login(testValues);
                console.log('🔍 Login function completed successfully!', result);
                console.log('🔍 State after login:', { isAuthenticated, loading, user });
              } catch (error) {
                console.log('🔍 Login function failed:', error);
                console.log('🔍 State after failed login:', { isAuthenticated, loading, user });
              }
            }}
            style={{ width: '100%', marginBottom: 8 }}
          >
            🧪 TEST LOGIN (Debug)
          </Button>
          
          <Button
            type="dashed"
            onClick={() => {
              console.log('🔍 Current auth state:', { 
                isAuthenticated: isAuthenticated, 
                loading: loading, 
                user: user, 
                error: error 
              });
            }}
            style={{ width: '100%', marginBottom: 16 }}
          >
            🔍 CHECK AUTH STATE
          </Button>
        </div>

        <Divider style={{ margin: '24px 0' }}>
          <Text type="secondary">OR</Text>
        </Divider>

        <Button
          type="default"
          size="large"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ marginRight: 8 }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          }
          onClick={handleBasecampLogin}
          loading={loading || isSubmitting}
          style={{ 
            width: '100%', 
            height: 40,
            backgroundColor: '#1d4ed8',
            borderColor: '#1d4ed8',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }}
          onMouseEnter={(e) => {
            if (!loading && !isSubmitting) {
              e.currentTarget.style.backgroundColor = '#1e40af';
              e.currentTarget.style.borderColor = '#1e40af';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !isSubmitting) {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
              e.currentTarget.style.borderColor = '#1d4ed8';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
        >
          Sign in with Basecamp
        </Button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Space direction="vertical" size="small">
            <Text type="secondary" style={{ fontSize: 12 }}>
              Demo Credentials:
            </Text>
            <Text code style={{ fontSize: 11 }}>
              Admin: admin@inventory.com / admin123
            </Text>
            <Text code style={{ fontSize: 11 }}>
              Employee: employee@inventory.com / employee123
            </Text>
            <Text code style={{ fontSize: 11 }}>
              Store Keeper: storekeeper@inventory.com / changeme
            </Text>
            <Text code style={{ fontSize: 11 }}>
              Delivery: delivery@inventory.com / changeme
            </Text>
            <Divider style={{ margin: '8px 0' }} />
            <Text type="secondary" style={{ fontSize: 11 }}>
              Or click "Sign in with Basecamp" above for demo
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Login;