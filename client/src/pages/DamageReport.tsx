import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Typography, Space, message, Table, Tag } from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { ColumnsType } from 'antd/es/table';
import type { Item, DamageReport } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DamageReport: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Mock data - replace with actual API calls
  const availableItems: Item[] = [
    {
      itemId: '1',
      name: 'Laptop - Dell XPS 13',
      description: 'High-performance laptop for development work',
      model: 'XPS 13 9320',
      serialNumber: 'DLX001',
      manufacturer: 'Dell',
      categoryId: 'cat1',
      storeId: 'store1',
      quantity: 5,
      minStockLevel: 2,
      maxStockLevel: 10,
      status: 'available',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      itemId: '2',
      name: 'Monitor - Samsung 24"',
      description: '24-inch LED monitor with Full HD resolution',
      model: 'S24F350',
      serialNumber: 'SAM001',
      manufacturer: 'Samsung',
      categoryId: 'cat2',
      storeId: 'store1',
      quantity: 8,
      minStockLevel: 3,
      maxStockLevel: 15,
      status: 'available',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      itemId: '3',
      name: 'Mouse - Logitech MX Master',
      description: 'Wireless mouse with advanced features',
      model: 'MX Master 3',
      serialNumber: 'LOG001',
      manufacturer: 'Logitech',
      categoryId: 'cat3',
      storeId: 'store1',
      quantity: 12,
      minStockLevel: 5,
      maxStockLevel: 20,
      status: 'available',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const myReports: DamageReport[] = [
    {
      damageId: '1',
      itemId: '1',
      reportedBy: 'user1',
      description: 'Screen has a crack in the corner',
      severity: 'High',
      status: 'Pending',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      damageId: '2',
      itemId: '3',
      reportedBy: 'user1',
      description: 'Left click button not working properly',
      severity: 'Medium',
      status: 'In Progress',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12',
    },
  ];

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // API call to submit damage report
      console.log('Damage report:', values);
      
      message.success('Damage report submitted successfully!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to submit damage report');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'High':
        return 'error';
      case 'Critical':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'In Progress':
        return 'processing';
      case 'Fixed':
        return 'success';
      case 'Discarded':
        return 'default';
      default:
        return 'default';
    }
  };

  const reportColumns: ColumnsType<DamageReport> = [
    {
      title: 'Item',
      key: 'item',
      render: (_, record) => {
        const item = availableItems.find(i => i.itemId === record.itemId);
        return (
          <div>
            <Text strong>{item?.name}</Text>
            {item?.model && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Model: {item.model}
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Reported Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            // Show report details
            console.log('View report:', record);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Report Damage
        </Title>
        <Text type="secondary">
          Report damaged items to help maintain inventory quality
        </Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Report Form */}
        <Card title="Submit Damage Report" icon={<ExclamationCircleOutlined />}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="itemId"
              label="Select Item"
              rules={[{ required: true, message: 'Please select an item' }]}
            >
              <Select
                placeholder="Choose the damaged item"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {availableItems.map(item => (
                  <Option key={item.itemId} value={item.itemId}>
                    {item.name} - {item.model}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="severity"
              label="Damage Severity"
              rules={[{ required: true, message: 'Please select severity level' }]}
            >
              <Select placeholder="Select severity level">
                <Option value="Low">
                  <Tag color="success">Low</Tag> - Minor cosmetic damage
                </Option>
                <Option value="Medium">
                  <Tag color="warning">Medium</Tag> - Functional but noticeable damage
                </Option>
                <Option value="High">
                  <Tag color="error">High</Tag> - Significant functional impact
                </Option>
                <Option value="Critical">
                  <Tag color="red">Critical</Tag> - Item unusable or dangerous
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Damage Description"
              rules={[
                { required: true, message: 'Please describe the damage' },
                { min: 10, message: 'Description must be at least 10 characters' },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Provide a detailed description of the damage, including when and how it occurred..."
              />
            </Form.Item>

            <Form.Item
              name="location"
              label="Location of Damage"
            >
              <Input placeholder="Where was the item when damaged? (optional)" />
            </Form.Item>

            <Form.Item
              name="additionalInfo"
              label="Additional Information"
            >
              <TextArea
                rows={2}
                placeholder="Any additional information that might help with repair or replacement..."
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<FileTextOutlined />}
                size="large"
              >
                Submit Report
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* My Reports */}
        <Card title="My Damage Reports" icon={<FileTextOutlined />}>
          {myReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
              <ExclamationCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <div>No damage reports submitted yet</div>
            </div>
          ) : (
            <Table
              columns={reportColumns}
              dataSource={myReports}
              rowKey="damageId"
              pagination={false}
              size="small"
            />
          )}
        </Card>
      </div>

      {/* Guidelines */}
      <Card title="Reporting Guidelines" style={{ marginTop: 24 }}>
        <Space direction="vertical" size="small">
          <Text>
            <Text strong>• Be specific:</Text> Provide detailed descriptions of the damage
          </Text>
          <Text>
            <Text strong>• Include context:</Text> Mention when and how the damage occurred
          </Text>
          <Text>
            <Text strong>• Report promptly:</Text> Submit reports as soon as damage is noticed
          </Text>
          <Text>
            <Text strong>• Take photos:</Text> If possible, include photos with your report
          </Text>
          <Text>
            <Text strong>• Safety first:</Text> If the item poses a safety risk, report it immediately
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default DamageReport;
