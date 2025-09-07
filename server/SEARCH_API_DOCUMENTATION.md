# Search Controller API Documentation

## Overview
The Search Controller provides comprehensive search and filtering capabilities for the IEventory system, including advanced search functionality, multi-criteria filtering, full-text search, and cross-entity search across items, transactions, deliveries, and other entities.

## Base URL
```
/api/search
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Advanced Search Functionality

#### Global Search
```http
GET /api/search/global
```

**Query Parameters:**
- `query` (required): Search term (minimum 2 characters)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `entities` (optional): Comma-separated list of entities to search (default: all)
  - Available: `items`, `transactions`, `deliveries`, `users`, `stores`, `categories`, `suppliers`, `maintenance`, `damages`
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "laptop",
    "results": {
      "items": [
        {
          "itemId": "uuid",
          "name": "Dell Laptop XPS 13",
          "model": "XPS 13",
          "serialNumber": "SN123456",
          "manufacturer": "Dell",
          "quantity": 5,
          "status": "available",
          "category": {
            "categoryId": "uuid",
            "name": "Electronics"
          },
          "store": {
            "storeId": "uuid",
            "name": "Main Store",
            "location": "New York"
          },
          "supplier": {
            "supplierId": "uuid",
            "name": "Tech Supply Co."
          }
        }
      ],
      "transactions": [
        {
          "transactionId": "uuid",
          "transactionType": "borrow",
          "status": "approved",
          "notes": "Laptop for project work",
          "borrower": {
            "userId": "uuid",
            "name": "John Smith",
            "email": "john@example.com"
          },
          "item": {
            "itemId": "uuid",
            "name": "Dell Laptop XPS 13"
          }
        }
      ]
    },
    "totalResults": {
      "items": 15,
      "transactions": 8,
      "deliveries": 3,
      "users": 2,
      "stores": 1,
      "categories": 1,
      "suppliers": 1,
      "maintenance": 0,
      "damages": 0
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalResults": 31,
      "resultsPerPage": 10
    }
  }
}
```

### 2. Multi-Criteria Filtering

#### Search Items
```http
GET /api/search/items
```

**Query Parameters:**
- `query` (optional): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category ID
- `store` (optional): Filter by store ID
- `supplier` (optional): Filter by supplier ID
- `status` (optional): Filter by status
- `minQuantity` (optional): Minimum quantity
- `maxQuantity` (optional): Maximum quantity
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)
- `sortBy` (optional): Sort field (default: 'name')
- `sortOrder` (optional): Sort order (default: 'ASC')

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "itemId": "uuid",
        "name": "Dell Laptop XPS 13",
        "description": "High-performance laptop",
        "model": "XPS 13",
        "serialNumber": "SN123456",
        "manufacturer": "Dell",
        "quantity": 5,
        "minStockLevel": 2,
        "maxStockLevel": 20,
        "purchasePrice": 1200.00,
        "status": "available",
        "category": {
          "categoryId": "uuid",
          "name": "Electronics",
          "description": "Electronic devices"
        },
        "store": {
          "storeId": "uuid",
          "name": "Main Store",
          "location": "New York"
        },
        "supplier": {
          "supplierId": "uuid",
          "name": "Tech Supply Co.",
          "contact": "John Smith"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    },
    "filters": {
      "query": "laptop",
      "category": "electronics_uuid",
      "store": "main_store_uuid",
      "status": "available",
      "minQuantity": "1",
      "maxQuantity": "10",
      "minPrice": "500",
      "maxPrice": "2000"
    }
  }
}
```

#### Search Transactions
```http
GET /api/search/transactions
```

**Query Parameters:**
- `query` (optional): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `transactionType` (optional): Filter by transaction type
- `status` (optional): Filter by status
- `borrower` (optional): Filter by borrower ID
- `approver` (optional): Filter by approver ID
- `store` (optional): Filter by store ID
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)
- `minAmount` (optional): Minimum amount
- `maxAmount` (optional): Maximum amount
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): Sort order (default: 'DESC')

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transactionId": "uuid",
        "transactionType": "borrow",
        "status": "approved",
        "amount": 0.00,
        "notes": "Laptop for project work",
        "purpose": "Development work",
        "borrower": {
          "userId": "uuid",
          "name": "John Smith",
          "email": "john@example.com",
          "role": "Employee"
        },
        "approver": {
          "userId": "uuid",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "role": "Store Keeper"
        },
        "item": {
          "itemId": "uuid",
          "name": "Dell Laptop XPS 13",
          "model": "XPS 13",
          "serialNumber": "SN123456"
        },
        "store": {
          "storeId": "uuid",
          "name": "Main Store",
          "location": "New York"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTransactions": 50,
      "transactionsPerPage": 10
    },
    "filters": {
      "query": "laptop",
      "transactionType": "borrow",
      "status": "approved",
      "borrower": "user_uuid",
      "dateFrom": "2024-01-01",
      "dateTo": "2024-01-31"
    }
  }
}
```

