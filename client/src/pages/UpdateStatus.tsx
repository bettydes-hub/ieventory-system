import React, { useState } from 'react';
import { Card, Typography, Steps, Button, Space, Form, Input, Select, DatePicker, TimePicker, message, Divider, Tag, Row, Col } from 'antd';
import { TruckOutlined, CheckCircleOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { Delivery } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const UpdateStatus: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const deliveries = [
    {
      deliveryId: '1',
      itemName: 'Laptop - Dell XPS 13',
      fromStore: 'Main Store',
      toStore: 'Branch Store A',
      status: 'Assigned',
      scheduledDate: '2024-01-20',
    },
    {
      deliveryId: '2',
      itemName: 'Monitor - Samsung 24"',
      fromStore: 'Branch Store B',
      toStore: 'Main Store',
      status: 'In Progress',
      scheduledDate: '2024-01-19',
    },
    {
      deliveryId: '3',
      itemName: 'Mouse - Logitech MX Master',
      fromStore: 'Main Store',
      toStore: 'Branch Store C',
      status: 'Picked Up',
      scheduledDate: '2024-01-18',
    },
  ];

  const steps = [
    {
      title: 'Select Delivery',
      description: 'Choose the delivery to update',
      icon: <TruckOutlined />,
    },
    {
      title: 'Update Status',
      description: 'Change delivery status',
      icon: <ClockCircleOutlined />,
    },
    {
      title: 'Add Details',
      description: 'Provide additional information',
      icon: <EnvironmentOutlined />,
    },
    {
      title: 'Confirm',
      description: 'Review and confirm changes',
      icon: <CheckCircleOutlined />,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'warning';
      case 'Picked Up':
        return 'processing';
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

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Assigned':
        return 'Picked Up';
      case 'Picked Up':
        return 'In Progress';
      case 'In Progress':
        return 'Completed';
      default:
        return 'Completed';
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedDelivery) {
      message.error('Please select a delivery');
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Mock API call to update delivery status
      console.log('Updating delivery status:', {
        deliveryId: selectedDelivery,
        ...values,
      });
      
      message.success('Delivery status updated successfully!');
      
      // Reset form and go back to first step
      setCurrentStep(0);
      setSelectedDelivery('');
      form.resetFields();
    } catch (error) {
      message.error('Failed to update delivery status');
    }
  };

  const selectedDeliveryData = deliveries.find(d => d.deliveryId === selectedDelivery);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Title level={4}>Select Delivery to Update</Title>
            <Form.Item
              name="deliveryId"
              label="Delivery"
              rules={[{ required: true, message: 'Please select a delivery' }]}
            >
              <Select
                placeholder="Choose a delivery"
                value={selectedDelivery}
                onChange={setSelectedDelivery}
                size="large"
              >
                {deliveries.map(delivery => (
                  <Option key={delivery.deliveryId} value={delivery.deliveryId}>
                    <div>
                      <Text strong>{delivery.itemName}</Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {delivery.fromStore} → {delivery.toStore}
                        </Text>
                      </div>
                      <div>
                        <Tag color={getStatusColor(delivery.status)} size="small">
                          {delivery.status}
                        </Tag>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        );

      case 1:
        return (
          <div>
            <Title level={4}>Update Delivery Status</Title>
            {selectedDeliveryData && (
              <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
                <Text strong>Selected Delivery:</Text>
                <div style={{ marginTop: 8 }}>
                  <Text>{selectedDeliveryData.itemName}</Text>
                  <div>
                    <Text type="secondary">
                      {selectedDeliveryData.fromStore} → {selectedDeliveryData.toStore}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">
                      Current Status: <Tag color={getStatusColor(selectedDeliveryData.status)}>
                        {selectedDeliveryData.status}
                      </Tag>
                    </Text>
                  </div>
                </div>
              </div>
            )}
            <Form.Item
              name="newStatus"
              label="New Status"
              rules={[{ required: true, message: 'Please select new status' }]}
              initialValue={selectedDeliveryData ? getNextStatus(selectedDeliveryData.status) : undefined}
            >
              <Select placeholder="Select new status" size="large">
                <Option value="Picked Up">Picked Up</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
          </div>
        );

      case 2:
        return (
          <div>
            <Title level={4}>Add Delivery Details</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="pickupTime"
                  label="Pickup Time"
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    placeholder="Select pickup time"
                    format="HH:mm"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="deliveryTime"
                  label="Delivery Time"
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    placeholder="Select delivery time"
                    format="HH:mm"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="recipientName"
              label="Recipient Name"
            >
              <Input placeholder="Enter recipient name" prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item
              name="deliveryNotes"
              label="Delivery Notes"
            >
              <TextArea
                rows={3}
                placeholder="Enter any notes about the delivery..."
              />
            </Form.Item>
            <Form.Item
              name="issues"
              label="Issues (if any)"
            >
              <TextArea
                rows={2}
                placeholder="Describe any issues encountered during delivery..."
              />
            </Form.Item>
          </div>
        );

      case 3:
        return (
          <div>
            <Title level={4}>Confirm Changes</Title>
            <Card>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Delivery:</Text>
                  <div style={{ marginLeft: 16 }}>
                    <Text>{selectedDeliveryData?.itemName}</Text>
                    <div>
                      <Text type="secondary">
                        {selectedDeliveryData?.fromStore} → {selectedDeliveryData?.toStore}
                      </Text>
                    </div>
                  </div>
                </div>
                <Divider />
                <div>
                  <Text strong>Status Change:</Text>
                  <div style={{ marginLeft: 16 }}>
                    <Tag color={getStatusColor(selectedDeliveryData?.status || '')}>
                      {selectedDeliveryData?.status}
                    </Tag>
                    <Text> → </Text>
                    <Tag color={getStatusColor(form.getFieldValue('newStatus'))}>
                      {form.getFieldValue('newStatus')}
                    </Tag>
                  </div>
                </div>
                {form.getFieldValue('recipientName') && (
                  <>
                    <Divider />
                    <div>
                      <Text strong>Recipient:</Text>
                      <div style={{ marginLeft: 16 }}>
                        <Text>{form.getFieldValue('recipientName')}</Text>
                      </div>
                    </div>
                  </>
                )}
                {form.getFieldValue('deliveryNotes') && (
                  <>
                    <Divider />
                    <div>
                      <Text strong>Notes:</Text>
                      <div style={{ marginLeft: 16 }}>
                        <Text>{form.getFieldValue('deliveryNotes')}</Text>
                      </div>
                    </div>
                  </>
                )}
              </Space>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Update Delivery Status
        </Title>
        <Text type="secondary">
          Track and update delivery status with detailed information
        </Text>
      </div>

      <Card>
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: 32 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {renderStepContent()}

          <div style={{ marginTop: 32, textAlign: 'right' }}>
            <Space>
              {currentStep > 0 && (
                <Button onClick={handlePrev}>
                  Previous
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button type="primary" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="primary" htmlType="submit">
                  Update Status
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateStatus;
