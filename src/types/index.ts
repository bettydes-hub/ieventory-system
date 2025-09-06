// User Types
export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'Admin' | 'Employee' | 'Delivery Staff';
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Item Types
export interface Item {
  itemId: string;
  name: string;
  description?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  categoryId: string;
  storeId: string;
  supplierId?: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  status: 'available' | 'maintenance' | 'damaged' | 'retired';
  image?: string;
  notes?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  name: string;
  description?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  categoryId: string;
  storeId: string;
  supplierId?: string;
  quantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  status?: string;
  image?: string;
  notes?: string;
}

// Category Types
export interface Category {
  categoryId: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

// Store Types
export interface Store {
  storeId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Supplier Types
export interface Supplier {
  supplierId: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  transactionId: string;
  type: 'Borrow' | 'Return' | 'Transfer' | 'Purchase' | 'Sale';
  itemId: string;
  fromStoreId?: string;
  toStoreId?: string;
  userId: string;
  quantity: number;
  dueDate?: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Overdue' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Damage Report Types
export interface DamageReport {
  damageId: string;
  itemId: string;
  reportedBy: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Fixed' | 'Discarded';
  estimatedCost?: number;
  actualCost?: number;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Delivery Types
export interface Delivery {
  deliveryId: string;
  transactionId: string;
  assignedTo: string;
  status: 'Assigned' | 'Picked Up' | 'In Progress' | 'Completed' | 'Cancelled';
  pickupAddress: string;
  deliveryAddress: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Maintenance Types
export interface Maintenance {
  maintenanceId: string;
  itemId: string;
  type: 'Preventive' | 'Corrective' | 'Emergency';
  description: string;
  scheduledDate?: string;
  completedDate?: string;
  performedBy?: string;
  cost?: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Audit Types
export interface AuditLog {
  auditId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Search Types
export interface SearchResult {
  type: 'item' | 'category' | 'store' | 'supplier' | 'transaction' | 'delivery';
  id: string;
  title: string;
  description?: string;
  metadata?: any;
}

export interface SearchFilters {
  query?: string;
  type?: string[];
  categoryId?: string;
  storeId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalItems: number;
  totalStores: number;
  totalSuppliers: number;
  lowStockItems: number;
  pendingTransactions: number;
  overdueReturns: number;
  pendingDeliveries: number;
  recentActivity: any[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'file';
  required?: boolean;
  options?: { label: string; value: any }[];
  placeholder?: string;
  rules?: any[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
}
