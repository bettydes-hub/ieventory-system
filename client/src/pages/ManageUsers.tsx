import React, { useState } from 'react';
import { Table, Button, Input, Select, Card, Typography, Space, Tag, Modal, Form, message, Popconfirm, Avatar } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { brandColors } from '@/theme';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '@/types';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ManageUsers: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const [users, setUsers] = useState<User[]>([
    {
      userId: '1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'Employee',
      department: 'IT',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      userId: '2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'Store Keeper',
      department: 'Operations',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      userId: '3',
      name: 'Bob Johnson',
      email: 'bob@company.com',
      role: 'Admin',
      department: 'Management',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      userId: '4',
      name: 'Alice Brown',
      email: 'alice@company.com',
      role: 'Delivery Staff',
      department: 'Logistics',
      isActive: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ]);

  const departments = [
    'IT', 'Operations', 'Management', 'Logistics', 'HR', 'Finance'
  ];

  const roles = [
    'Admin', 'Store Keeper', 'Employee', 'Delivery Staff'
  ];

  const handleAdd = () => {
    setSelectedUser(null);
    setModalMode('add');
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setModalVisible(true);
    form.setFieldsValue(user);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setModalMode('view');
    setModalVisible(true);
    form.setFieldsValue(user);
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter(user => user.userId !== userId));
    message.success('User deleted successfully');
  };

  const handleToggleStatus = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.userId === userId
        ? { ...user, isActive: !user.isActive, updatedAt: new Date().toISOString() }
        : user
    );
    setUsers(updatedUsers);
    message.success('User status updated successfully');
  };

  const handleSubmit = async (values: any) => {
    try {
      if (modalMode === 'add') {
        const newUser: User = {
          userId: Date.now().toString(),
          ...values,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUsers([...users, newUser]);
        message.success('User added successfully');
      } else if (modalMode === 'edit' && selectedUser) {
        const updatedUsers = users.map(user =>
          user.userId === selectedUser.userId
            ? { ...user, ...values, updatedAt: new Date().toISOString() }
            : user
        );
        setUsers(updatedUsers);
        message.success('User updated successfully');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save user');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'red';
      case 'Store Keeper':
        return 'blue';
      case 'Employee':
        return 'green';
      case 'Delivery Staff':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <div>
            <Text strong>{record.name}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.email}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="text"
            onClick={() => handleToggleStatus(record.userId)}
            style={{ color: record.isActive ? brandColors.error : brandColors.success }}
          >
            {record.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.userId)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? user.isActive : !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: brandColors.primary }}>
          Manage Users
        </Title>
        <Text type="secondary">
          Add, edit, and manage system users and their permissions
        </Text>
      </div>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space wrap>
            <Search
              placeholder="Search users..."
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by role"
              allowClear
              style={{ width: 150 }}
              value={roleFilter}
              onChange={setRoleFilter}
            >
              {roles.map(role => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add User
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="userId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={`${modalMode === 'add' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} User`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={modalMode === 'view' ? [
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ] : null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={modalMode === 'view'}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select role' }]}
            >
              <Select placeholder="Select role">
                {roles.map(role => (
                  <Option key={role} value={role}>
                    {role}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: 'Please select department' }]}
            >
              <Select placeholder="Select department">
                {departments.map(dept => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {modalMode === 'add' && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          {modalMode === 'edit' && (
            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <Select placeholder="Select status">
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>
          )}

          {modalMode !== 'view' && (
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {modalMode === 'add' ? 'Add User' : 'Update User'}
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUsers;
