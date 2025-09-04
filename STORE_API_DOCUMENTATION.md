# Store Controller API Documentation

## Overview
The Store Controller provides comprehensive multi-store support for the IEventory system, including CRUD operations, store-to-store transfers, inventory management, and store configuration.

## Base URL
```
/api/stores
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. CRUD Operations

#### Get All Stores
```http
GET /api/stores
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, location, or description
- `location` (optional): Filter by location
- `status` (optional): Filter by status ('active' or 'inactive')

**Response:**
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "storeId": "uuid",
        "name": "Store Name",
        "location": "Location",
        "description": "Description",
        "address": "Address",
        "phone": "Phone",
        "email": "Email",
        "isActive": true,
        "settings": {},
        "inventorySummary": {
          "totalItems": 100,
          "totalQuantity": 500,
          "lowStockItems": 5,
          "outOfStockItems": 2
        },
        "storeKeepers": [...],
        "items": [...]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalStores": 50,
      "storesPerPage": 10
    }
  }
}
```

#### Get Store by ID
```http
GET /api/stores/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "storeId": "uuid",
    "name": "Store Name",
    "location": "Location",
    "description": "Description",
    "address": "Address",
    "phone": "Phone",
    "email": "Email",
    "isActive": true,
    "settings": {},
    "inventorySummary": {
      "summary": {
        "totalItems": 100,
        "totalQuantity": 500,
        "lowStockItems": 5,
        "outOfStockItems": 2
      },
      "itemsByCategory": [...],
      "itemsByStatus": [...],
      "recentTransactions": [...]
    },
    "storeKeepers": [...],
    "items": [...]
  }
}
```

#### Create Store
```http
POST /api/stores
```

**Request Body:**
```json
{
  "name": "New Store",
  "location": "New Location",
  "description": "Store Description",
  "address": "Store Address",
  "phone": "123-456-7890",
  "email": "store@example.com",
  "managerId": "manager_uuid",
  "isActive": true,
  "settings": {
    "autoReorder": true,
    "lowStockThreshold": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Store created successfully",
  "data": {
    "storeId": "uuid",
    "name": "New Store",
    "location": "New Location",
    "description": "Store Description",
    "address": "Store Address",
    "phone": "123-456-7890",
    "email": "store@example.com",
    "managerId": "manager_uuid",
    "isActive": true,
    "settings": {
      "autoReorder": true,
      "lowStockThreshold": 10
    }
  }
}
```

#### Update Store
```http
PUT /api/stores/:id
```

**Request Body:**
```json
{
  "name": "Updated Store Name",
  "location": "Updated Location",
  "description": "Updated Description",
  "address": "Updated Address",
  "phone": "123-456-7890",
  "email": "updated@example.com",
  "managerId": "new_manager_uuid",
  "isActive": true,
  "settings": {
    "autoReorder": false,
    "lowStockThreshold": 15
  }
}
```

#### Delete Store
```http
DELETE /api/stores/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Store deleted successfully"
}
```

### 2. Store-to-Store Transfers

#### Transfer Items Between Stores
```http
POST /api/stores/transfer
```

**Request Body:**
```json
{
  "itemId": "item_uuid",
  "fromStoreId": "source_store_uuid",
  "toStoreId": "destination_store_uuid",
  "quantity": 10,
  "reason": "Stock rebalancing",
  "notes": "Additional notes",
  "assignedTo": "delivery_staff_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Items transferred successfully between stores",
  "data": {
    "transaction": {
      "transactionId": "uuid",
      "itemId": "item_uuid",
      "fromStoreId": "source_store_uuid",
      "toStoreId": "destination_store_uuid",
      "userId": "user_uuid",
      "amount": 10,
      "transactionType": "transfer",
      "status": "completed",
      "notes": "Store-to-store transfer: Stock rebalancing. Additional notes",
      "assignedTo": "delivery_staff_uuid"
    },
    "item": {
      "itemId": "item_uuid",
      "name": "Item Name",
      "oldQuantity": 50,
      "newQuantity": 40,
      "fromStore": "Source Store",
      "toStore": "Destination Store"
    }
  }
}
```

#### Get Store Transfer History
```http
GET /api/stores/:storeId/transfers
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Transfer type ('all', 'outgoing', 'incoming')

**Response:**
```json
{
  "success": true,
  "data": {
    "store": {
      "storeId": "uuid",
      "name": "Store Name",
      "location": "Location"
    },
    "transfers": [
      {
        "transactionId": "uuid",
        "itemId": "item_uuid",
        "fromStoreId": "source_store_uuid",
        "toStoreId": "destination_store_uuid",
        "userId": "user_uuid",
        "amount": 10,
        "transactionType": "transfer",
        "status": "completed",
        "notes": "Transfer notes",
        "assignedTo": "delivery_staff_uuid",
        "item": {
          "itemId": "item_uuid",
          "name": "Item Name",
          "model": "Model"
        },
        "fromStore": {
          "storeId": "source_store_uuid",
          "name": "Source Store"
        },
        "toStore": {
          "storeId": "destination_store_uuid",
          "name": "Destination Store"
        },
        "user": {
          "userId": "user_uuid",
          "name": "User Name",
          "role": "Store Keeper"
        },
        "assignedUser": {
          "userId": "delivery_staff_uuid",
          "name": "Delivery Staff Name",
          "role": "Delivery Staff"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTransfers": 50,
      "transfersPerPage": 10
    }
  }
}
```

