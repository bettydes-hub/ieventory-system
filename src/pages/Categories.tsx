import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Tree,
  Typography,
  Tooltip,
  Popconfirm,
  message,
  TreeSelect,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FolderOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { useInventory } from '@/hooks/useInventory';
import { Category } from '@/types';

const { Title } = Typography;
const { Search } = Input;

const Categories: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const {
    categories,
    categoriesLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreatingCategory,
    isUpdatingCategory,
    isDeletingCategory,
  } = useInventory();

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setIsModalVisible(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      message.success('Category deleted successfully');
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCategory) {
        await updateCategory(editingCategory.categoryId, values);
        message.success('Category updated successfully');
      } else {
        await createCategory(values);
        message.success('Category created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save category');
    }
  };

  const buildTreeData = (categories: Category[], parentId?: string): any[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        key: cat.categoryId,
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{cat.name}</span>
            <Space>
              <Tooltip title="Edit">
                <Button 
                  icon={<EditOutlined />} 
                  size="small" 
                  onClick={() => handleEditCategory(cat)}
                />
              </Tooltip>
              <Popconfirm
                title="Are you sure you want to delete this category?"
                onConfirm={() => handleDeleteCategory(cat.categoryId)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <Button 
                    icon={<DeleteOutlined />} 
                    size="small" 
                    danger
                    loading={isDeletingCategory}
                  />
                </Tooltip>
              </Popconfirm>
            </Space>
          </div>
        ),
        children: buildTreeData(categories, cat.categoryId),
        icon: <FolderOutlined />,
      }));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchText.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const treeData = buildTreeData(filteredCategories);

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Category Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddCategory}
          loading={isCreatingCategory}
        >
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search categories..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
        />
      </Card>

      {/* Categories Tree */}
      <Card>
        <Tree
          showIcon
          treeData={treeData}
          defaultExpandAll
          loading={categoriesLoading}
        />
      </Card>

      {/* Add/Edit Category Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isCreatingCategory || isUpdatingCategory}
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
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="Parent Category"
          >
            <TreeSelect
              placeholder="Select parent category (optional)"
              treeData={categories.map(cat => ({
                title: cat.name,
                value: cat.categoryId,
                key: cat.categoryId,
              }))}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter category description" />
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

export default Categories;