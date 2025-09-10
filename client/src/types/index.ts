export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  isActive?: boolean;
  isFirstLogin?: boolean;
  passwordChanged?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface BasecampLoginRequest {
  code: string;
  state?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Item {
  itemId: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  quantity: number;
  status: 'Available' | 'Borrowed' | 'Maintenance' | 'Damaged';
  location: string;
  storeId: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  imageUrl?: string;
  imageFile?: File;
  specifications?: {
    brand?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    condition?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  categoryId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Store {
  storeId: string;
  name: string;
  location: string;
  manager: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface Supplier {
  supplierId: string;
  name: string;
  contact: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  type: 'Borrow' | 'Return' | 'Transfer' | 'Purchase';
  itemId: string;
  item: Item;
  userId: string;
  user: User;
  quantity: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  notes?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DamageReport {
  id: string;
  damageId: string;
  itemId: string;
  item: Item;
  userId: string;
  user: User;
  reportedBy: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Under Review' | 'Resolved' | 'In Progress';
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  itemId: string;
  item: Item;
  fromStoreId: string;
  fromStore: Store;
  toStoreId: string;
  toStore: Store;
  assignedTo: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Employee-specific Types
export interface BorrowRequest {
  requestId: string;
  itemId: string;
  userId: string;
  quantity: number;
  reason: string;
  dueDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowedItem {
  borrowId: string;
  itemId: string;
  item: Item;
  userId: string;
  quantity: number;
  borrowDate: string;
  dueDate: string;
  status: 'Active' | 'Overdue' | 'Returned';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDamageReportData {
  itemId: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface CreateItemData {
  name: string;
  description: string;
  category: string;
  quantity: number;
  status: 'Available' | 'Borrowed' | 'Maintenance' | 'Damaged';
  location: string;
  imageUrl?: string;
  specifications?: {
    brand?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    condition?: string;
  };
}

export interface UpdateItemData {
  name?: string;
  description?: string;
  category?: string;
  quantity?: number;
  status?: 'Available' | 'Borrowed' | 'Maintenance' | 'Damaged';
  location?: string;
  imageUrl?: string;
  specifications?: {
    brand?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    condition?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLog {
  id: string;
  auditId: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  user: User;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  timestamp: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SearchResult {
  id: string;
  type: 'item' | 'user' | 'transaction' | 'store' | 'supplier';
  title: string;
  description: string;
  metadata: Record<string, any>;
  score: number;
}

export interface SearchFilters {
  type?: string;
  category?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface DashboardStats {
  totalItems: number;
  totalStores: number;
  totalSuppliers: number;
  lowStockItems: number;
  availableItems: number;
  borrowedItems: number;
  damagedItems: number;
  overdueReturns?: number;
  approvedRequests?: number;
}