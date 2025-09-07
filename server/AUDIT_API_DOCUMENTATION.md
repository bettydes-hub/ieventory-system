# Audit Controller API Documentation

## Overview
The Audit Controller provides comprehensive audit logging, reporting, and data integrity monitoring capabilities for the inventory management system. It tracks all critical system actions and provides detailed reports for compliance and monitoring purposes.

## Features
- **Audit Log Viewing**: View and filter audit logs with advanced search capabilities
- **Report Generation**: Generate detailed reports for inventory, transactions, damages, and deliveries
- **System Activity Tracking**: Monitor recent system activity and user actions
- **Data Integrity Monitoring**: Perform integrity checks to ensure data consistency
- **Statistics & Analytics**: Get comprehensive audit statistics and insights

## Authentication
All endpoints require authentication and admin privileges.

## Endpoints

### 1. Get Audit Logs
**GET** `/api/audit/logs`

Retrieve audit logs with filtering and pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50)
- `actionType` (string, optional): Filter by action type
- `targetTable` (string, optional): Filter by target table
- `userId` (string, optional): Filter by user ID
- `startDate` (string, optional): Start date filter (ISO format)
- `endDate` (string, optional): End date filter (ISO format)
- `search` (string, optional): Search in action type, table, or target ID

**Response:**
```json
{
  "success": true,
  "data": {
    "auditLogs": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "action_type": "INSERT",
        "target_table": "items",
        "target_id": "uuid",
        "old_value": null,
        "new_value": {...},
        "timestamp": "2024-01-15T10:30:00Z",
        "User": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "role": "Admin"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalLogs": 500,
      "limit": 50
    }
  }
}
```

### 2. Get Specific Audit Log
**GET** `/api/audit/logs/:id`

Retrieve a specific audit log entry by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "action_type": "UPDATE",
    "target_table": "transactions",
    "target_id": "uuid",
    "old_value": {...},
    "new_value": {...},
    "timestamp": "2024-01-15T10:30:00Z",
    "User": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "Admin"
    }
  }
}
```

### 3. Get Recent Activity
**GET** `/api/audit/activity`

Get recent system activity within specified time period.

**Query Parameters:**
- `hours` (number, optional): Hours to look back (default: 24)
- `limit` (number, optional): Maximum results (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action_type": "BORROW",
      "target_table": "transactions",
      "timestamp": "2024-01-15T10:30:00Z",
      "User": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### 4. Get User Audit Logs
**GET** `/api/audit/user/:userId`

Get audit logs for a specific user.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `actionType` (string, optional): Filter by action type
- `startDate` (string, optional): Start date filter
- `endDate` (string, optional): End date filter

**Response:**
```json
{
  "success": true,
  "data": {
    "auditLogs": [...],
    "pagination": {...}
  }
}
```

### 5. Inventory Audit Report
**GET** `/api/audit/reports/inventory`

Generate comprehensive inventory audit report.

**Query Parameters:**
- `startDate` (string, optional): Report start date
- `endDate` (string, optional): Report end date
- `actionType` (string, optional): Filter by action type

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalActions": 150,
      "actionTypes": {
        "INSERT": 50,
        "UPDATE": 75,
        "DELETE": 25
      },
      "users": {
        "John Doe": 80,
        "Jane Smith": 70
      },
      "dateRange": {
        "start": "2024-01-01",
        "end": "2024-01-31"
      }
    },
    "auditLogs": [...]
  }
}
```

### 6. Transaction Audit Report
**GET** `/api/audit/reports/transactions`

Generate transaction audit report.

**Query Parameters:**
- `startDate` (string, optional): Report start date
- `endDate` (string, optional): Report end date
- `actionType` (string, optional): Filter by action type

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalActions": 200,
      "actionTypes": {
        "BORROW": 100,
        "RETURN": 80,
        "TRANSFER": 20
      },
      "users": {...},
      "dateRange": {...}
    },
    "auditLogs": [...]
  }
}
```

### 7. Damage Audit Report
**GET** `/api/audit/reports/damages`

Generate damage audit report.

**Query Parameters:**
- `startDate` (string, optional): Report start date
- `endDate` (string, optional): Report end date
- `actionType` (string, optional): Filter by action type

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalActions": 25,
      "actionTypes": {
        "DAMAGE_REPORT": 20,
        "UPDATE": 5
      },
      "users": {...},
      "dateRange": {...}
    },
    "auditLogs": [...]
  }
}
```

### 8. Delivery Audit Report
**GET** `/api/audit/reports/deliveries`

Generate delivery audit report.

