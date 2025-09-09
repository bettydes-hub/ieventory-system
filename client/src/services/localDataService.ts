import { Item } from '@/types';

// Local data sources - these would normally come from your backend/database
export const localUsers = [
  { id: '1', name: 'John Employee', email: 'employee@inventory.com', role: 'Employee' },
  { id: '2', name: 'Jane StoreKeeper', email: 'storekeeper@inventory.com', role: 'Store Keeper' },
  { id: '3', name: 'Bob Manager', email: 'admin@inventory.com', role: 'Admin' },
  { id: '4', name: 'Alice Delivery', email: 'delivery@inventory.com', role: 'Delivery Staff' },
];

export const localItems: Item[] = [
  {
    itemId: '1',
    name: 'Laptop - Dell XPS 13',
    description: 'High-performance laptop for development work with 13.4" 4K display, Intel i7 processor, 16GB RAM, and 512GB SSD storage. Perfect for software development and design work.',
    model: 'XPS 13 9320',
    serialNumber: 'DLX001',
    manufacturer: 'Dell',
    categoryId: 'cat1',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    specifications: {
      brand: 'Dell',
      model: 'XPS 13 9320',
      serialNumber: 'DLX001',
      purchaseDate: '2024-01-15',
      warrantyExpiry: '2027-01-15',
      condition: 'Excellent'
    },
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
    description: '24-inch LED monitor with Full HD resolution, 1920x1080 pixels, 60Hz refresh rate, and excellent color accuracy. Perfect for office work and multimedia consumption.',
    model: 'S24F350',
    serialNumber: 'SAM001',
    manufacturer: 'Samsung',
    categoryId: 'cat2',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
    specifications: {
      brand: 'Samsung',
      model: 'S24F350',
      serialNumber: 'SAM001',
      purchaseDate: '2024-01-10',
      warrantyExpiry: '2026-01-10',
      condition: 'Good'
    },
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
    description: 'Wireless ergonomic mouse with advanced tracking, customizable buttons, and long battery life. Perfect for productivity and design work.',
    model: 'MX Master 3',
    serialNumber: 'LOG001',
    manufacturer: 'Logitech',
    categoryId: 'cat3',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
    specifications: {
      brand: 'Logitech',
      model: 'MX Master 3',
      serialNumber: 'LOG001',
      purchaseDate: '2024-01-05',
      warrantyExpiry: '2025-01-05',
      condition: 'Excellent'
    },
    storeId: 'store1',
    quantity: 12,
    minStockLevel: 5,
    maxStockLevel: 20,
    status: 'available',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    itemId: '4',
    name: 'Keyboard - Mechanical',
    description: 'Mechanical keyboard with Cherry MX switches, RGB backlighting, and programmable keys. Ideal for coding and gaming.',
    model: 'Corsair K95',
    serialNumber: 'COR001',
    manufacturer: 'Corsair',
    categoryId: 'cat3',
    imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop',
    specifications: {
      brand: 'Corsair',
      model: 'K95 RGB Platinum',
      serialNumber: 'COR001',
      purchaseDate: '2024-01-12',
      warrantyExpiry: '2026-01-12',
      condition: 'Good'
    },
    storeId: 'store1',
    quantity: 3,
    minStockLevel: 2,
    maxStockLevel: 8,
    status: 'available',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

// Mock transactions/borrows data
export const localTransactions = [
  {
    id: '1',
    itemId: '1',
    userId: '1',
    type: 'borrow',
    status: 'active',
    borrowedAt: '2024-01-15',
    dueDate: '2024-01-22',
    returnedAt: null,
  },
  {
    id: '2',
    itemId: '2',
    userId: '2',
    type: 'borrow',
    status: 'active',
    borrowedAt: '2024-01-16',
    dueDate: '2024-01-23',
    returnedAt: null,
  },
  {
    id: '3',
    itemId: '3',
    userId: '1',
    type: 'borrow',
    status: 'returned',
    borrowedAt: '2024-01-10',
    dueDate: '2024-01-17',
    returnedAt: '2024-01-17',
  },
];

// Mock delivery data
export const localDeliveries = [
  {
    id: '1',
    itemId: '1',
    fromStore: 'Main Store',
    toStore: 'Branch Store A',
    status: 'pending',
    assignedTo: '4',
    scheduledDate: '2024-01-20',
  },
  {
    id: '2',
    itemId: '2',
    fromStore: 'Branch Store B',
    toStore: 'Main Store',
    status: 'in_progress',
    assignedTo: '4',
    scheduledDate: '2024-01-19',
  },
];

// Mock requests data
export const localRequests = [
  {
    id: '1',
    itemId: '1',
    userId: '1',
    status: 'pending',
    requestedAt: '2024-01-18',
    type: 'borrow',
  },
  {
    id: '2',
    itemId: '3',
    userId: '2',
    status: 'pending',
    requestedAt: '2024-01-17',
    type: 'borrow',
  },
];

// Mock damage reports
export const localDamageReports = [
  {
    id: '1',
    itemId: '4',
    userId: '1',
    description: 'Key stuck, needs repair',
    status: 'reported',
    reportedAt: '2024-01-16',
  },
];

// Calculate dashboard statistics from local data
export const calculateDashboardStats = () => {
  const totalUsers = localUsers.length;
  const totalItems = localItems.length;
  const activeBorrowed = localTransactions.filter(t => t.status === 'active').length;
  const pendingDeliveries = localDeliveries.filter(d => d.status === 'pending').length;
  const damagedItems = localDamageReports.filter(d => d.status === 'reported').length;
  const lowStockItems = localItems.filter(item => item.quantity <= item.minStockLevel).length;
  const pendingRequests = localRequests.filter(r => r.status === 'pending').length;
  const completedDeliveries = localDeliveries.filter(d => d.status === 'completed').length;
  
  // Calculate categories
  const categories = [...new Set(localItems.map(item => item.categoryId))];
  const totalCategories = categories.length;
  
  // Calculate stores
  const stores = [...new Set(localItems.map(item => item.storeId))];
  const totalStores = stores.length;
  
  // Calculate suppliers (manufacturers)
  const suppliers = [...new Set(localItems.map(item => item.manufacturer))];
  const totalSuppliers = suppliers.length;
  
  // Calculate monthly stats (mock data for trends)
  const monthlyBorrows = localTransactions.filter(t => 
    t.borrowedAt && new Date(t.borrowedAt).getMonth() === new Date().getMonth()
  ).length;
  
  const monthlyReturns = localTransactions.filter(t => 
    t.returnedAt && new Date(t.returnedAt).getMonth() === new Date().getMonth()
  ).length;

  return {
    totalUsers,
    totalItems,
    activeBorrowed,
    pendingDeliveries,
    damagedItems,
    lowStockItems,
    totalCategories,
    totalStores,
    totalSuppliers,
    pendingRequests,
    completedDeliveries,
    monthlyBorrows,
    monthlyReturns,
  };
};

// Calculate item categories distribution
export const calculateItemCategories = () => {
  const categoryCounts: { [key: string]: number } = {};
  
  localItems.forEach(item => {
    const categoryName = getCategoryName(item.categoryId);
    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
  });
  
  return Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
    color: getCategoryColor(name),
  }));
};

