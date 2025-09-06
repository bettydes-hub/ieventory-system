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
  ShopOutlined,
} from '@ant-design/icons';
import { useInventory } from '@/hooks/useInventory';
import { Store } from '@/types';
import { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;

const Stores: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const {
    stores,
    storesLoading,
    createStore,
    updateStore,
    deleteStore,
    isCreatingStore,
    isUpdatingStore,
    isDeletingStore,
  } = useInventory();

  const handleAddStore = () => {
    setEditingStore(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    form.setFieldsValue(store);
    setIsModalVisible(true);
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      await deleteStore(storeId);
      message.success('Store deleted successfully');
    } catch (error) {
      message.error('Failed to delete store');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingStore) {
        await updateStore(editingStore.storeId, values);
        message.success('Store updated successfully');
      } else {
        await createStore(values);
        message.success('Store created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save store');
    }
  };

  const columns: ColumnsType<Store> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.city}, {record.state}
          </div>
        </div>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.zipCode}, {record.country}
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          {record.phone && <div>📞 {record.phone}</div>}
          {record.email && <div>✉️ {record.email}</div>}
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
              onClick={() => handleEditStore(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this store?"
            onConfirm={() => handleDeleteStore(record.storeId)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
                loading={isDeletingStore}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchText.toLowerCase()) ||
    store.city.toLowerCase().includes(searchText.toLowerCase()) ||
    store.address.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Store Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddStore}
          loading={isCreatingStore}
        >
          Add Store
        </Button>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search stores..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
        />
      </Card>

      {/* Stores Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredStores}
          loading={storesLoading}
          rowKey="storeId"
          pagination={{
            total: filteredStores.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} stores`,
          }}
        />
      </Card>

      {/* Add/Edit Store Modal */}
      <Modal
        title={editingStore ? 'Edit Store' : 'Add New Store'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        confirmLoading={isCreatingStore || isUpdatingStore}
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
            label="Store Name"
            rules={[{ required: true, message: 'Please enter store name' }]}
          >
            <Input placeholder="Enter store name" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input placeholder="Enter street address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please enter state' }]}
              >
                <Input placeholder="Enter state" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="zipCode"
                label="ZIP Code"
                rules={[{ required: true, message: 'Please enter ZIP code' }]}
              >
                <Input placeholder="Enter ZIP code" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please enter country' }]}
              >
                <Input placeholder="Enter country" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
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
          </Row>

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

export default Stores;