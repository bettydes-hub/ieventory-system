# Category & Supplier Controllers API Documentation

## Overview
This document covers the Category Controller and Supplier Controller APIs for the IEventory system, providing comprehensive item categorization and supplier management capabilities.

## Base URLs
```
/api/categories
/api/suppliers
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

# Category Controller API

## Endpoints

### 1. CRUD Operations

#### Get All Categories
```http
GET /api/categories
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description
- `parentId` (optional): Filter by parent category ID
- `isActive` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "categoryId": "uuid",
        "name": "Electronics",
        "description": "Electronic devices and components",
        "parentId": null,
        "isActive": true,
        "metadata": {},
        "itemCount": 150,
        "totalQuantity": 500,
        "lowStockItems": 5,
        "parent": null,
        "children": [...],
        "items": [...]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCategories": 50,
      "categoriesPerPage": 10
    }
  }
}
```

#### Get Category by ID
```http
GET /api/categories/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categoryId": "uuid",
    "name": "Electronics",
    "description": "Electronic devices and components",
    "parentId": null,
    "isActive": true,
    "metadata": {},
    "statistics": {
      "totalItems": 150,
      "totalQuantity": 500,
      "lowStockItems": 5,
      "outOfStockItems": 2,
      "itemsByStatus": [...],
      "itemsByStore": [...]
    },
    "parent": null,
    "children": [...],
    "items": [...]
  }
}
```

#### Create Category
```http
POST /api/categories
```

**Request Body:**
```json
{
  "name": "Smartphones",
  "description": "Mobile phones and accessories",
  "parentId": "electronics_category_uuid",
  "isActive": true,
  "metadata": {
    "color": "#007bff",
    "icon": "phone"
  }
}
```

#### Update Category
```http
PUT /api/categories/:id
```

#### Delete Category
```http
DELETE /api/categories/:id
```

### 2. Category-Based Filtering

#### Get Items by Category
```http
GET /api/categories/:categoryId/items
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, model, serial number, or manufacturer
- `store` (optional): Filter by store ID
- `status` (optional): Filter by status
- `lowStock` (optional): Filter low stock items (true/false)
- `sortBy` (optional): Sort field (default: 'name')
- `sortOrder` (optional): Sort order (default: 'ASC')
- `includeSubcategories` (optional): Include subcategory items (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "categoryId": "uuid",
      "name": "Electronics",
      "description": "Electronic devices and components"
    },
    "items": [
      {
        "itemId": "uuid",
        "name": "iPhone 15",
        "description": "Latest iPhone model",
        "model": "A3102",
        "serialNumber": "SN123456",
        "manufacturer": "Apple",
        "quantity": 50,
        "minStockLevel": 10,
        "maxStockLevel": 100,
        "status": "available",
        "categoryId": "uuid",
        "category": {
          "categoryId": "uuid",
          "name": "Electronics"
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

### 3. Category Hierarchy Management

#### Get Category Hierarchy
```http
GET /api/categories/hierarchy/tree
```

**Query Parameters:**
- `includeInactive` (optional): Include inactive categories (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "hierarchy": [
      {
        "categoryId": "uuid",
        "name": "Electronics",
        "description": "Electronic devices",
        "parentId": null,
        "isActive": true,
        "children": [
          {
            "categoryId": "uuid",
            "name": "Smartphones",
            "description": "Mobile phones",
            "parentId": "parent_uuid",
            "isActive": true,
            "children": []
          }
        ]
      }
    ],
    "totalCategories": 25
  }
}
```

#### Get Category Breadcrumb
```http
GET /api/categories/:categoryId/breadcrumb
```

**Response:**
```json
{
  "success": true,
  "data": {
    "breadcrumb": [
      {
        "categoryId": "uuid",
        "name": "Electronics"
      },
      {
        "categoryId": "uuid",
        "name": "Smartphones"
      },
      {
        "categoryId": "uuid",
        "name": "iPhone"
      }
    ]
  }
}
```

#### Move Category
```http
PATCH /api/categories/:id/move
```

**Request Body:**
```json
{
  "newParentId": "new_parent_uuid"
}
```

---

# Supplier Controller API

## Endpoints

### 1. CRUD Operations

#### Get All Suppliers
```http
GET /api/suppliers
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, contact, email, or phone
- `isActive` (optional): Filter by active status (true/false)
- `location` (optional): Filter by location/address

**Response:**
```json
{
  "success": true,
  "data": {
    "suppliers": [
      {
        "supplierId": "uuid",
        "name": "Tech Supply Co.",
        "contact": "John Smith",
        "email": "john@techsupply.com",
        "address": "123 Tech Street, City, State",
        "phone": "555-0123",
        "website": "https://techsupply.com",
        "taxId": "TAX123456",
        "paymentTerms": "Net 30",
        "creditLimit": 50000,
        "isActive": true,
        "notes": "Reliable supplier for electronics",
        "metrics": {
          "itemCount": 25,
          "totalQuantity": 500,
          "totalValue": 150000,
          "recentTransactions": 12
        },
        "items": [...]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalSuppliers": 50,
      "suppliersPerPage": 10
    }
  }
}
```

#### Get Supplier by ID
```http
GET /api/suppliers/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "supplierId": "uuid",
    "name": "Tech Supply Co.",
    "contact": "John Smith",
    "email": "john@techsupply.com",
    "address": "123 Tech Street, City, State",
    "phone": "555-0123",
    "website": "https://techsupply.com",
    "taxId": "TAX123456",
    "paymentTerms": "Net 30",
    "creditLimit": 50000,
    "isActive": true,
    "notes": "Reliable supplier for electronics",
    "performanceMetrics": {
      "totalItems": 25,
      "totalQuantity": 500,
      "totalValue": 150000,
      "lowStockItems": 3,
      "outOfStockItems": 1,
      "recentTransactions": 12,
      "averageDeliveryTime": 5,
      "itemsByCategory": [...],
      "itemsByStatus": [...]
    },
    "items": [...]
  }
}
```

#### Create Supplier
```http
POST /api/suppliers
```

**Request Body:**
```json
{
  "name": "New Supplier Co.",
  "contact": "Jane Doe",
  "email": "jane@newsupplier.com",
  "address": "456 Business Ave, City, State",
  "phone": "555-0456",
  "website": "https://newsupplier.com",
  "taxId": "TAX789012",
  "paymentTerms": "Net 15",
  "creditLimit": 25000,
  "isActive": true,
  "notes": "New supplier for office supplies"
}
```

#### Update Supplier
```http
PUT /api/suppliers/:id
```

#### Delete Supplier
```http
DELETE /api/suppliers/:id
```

### 2. Link Suppliers to Supplied Items

#### Link Supplier to Item
```http
POST /api/suppliers/link-item
```

**Request Body:**
```json
{
  "supplierId": "supplier_uuid",
  "itemId": "item_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Supplier linked to item successfully",
  "data": {
    "item": {
      "itemId": "uuid",
      "name": "iPhone 15",
      "supplierId": "supplier_uuid"
    },
    "supplier": {
      "supplierId": "uuid",
      "name": "Tech Supply Co.",
      "contact": "John Smith"
    }
  }
}
```

#### Unlink Supplier from Item
```http
DELETE /api/suppliers/unlink-item/:itemId
```

#### Get Items Supplied by Supplier
```http
GET /api/suppliers/:supplierId/items
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, model, serial number, or manufacturer
- `category` (optional): Filter by category ID
- `status` (optional): Filter by status
- `sortBy` (optional): Sort field (default: 'name')
- `sortOrder` (optional): Sort order (default: 'ASC')

### 3. Supplier Performance Tracking

#### Get Supplier Performance Report
```http
GET /api/suppliers/:supplierId/performance
```

**Query Parameters:**
- `period` (optional): Period in days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "supplier": {
      "supplierId": "uuid",
      "name": "Tech Supply Co.",
      "contact": "John Smith",
      "email": "john@techsupply.com"
    },
    "period": "30 days",
    "metrics": {
      "totalTransactions": 25,
      "totalValue": 75000,
      "averageOrderValue": 3000,
      "onTimeDeliveries": 20,
      "lateDeliveries": 5,
      "deliveryRate": 80,
      "itemsSupplied": 25,
      "categoriesSupplied": 5,
      "performanceScore": 85
    }
  }
}
```

#### Get Supplier Comparison Report
```http
POST /api/suppliers/comparison
```

**Request Body:**
```json
{
  "supplierIds": ["supplier1_uuid", "supplier2_uuid", "supplier3_uuid"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison": [
      {
        "supplier": {
          "supplierId": "uuid",
          "name": "Tech Supply Co.",
          "contact": "John Smith",
          "email": "john@techsupply.com"
        },
        "metrics": {
          "totalItems": 25,
          "totalQuantity": 500,
          "totalValue": 150000,
          "performanceScore": 85
        }
      }
    ],
    "summary": {
      "bestPerformer": {
        "supplierId": "uuid",
        "name": "Tech Supply Co."
      },
      "worstPerformer": {
        "supplierId": "uuid",
        "name": "Other Supplier"
      },
      "averageScore": 75,
      "totalSuppliers": 3
    }
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

### Category Controller
- **Admin**: Full access to all endpoints
- **Store Keeper**: Access to CRUD operations and hierarchy management
- **Employee**: Read-only access to categories and items

### Supplier Controller
- **Admin**: Full access to all endpoints
- **Store Keeper**: Access to CRUD operations, item linking, and performance tracking
- **Employee**: Read-only access to supplier information and items

## Features

### Category Controller Features
- **Item Categorization**: Complete CRUD operations for categories
- **Category-based Filtering**: Advanced filtering and search capabilities
- **Category Hierarchy Management**: Tree structure with parent-child relationships
- **Breadcrumb Navigation**: Path tracking through category hierarchy
- **Circular Reference Prevention**: Safety checks for hierarchy integrity

### Supplier Controller Features
- **Supplier & Maintenance Management**: Complete CRUD operations for suppliers
- **Link Suppliers to Supplied Items**: Item-supplier relationship management
- **Supplier Performance Tracking**: Comprehensive performance metrics and analytics
- **Comparison Reports**: Multi-supplier performance comparison
- **Delivery Tracking**: On-time delivery monitoring and scoring

### Advanced Features
- **Hierarchical Categories**: Support for unlimited category depth
- **Performance Scoring**: Automated supplier performance calculation
- **Audit Logging**: Complete audit trail for all operations
- **Pagination**: Efficient data loading for large datasets
- **Search & Filtering**: Advanced search capabilities across all fields
