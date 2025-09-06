import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  List,
  Tag,
  Tabs,
  Row,
  Col,
  Select,
  DatePicker,
  message,
} from 'antd';
import {
  SearchOutlined,
  InboxOutlined,
  SwapOutlined,
  TruckOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { SearchResult } from '@/types';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: [] as string[],
    categoryId: '',
    storeId: '',
    dateRange: null as any,
  });

  // Mock search results - replace with actual API calls
  const mockResults: SearchResult[] = [
    {
      type: 'item',
      id: '1',
      title: 'Laptop Dell XPS 13',
      description: 'High-performance laptop for development',
      metadata: { status: 'available', quantity: 5 },
    },
    {
      type: 'transaction',
      id: '1',
      title: 'Borrow Transaction #123',
      description: 'John Doe borrowed Laptop Dell XPS 13',
      metadata: { status: 'pending', date: '2024-01-01' },
    },
    {
      type: 'delivery',
      id: '1',
      title: 'Delivery #456',
      description: 'Transfer from Store A to Store B',
      metadata: { status: 'in_progress', assignedTo: 'Jane Smith' },
    },
  ];

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      message.warning('Please enter a search term');
      return;
    }

    setLoading(true);
    setSearchQuery(query);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSearchResults(mockResults);
    } catch (error) {
      message.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'item':
        return <InboxOutlined style={{ color: '#1890ff' }} />;
      case 'transaction':
        return <SwapOutlined style={{ color: '#52c41a' }} />;
      case 'delivery':
        return <TruckOutlined style={{ color: '#faad14' }} />;
      case 'damage':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'category':
        return <AppstoreOutlined style={{ color: '#722ed1' }} />;
      case 'store':
        return <ShopOutlined style={{ color: '#13c2c2' }} />;
      case 'supplier':
        return <TeamOutlined style={{ color: '#eb2f96' }} />;
      default:
        return <SearchOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'item':
        return 'blue';
      case 'transaction':
        return 'green';
      case 'delivery':
        return 'orange';
      case 'damage':
        return 'red';
      case 'category':
        return 'purple';
      case 'store':
        return 'cyan';
      case 'supplier':
        return 'magenta';
      default:
        return 'default';
    }
  };

  const renderSearchResult = (result: SearchResult) => (
    <List.Item>
      <List.Item.Meta
        avatar={getTypeIcon(result.type)}
        title={
          <Space>
            <span>{result.title}</span>
            <Tag color={getTypeColor(result.type)}>
              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
            </Tag>
          </Space>
        }
        description={
          <div>
            <div>{result.description}</div>
            {result.metadata && (
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                {Object.entries(result.metadata).map(([key, value]) => (
                  <Tag key={key} size="small">
                    {key}: {value}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        }
      />
    </List.Item>
  );

  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Advanced Search
        </Title>
        <Typography.Text type="secondary">
          Search across all inventory data with advanced filters
        </Typography.Text>
      </div>

      {/* Search Bar */}
      <Card style={{ marginBottom: 24 }}>
        <Search
          placeholder="Search items, transactions, deliveries, and more..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          enterButton={
            <Button type="primary" icon={<SearchOutlined />} loading={loading}>
              Search
            </Button>
          }
          size="large"
        />
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              mode="multiple"
              placeholder="Filter by type"
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="item">Items</Option>
              <Option value="transaction">Transactions</Option>
              <Option value="delivery">Deliveries</Option>
              <Option value="damage">Damage Reports</Option>
              <Option value="category">Categories</Option>
              <Option value="store">Stores</Option>
              <Option value="supplier">Suppliers</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by category"
              value={filters.categoryId}
              onChange={(value) => setFilters({ ...filters, categoryId: value })}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="1">Electronics</Option>
              <Option value="2">Furniture</Option>
              <Option value="3">Office Supplies</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by store"
              value={filters.storeId}
              onChange={(value) => setFilters({ ...filters, storeId: value })}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="1">Store A</Option>
              <Option value="2">Store B</Option>
              <Option value="3">Store C</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <Tabs defaultActiveKey="all">
            <TabPane tab={`All Results (${searchResults.length})`} key="all">
              <List
                dataSource={searchResults}
                renderItem={renderSearchResult}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} results`,
                }}
              />
            </TabPane>
            {Object.entries(groupedResults).map(([type, results]) => (
              <TabPane 
                tab={`${type.charAt(0).toUpperCase() + type.slice(1)} (${results.length})`} 
                key={type}
              >
                <List
                  dataSource={results}
                  renderItem={renderSearchResult}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} of ${total} results`,
                  }}
                />
              </TabPane>
            ))}
          </Tabs>
        </Card>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <SearchOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} type="secondary">
              No results found for "{searchQuery}"
            </Title>
            <Typography.Text type="secondary">
              Try adjusting your search terms or filters
            </Typography.Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;