// Helper function to get category name
const getCategoryName = (categoryId: string): string => {
  const categoryMap: { [key: string]: string } = {
    'cat1': 'Laptops',
    'cat2': 'Monitors',
    'cat3': 'Accessories',
  };
  return categoryMap[categoryId] || 'Other';
};

// Helper function to get category color
const getCategoryColor = (categoryName: string): string => {
  const colorMap: { [key: string]: string } = {
    'Laptops': '#1890ff',
    'Monitors': '#52c41a',
    'Accessories': '#faad14',
    'Other': '#f5222d',
  };
  return colorMap[categoryName] || '#d9d9d9';
};

// Calculate monthly trends (mock data)
export const calculateMonthlyTrends = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    items: Math.floor(Math.random() * 10) + 1,
    users: Math.floor(Math.random() * 5) + 1,
    borrows: Math.floor(Math.random() * 8) + 1,
    returns: Math.floor(Math.random() * 6) + 1,
  }));
};

// Get recent activities
export const getRecentActivities = () => {
  const activities = [
    {
      id: '1',
      action: 'Item Borrowed',
      item: 'Laptop - Dell XPS 13',
      user: 'John Employee',
      timestamp: '2024-01-19 14:30',
      status: 'success',
    },
    {
      id: '2',
      action: 'Delivery Started',
      item: 'Monitor - Samsung 24"',
      user: 'Alice Delivery',
      timestamp: '2024-01-19 10:15',
      status: 'info',
    },
    {
      id: '3',
      action: 'Item Returned',
      item: 'Mouse - Logitech MX Master',
      user: 'John Employee',
      timestamp: '2024-01-19 09:00',
      status: 'success',
    },
    {
      id: '4',
      action: 'Damage Reported',
      item: 'Keyboard - Mechanical',
      user: 'John Employee',
      timestamp: '2024-01-18 16:45',
      status: 'warning',
    },
  ];
  
  return activities;
};

// Get low stock alerts
export const getLowStockAlerts = () => {
  return localItems
    .filter(item => item.quantity <= item.minStockLevel)
    .map(item => ({
      id: item.itemId,
      name: item.name,
      currentStock: item.quantity,
      minStock: item.minStockLevel,
      status: item.quantity === 0 ? 'out_of_stock' : 'low_stock',
    }));
};

// Get pending requests
export const getPendingRequests = () => {
  return localRequests
    .filter(request => request.status === 'pending')
    .map(request => {
      const item = localItems.find(i => i.itemId === request.itemId);
      const user = localUsers.find(u => u.id === request.userId);
      return {
        id: request.id,
        itemName: item?.name || 'Unknown Item',
        userName: user?.name || 'Unknown User',
        requestedAt: request.requestedAt,
        type: request.type,
      };
    });
};

// Get delivery statistics
export const getDeliveryStats = () => {
  const assigned = localDeliveries.filter(d => d.status === 'assigned').length;
  const inProgress = localDeliveries.filter(d => d.status === 'in_progress').length;
  const completed = localDeliveries.filter(d => d.status === 'completed').length;
  const pending = localDeliveries.filter(d => d.status === 'pending').length;
  
  return {
    assigned,
    inProgress,
    completed,
    pending,
  };
};