#### Search Deliveries
```http
GET /api/search/deliveries
```

**Query Parameters:**
- `query` (optional): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `deliveryType` (optional): Filter by delivery type
- `assignedTo` (optional): Filter by assigned user ID
- `fromStore` (optional): Filter by from store ID
- `toStore` (optional): Filter by to store ID
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): Sort order (default: 'DESC')

**Response:**
```json
{
  "success": true,
  "data": {
    "deliveries": [
      {
        "deliveryId": "uuid",
        "status": "in_transit",
        "deliveryType": "transfer",
        "trackingNumber": "TRK123456",
        "notes": "Laptop delivery to branch office",
        "assignedTo": {
          "userId": "uuid",
          "name": "Mike Johnson",
          "email": "mike@example.com",
          "role": "Delivery Staff"
        },
        "transaction": {
          "transactionId": "uuid",
          "transactionType": "transfer",
          "status": "approved"
        },
        "fromStore": {
          "storeId": "uuid",
          "name": "Main Store",
          "location": "New York"
        },
        "toStore": {
          "storeId": "uuid",
          "name": "Branch Office",
          "location": "Boston"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalDeliveries": 25,
      "deliveriesPerPage": 10
    },
    "filters": {
      "query": "laptop",
      "status": "in_transit",
      "deliveryType": "transfer",
      "assignedTo": "delivery_user_uuid"
    }
  }
}
```

### 3. Full-Text Search

#### Full-Text Search with Relevance
```http
GET /api/search/fulltext
```

**Query Parameters:**
- `query` (required): Search term (minimum 2 characters)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `entity` (optional): Entity to search (default: 'items')
- `fields` (optional): Comma-separated fields to search (default: 'name,description,model,manufacturer')
- `minScore` (optional): Minimum relevance score (default: 0.1)

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "dell laptop xps",
    "entity": "items",
    "results": [
      {
        "itemId": "uuid",
        "name": "Dell Laptop XPS 13",
        "description": "High-performance laptop for professionals",
        "model": "XPS 13",
        "manufacturer": "Dell",
        "quantity": 5,
        "status": "available",
        "relevanceScore": 0.95,
        "category": {
          "categoryId": "uuid",
          "name": "Electronics"
        },
        "store": {
          "storeId": "uuid",
          "name": "Main Store"
        }
      },
      {
        "itemId": "uuid",
        "name": "Dell Desktop XPS",
        "description": "Desktop computer with XPS design",
        "model": "XPS Desktop",
        "manufacturer": "Dell",
        "quantity": 3,
        "status": "available",
        "relevanceScore": 0.75,
        "category": {
          "categoryId": "uuid",
          "name": "Electronics"
        },
        "store": {
          "storeId": "uuid",
          "name": "Main Store"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalResults": 15,
      "resultsPerPage": 10
    },
    "searchConfig": {
      "fields": ["name", "description", "model", "manufacturer"],
      "minScore": 0.1
    }
  }
}
```

### 4. Cross-Entity Search

#### Search Across Multiple Entities with Relationships
```http
GET /api/search/cross-entity
```

**Query Parameters:**
- `query` (required): Search term (minimum 2 characters)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `includeRelations` (optional): Include related data (default: true)
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "laptop",
    "results": {
      "items": [
        {
          "itemId": "uuid",
          "name": "Dell Laptop XPS 13",
          "model": "XPS 13",
          "serialNumber": "SN123456",
          "manufacturer": "Dell",
          "category": {
            "categoryId": "uuid",
            "name": "Electronics"
          },
          "store": {
            "storeId": "uuid",
            "name": "Main Store",
            "location": "New York"
          },
          "supplier": {
            "supplierId": "uuid",
            "name": "Tech Supply Co."
          }
        }
      ],
      "transactions": [
        {
          "transactionId": "uuid",
          "transactionType": "borrow",
          "status": "approved",
          "notes": "Laptop for project work",
          "borrower": {
            "userId": "uuid",
            "name": "John Smith",
            "email": "john@example.com"
          },
          "item": {
            "itemId": "uuid",
            "name": "Dell Laptop XPS 13"
          }
        }
      ],
      "deliveries": [
        {
          "deliveryId": "uuid",
          "status": "in_transit",
          "deliveryType": "transfer",
          "trackingNumber": "TRK123456",
          "assignedTo": {
            "userId": "uuid",
            "name": "Mike Johnson",
            "email": "mike@example.com"
          },
          "transaction": {
            "transactionId": "uuid",
            "transactionType": "transfer"
          }
        }
      ],
      "relatedData": {
        "transactions": [
          {
            "transactionId": "uuid",
            "transactionType": "borrow",
            "status": "approved",
            "borrower": {
              "userId": "uuid",
              "name": "John Smith"
            }
          }
        ],
        "deliveries": [
          {
            "deliveryId": "uuid",
            "status": "completed",
            "assignedTo": {
              "userId": "uuid",
              "name": "Mike Johnson"
            }
          }
        ]
      }
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalResults": 25,
      "resultsPerPage": 10
    },
    "summary": {
      "itemsFound": 15,
      "transactionsFound": 8,
      "deliveriesFound": 2,
      "totalFound": 25
    }
  }
}
```

