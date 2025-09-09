export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isFirstLogin?: boolean;
  passwordChanged?: boolean;
  createdAt?: string;
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
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  status: 'Available' | 'Borrowed' | 'Maintenance' | 'Damaged';
  location: string;
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
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  manager: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'Borrow' | 'Return' | 'Transfer' | 'Purchase';
  itemId: string;
  item: Item;
  userId: string;
  user: User;
  quantity: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DamageReport {
  id: string;
  itemId: string;
  item: Item;
  userId: string;
  user: User;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Under Review' | 'Resolved';
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