**Query Parameters:**
- `startDate` (string, optional): Report start date
- `endDate` (string, optional): Report end date
- `actionType` (string, optional): Filter by action type

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalActions": 75,
      "actionTypes": {
        "DELIVERY_UPDATE": 60,
        "INSERT": 15
      },
      "users": {...},
      "dateRange": {...}
    },
    "auditLogs": [...]
  }
}
```

### 9. Comprehensive Audit Report
**GET** `/api/audit/reports/comprehensive`

Generate comprehensive audit report covering all system activities.

**Query Parameters:**
- `startDate` (string, optional): Report start date
- `endDate` (string, optional): Report end date

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalActions": 1000,
      "dateRange": {
        "start": "2024-01-01",
        "end": "2024-01-31"
      }
    },
    "byTable": {
      "items": 300,
      "transactions": 400,
      "damages": 50,
      "deliveries": 150,
      "users": 100
    },
    "byAction": {
      "INSERT": 400,
      "UPDATE": 350,
      "DELETE": 50,
      "BORROW": 100,
      "RETURN": 100
    },
    "byUser": {
      "John Doe": 400,
      "Jane Smith": 300,
      "Bob Johnson": 200,
      "Alice Brown": 100
    },
    "byRole": {
      "Admin": 600,
      "Employee": 300,
      "Delivery Staff": 100
    },
    "timeline": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "action": "INSERT",
        "table": "items",
        "user": "John Doe",
        "role": "Admin"
      }
    ]
  }
}
```

### 10. Data Integrity Check
**GET** `/api/audit/integrity-check`

Perform comprehensive data integrity monitoring.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "checks": [
      {
        "name": "Orphaned Audit Logs",
        "status": "PASS",
        "details": "0 audit logs reference non-existent users",
        "count": 0
      },
      {
        "name": "Missing Timestamps",
        "status": "PASS",
        "details": "0 audit logs missing timestamps",
        "count": 0
      },
      {
        "name": "Invalid Action Types",
        "status": "PASS",
        "details": "0 audit logs with invalid action types",
        "count": 0
      },
      {
        "name": "Recent Activity",
        "status": "PASS",
        "details": "25 audit entries in last 24 hours",
        "count": 25
      }
    ],
    "overallStatus": "PASS",
    "issues": []
  }
}
```

### 11. Audit Statistics
**GET** `/api/audit/stats`

Get comprehensive audit statistics.

**Query Parameters:**
- `period` (number, optional): Period in days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30 days",
    "totalAudits": 1000,
    "uniqueUsers": 15,
    "breakdown": [
      {
        "actionType": "INSERT",
        "targetTable": "items",
        "count": 200
      },
      {
        "actionType": "UPDATE",
        "targetTable": "transactions",
        "count": 150
      }
    ]
  }
}
```

### 12. Cleanup Old Logs
**DELETE** `/api/audit/logs/cleanup`

Clean up old audit logs to maintain database performance.

**Request Body:**
```json
{
  "days": 365
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cleaned up 500 audit logs older than 365 days",
  "data": {
    "deletedCount": 500,
    "cutoffDate": "2023-01-15T10:30:00Z"
  }
}
```

## Action Types Tracked

The audit system tracks the following action types:

### Core Operations
- `INSERT` - New record creation
- `UPDATE` - Record modification
- `DELETE` - Record deletion

### Business Operations
- `BORROW` - Item borrowing
- `RETURN` - Item return
- `TRANSFER` - Item transfer between stores
- `DAMAGE_REPORT` - Damage reporting
- `DELIVERY_UPDATE` - Delivery status updates

### User Operations
- `LOGIN` - User login
- `LOGOUT` - User logout
- `PASSWORD_CHANGE` - Password changes
- `PROFILE_UPDATE` - Profile modifications

## Target Tables Monitored

The audit system monitors the following tables:
- `users` - User management
- `items` - Inventory items
- `transactions` - Borrow/return transactions
- `deliveries` - Delivery management
- `damages` - Damage reports
- `maintenance_logs` - Maintenance records
- `suppliers` - Supplier information
- `notifications` - System notifications

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Usage Examples

### Get Recent Inventory Changes
```bash
curl -X GET "http://localhost:3000/api/audit/logs?targetTable=items&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Generate Monthly Report
```bash
curl -X GET "http://localhost:3000/api/audit/reports/comprehensive?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Data Integrity
```bash
curl -X GET "http://localhost:3000/api/audit/integrity-check" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cleanup Old Logs
```bash
curl -X DELETE "http://localhost:3000/api/audit/logs/cleanup" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days": 365}'
```

## Security Considerations

1. **Admin Only Access**: All audit endpoints require admin privileges
2. **Data Sensitivity**: Audit logs contain sensitive information and should be protected
3. **Retention Policy**: Implement appropriate log retention policies
4. **Access Logging**: Monitor access to audit logs themselves
5. **Data Encryption**: Consider encrypting sensitive audit data

## Performance Considerations

1. **Pagination**: Always use pagination for large result sets
2. **Indexing**: Ensure proper database indexes on frequently queried fields
3. **Cleanup**: Regularly clean up old audit logs to maintain performance
4. **Caching**: Consider caching frequently accessed audit statistics
5. **Async Logging**: Audit logging should not block main operations

## Integration Notes

The audit system integrates with:
- **Authentication Middleware**: For user identification
- **Role Middleware**: For permission checking
- **All Controllers**: For automatic audit logging
- **Database Models**: For data integrity monitoring
- **Notification System**: For audit alerts and reports