### 5. Search Suggestions & Autocomplete

#### Get Search Suggestions
```http
GET /api/search/suggestions
```

**Query Parameters:**
- `query` (required): Search term (minimum 1 character)
- `entity` (optional): Entity type (default: 'items')
  - Available: `items`, `users`, `stores`
- `limit` (optional): Maximum suggestions (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "dell",
    "entity": "items",
    "suggestions": [
      {
        "id": "uuid",
        "text": "Dell Laptop XPS 13",
        "subtitle": "XPS 13 - Dell",
        "type": "item"
      },
      {
        "id": "uuid",
        "text": "Dell Desktop XPS",
        "subtitle": "XPS Desktop - Dell",
        "type": "item"
      },
      {
        "id": "uuid",
        "text": "Dell Monitor 24\"",
        "subtitle": "P2419H - Dell",
        "type": "item"
      }
    ]
  }
}
```

### 6. Search Analytics

#### Get Search Analytics
```http
GET /api/search/analytics
```

**Query Parameters:**
- `period` (optional): Period in days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30 days",
    "analytics": {
      "totalSearches": 1250,
      "uniqueSearches": 890,
      "popularQueries": [
        { "query": "laptop", "count": 45 },
        { "query": "dell", "count": 32 },
        { "query": "maintenance", "count": 28 },
        { "query": "delivery", "count": 25 },
        { "query": "transaction", "count": 22 }
      ],
      "searchByEntity": [
        { "entity": "items", "count": 650 },
        { "entity": "transactions", "count": 320 },
        { "entity": "deliveries", "count": 180 },
        { "entity": "users", "count": 100 }
      ],
      "searchTrends": [
        { "date": "2024-01-01", "searches": 45 },
        { "date": "2024-01-02", "searches": 52 },
        { "date": "2024-01-03", "searches": 38 },
        { "date": "2024-01-04", "searches": 61 },
        { "date": "2024-01-05", "searches": 48 }
      ],
      "averageResultsPerSearch": 12.5,
      "zeroResultSearches": 45
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
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Role-Based Access Control

- **Admin**: Full access to all search endpoints and analytics
- **Store Keeper**: Access to all search functionality except analytics
- **Employee**: Access to search functionality for items, transactions, and deliveries

## Features

### Advanced Search Functionality
- **Global search** across all entities with customizable scope
- **Entity-specific search** with targeted results
- **Date range filtering** for time-based searches
- **Pagination** for large result sets

### Multi-Criteria Filtering
- **Advanced filtering** with multiple criteria combinations
- **Range filters** for quantities, prices, and dates
- **Entity relationship filtering** (category, store, supplier, etc.)
- **Flexible sorting** with multiple sort options

### Full-Text Search
- **Relevance scoring** for search results
- **Configurable search fields** for different entities
- **Minimum score filtering** for result quality
- **Ranked results** by relevance

### Cross-Entity Search
- **Relationship-aware search** across connected entities
- **Related data inclusion** for comprehensive results
- **Summary statistics** for search results
- **Contextual information** for better understanding

### Search Suggestions & Autocomplete
- **Real-time suggestions** for better user experience
- **Entity-specific autocomplete** for different search types
- **Subtitle information** for better context
- **Type identification** for result categorization

### Search Analytics
- **Search performance metrics** and trends
- **Popular query tracking** for insights
- **Entity search distribution** analysis
- **Zero-result search identification** for improvement

### Advanced Features
- **Case-insensitive search** with iLike operators
- **Partial matching** for flexible search terms
- **Relationship inclusion** for comprehensive results
- **Performance optimization** with pagination and limits
- **Error handling** with detailed error messages
- **Role-based access control** for security