### 3. Store-Specific Inventory Views

#### Get Store Inventory
```http
GET /api/stores/:storeId/inventory
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, model, serial number, or manufacturer
- `category` (optional): Filter by category ID
- `status` (optional): Filter by status
- `lowStock` (optional): Filter low stock items (true/false)
- `sortBy` (optional): Sort field (default: 'name')
- `sortOrder` (optional): Sort order (default: 'ASC')

**Response:**
```json
{
  "success": true,
  "data": {
    "store": {
      "storeId": "uuid",
      "name": "Store Name",
      "location": "Location"
    },
    "items": [
      {
        "itemId": "uuid",
        "name": "Item Name",
        "description": "Description",
        "model": "Model",
        "serialNumber": "SN123456",
        "manufacturer": "Manufacturer",
        "quantity": 50,
        "minStockLevel": 10,
        "maxStockLevel": 100,
        "status": "available",
        "categoryId": "category_uuid",
        "storeId": "store_uuid",
        "category": {
          "categoryId": "category_uuid",
          "name": "Category Name"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

#### Get Store Performance Metrics
```http
GET /api/stores/:storeId/performance
```

**Query Parameters:**
- `period` (optional): Period in days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "store": {
      "storeId": "uuid",
      "name": "Store Name",
      "location": "Location"
    },
    "period": "30 days",
    "metrics": {
      "totalTransactions": 150,
      "outgoingTransfers": 25,
      "incomingTransfers": 30,
      "lowStockAlerts": 5,
      "itemsAdded": 100,
      "itemsRemoved": 80,
      "netFlow": 20
    }
  }
}
```

### 4. Store Management & Configuration

#### Get Store Configuration
```http
GET /api/stores/:id/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "store": {
      "storeId": "uuid",
      "name": "Store Name",
      "location": "Location",
      "description": "Description",
      "address": "Address",
      "phone": "123-456-7890",
      "email": "store@example.com",
      "isActive": true,
      "settings": {
        "autoReorder": true,
        "lowStockThreshold": 10,
        "notifications": {
          "email": true,
          "sms": false
        }
      },
      "manager": {
        "userId": "manager_uuid",
        "name": "Manager Name",
        "email": "manager@example.com",
        "role": "Store Keeper"
      }
    }
  }
}
```

#### Update Store Settings
```http
PATCH /api/stores/:id/settings
```

**Request Body:**
```json
{
  "settings": {
    "autoReorder": false,
    "lowStockThreshold": 15,
    "notifications": {
      "email": true,
      "sms": true
    },
    "workingHours": {
      "start": "09:00",
      "end": "17:00"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Store settings updated successfully",
  "data": {
    "storeId": "uuid",
    "settings": {
      "autoReorder": false,
      "lowStockThreshold": 15,
      "notifications": {
        "email": true,
        "sms": true
      },
      "workingHours": {
        "start": "09:00",
        "end": "17:00"
      }
    }
  }
}
```

#### Assign Store Manager
```http
PATCH /api/stores/:id/manager
```

**Request Body:**
```json
{
  "managerId": "new_manager_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Store manager assigned successfully",
  "data": {
    "store": {
      "storeId": "uuid",
      "name": "Store Name",
      "managerId": "new_manager_uuid"
    },
    "manager": {
      "userId": "new_manager_uuid",
      "name": "New Manager Name",
      "email": "newmanager@example.com"
    }
  }
}
```

#### Toggle Store Status
```http
PATCH /api/stores/:id/status
```

**Response:**
```json
{
  "success": true,
  "message": "Store activated successfully",
  "data": {
    "storeId": "uuid",
    "name": "Store Name",
    "isActive": true
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Role-Based Access Control

- **Admin**: Full access to all endpoints
- **Store Keeper**: Access to store management, inventory views, and transfers for assigned stores
- **Employee**: Read-only access to store information and inventory

## Features

### Multi-Store Support
- Complete CRUD operations for stores
- Store-specific inventory management
- Cross-store item transfers
- Store performance analytics

### Store Management
- Manager assignment and management
- Store configuration and settings
- Status management (active/inactive)
- Audit logging for all operations

### Inventory Integration
- Real-time inventory tracking per store
- Low stock alerts and management
- Category-based inventory views
- Transfer history and tracking

### Analytics & Reporting
- Store performance metrics
- Transfer analytics
- Inventory summaries
- Transaction history
