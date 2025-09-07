import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Typography,
  Tooltip,
  Popconfirm,
  message,
  Row,
  Col,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useInventory } from '@/hooks/useInventory';
import { Supplier } from '@/types';
import { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;

const Suppliers: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const {
    suppliers,
    suppliersLoading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    isCreatingSupplier,
    isUpdatingSupplier,
    isDeletingSupplier,
  } = useInventory();

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.setFieldsValue(supplier);
    setIsModalVisible(true);
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      await deleteSupplier(supplierId);
      message.success('Supplier deleted successfully');
    } catch (error) {
      message.error('Failed to delete supplier');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingSupplier) {
        await updateSupplier(editingSupplier.supplierId, values);
        message.success('Supplier updated successfully');
      } else {
        await createSupplier(values);
        message.success('Supplier created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save supplier');
    }
  };

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.contactPerson && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Contact: {record.contactPerson}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          {record.email && <div>✉️ {record.email}</div>}
          {record.phone && <div>📞 {record.phone}</div>}
          {record.website && <div>🌐 {record.website}</div>}
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <div>
          {record.address && <div>{record.address}</div>}
          {record.city && record.state && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.city}, {record.state} {record.zipCode}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <span style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEditSupplier(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this supplier?"
            onConfirm={() => handleDeleteSupplier(record.supplierId)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
                loading={isDeletingSupplier}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchText.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Supplier Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddSupplier}
          loading={isCreatingSupplier}
        >
          Add Supplier
        </Button>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search suppliers..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
        />
      </Card>

      {/* Suppliers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          loading={suppliersLoading}
          rowKey="supplierId"
          pagination={{
            total: filteredSuppliers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} suppliers`,
          }}
        />
      </Card>

      {/* Add/Edit Supplier Modal */}
      <Modal
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        confirmLoading={isCreatingSupplier || isUpdatingSupplier}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
          }}
        >
          <Form.Item
            name="name"
            label="Supplier Name"
            rules={[{ required: true, message: 'Please enter supplier name' }]}
          >
            <Input placeholder="Enter supplier name" />
          </Form.Item>

          <Form.Item
            name="contactPerson"
            label="Contact Person"
          >
            <Input placeholder="Enter contact person name" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Address"
          >
            <Input placeholder="Enter street address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label="City"
              >
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="state"
                label="State"
              >
                <Input placeholder="Enter state" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="zipCode"
                label="ZIP Code"
              >
                <Input placeholder="Enter ZIP code" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="country"
            label="Country"
          >
            <Input placeholder="Enter country" />
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
          >
            <Input placeholder="Enter website URL" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={3} placeholder="Enter additional notes" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Suppliers;