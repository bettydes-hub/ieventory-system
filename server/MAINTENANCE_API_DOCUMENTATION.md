# Maintenance Controller API Documentation

## Overview
The Maintenance Controller provides comprehensive equipment maintenance management for the IEventory system, including maintenance scheduling, logs management, equipment status tracking, and maintenance history.

## Base URL
```
/api/maintenance
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. CRUD Operations

#### Get All Maintenance Logs
```http
GET /api/maintenance
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by title, description, or notes
- `itemId` (optional): Filter by item ID
- `status` (optional): Filter by status (scheduled, in_progress, completed, cancelled)
- `priority` (optional): Filter by priority (low, medium, high, critical)
- `maintenanceType` (optional): Filter by maintenance type
- `assignedTo` (optional): Filter by assigned user ID
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "maintenanceLogs": [
      {
        "maintenanceLogId": "uuid",
        "itemId": "uuid",
        "title": "Regular Maintenance",
        "description": "Monthly equipment check",
        "maintenanceType": "preventive",
        "priority": "medium",
        "scheduledDate": "2024-01-15T10:00:00Z",
        "estimatedDuration": 120,
        "assignedTo": "user_uuid",
        "notes": "Check all components",
        "status": "scheduled",
        "createdBy": "user_uuid",
        "item": {
          "itemId": "uuid",
          "name": "Laptop Dell XPS",
          "model": "XPS 13",
          "serialNumber": "SN123456",
          "status": "available"
        },
        "assignedUser": {
          "userId": "uuid",
          "name": "John Smith",
          "email": "john@example.com",
          "role": "Employee"
        },
        "createdByUser": {
          "userId": "uuid",
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "Admin"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalLogs": 50,
      "logsPerPage": 10
    }
  }
}
```

#### Get Maintenance Log by ID
```http
GET /api/maintenance/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "maintenanceLogId": "uuid",
    "itemId": "uuid",
    "title": "Regular Maintenance",
    "description": "Monthly equipment check",
    "maintenanceType": "preventive",
    "priority": "medium",
    "scheduledDate": "2024-01-15T10:00:00Z",
    "estimatedDuration": 120,
    "actualStartTime": "2024-01-15T10:05:00Z",
    "actualEndTime": "2024-01-15T12:00:00Z",
    "actualDuration": 115,
    "assignedTo": "user_uuid",
    "notes": "All components checked and working properly",
    "status": "completed",
    "workPerformed": "Cleaned, tested, and calibrated",
    "partsUsed": "Cleaning supplies, calibration tools",
    "cost": 50.00,
    "createdBy": "user_uuid",
    "item": {
      "itemId": "uuid",
      "name": "Laptop Dell XPS",
      "model": "XPS 13",
      "serialNumber": "SN123456",
      "status": "available",
      "purchaseDate": "2023-01-15T00:00:00Z"
    },
    "assignedUser": {
      "userId": "uuid",
      "name": "John Smith",
      "email": "john@example.com",
      "role": "Employee"
    },
    "createdByUser": {
      "userId": "uuid",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Admin"
    }
  }
}
```

#### Create Maintenance Log
```http
POST /api/maintenance
```

**Request Body:**
```json
{
  "itemId": "item_uuid",
  "title": "Regular Maintenance",
  "description": "Monthly equipment check",
  "maintenanceType": "preventive",
  "priority": "medium",
  "scheduledDate": "2024-01-15T10:00:00Z",
  "estimatedDuration": 120,
  "assignedTo": "user_uuid",
  "notes": "Check all components"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance log created successfully",
  "data": {
    "maintenanceLogId": "uuid",
    "itemId": "item_uuid",
    "title": "Regular Maintenance",
    "description": "Monthly equipment check",
    "maintenanceType": "preventive",
    "priority": "medium",
    "scheduledDate": "2024-01-15T10:00:00Z",
    "estimatedDuration": 120,
    "assignedTo": "user_uuid",
    "notes": "Check all components",
    "status": "scheduled",
    "createdBy": "user_uuid"
  }
}
```

#### Update Maintenance Log
```http
PUT /api/maintenance/:id
```

#### Delete Maintenance Log
```http
DELETE /api/maintenance/:id
```

### 2. Maintenance Scheduling

#### Get Maintenance Schedule
```http
GET /api/maintenance/schedule/list
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)
- `assignedTo` (optional): Filter by assigned user ID
- `priority` (optional): Filter by priority
- `status` (optional): Filter by status (default: 'scheduled')

**Response:**
```json
{
  "success": true,
  "data": {
    "schedule": [
      {
        "maintenanceLogId": "uuid",
        "itemId": "uuid",
        "title": "Regular Maintenance",
        "maintenanceType": "preventive",
        "priority": "medium",
        "scheduledDate": "2024-01-15T10:00:00Z",
        "estimatedDuration": 120,
        "assignedTo": "user_uuid",
        "status": "scheduled",
        "item": {
          "itemId": "uuid",
          "name": "Laptop Dell XPS",
          "model": "XPS 13",
          "serialNumber": "SN123456",
          "status": "available"
        },
        "assignedUser": {
          "userId": "uuid",
          "name": "John Smith",
          "email": "john@example.com",
          "role": "Employee"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalScheduled": 50,
      "itemsPerPage": 10
    }
  }
}
```

#### Get Upcoming Maintenance
```http
GET /api/maintenance/schedule/upcoming
```

**Query Parameters:**
- `days` (optional): Number of days ahead (default: 7)
- `limit` (optional): Maximum items to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "upcomingMaintenance": [
      {
        "maintenanceLogId": "uuid",
        "itemId": "uuid",
        "title": "Regular Maintenance",
        "maintenanceType": "preventive",
        "priority": "medium",
        "scheduledDate": "2024-01-15T10:00:00Z",
        "estimatedDuration": 120,
        "assignedTo": "user_uuid",
        "item": {
          "itemId": "uuid",
          "name": "Laptop Dell XPS",
          "model": "XPS 13",
          "serialNumber": "SN123456"
        },
        "assignedUser": {
          "userId": "uuid",
          "name": "John Smith",
          "email": "john@example.com"
        }
      }
    ],
    "period": "7 days",
    "totalUpcoming": 5
  }
}
```

#### Reschedule Maintenance
```http
PATCH /api/maintenance/:id/reschedule
```

**Request Body:**
```json
{
  "newScheduledDate": "2024-01-20T10:00:00Z",
  "reason": "Equipment not available on original date"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance rescheduled successfully",
  "data": {
    "maintenanceLogId": "uuid",
    "oldScheduledDate": "2024-01-15T10:00:00Z",
    "newScheduledDate": "2024-01-20T10:00:00Z",
    "reason": "Equipment not available on original date"
  }
}
```

### 3. Maintenance Logs Management

#### Start Maintenance
```http
PATCH /api/maintenance/:id/start
```

**Request Body:**
```json
{
  "actualStartTime": "2024-01-15T10:05:00Z",
  "notes": "Starting maintenance work"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance started successfully",
  "data": {
    "maintenanceLogId": "uuid",
    "status": "in_progress",
    "actualStartTime": "2024-01-15T10:05:00Z"
  }
}
```

#### Complete Maintenance
```http
PATCH /api/maintenance/:id/complete
```

**Request Body:**
```json
{
  "actualEndTime": "2024-01-15T12:00:00Z",
  "actualDuration": 115,
  "workPerformed": "Cleaned, tested, and calibrated all components",
  "partsUsed": "Cleaning supplies, calibration tools",
  "cost": 50.00,
  "notes": "All components working properly",
  "itemStatus": "available"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance completed successfully",
  "data": {
    "maintenanceLogId": "uuid",
    "status": "completed",
    "actualEndTime": "2024-01-15T12:00:00Z",
    "actualDuration": 115,
    "itemStatus": "available"
  }
}
```

#### Cancel Maintenance
```http
PATCH /api/maintenance/:id/cancel
```

**Request Body:**
```json
{
  "reason": "Equipment is no longer needed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance cancelled successfully",
  "data": {
    "maintenanceLogId": "uuid",
    "status": "cancelled",
    "reason": "Equipment is no longer needed"
  }
}
```

### 4. Equipment Status Tracking

#### Get Equipment Maintenance Status
```http
GET /api/maintenance/equipment/:itemId/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "itemId": "uuid",
      "name": "Laptop Dell XPS",
      "model": "XPS 13",
      "serialNumber": "SN123456",
      "status": "available"
    },
    "maintenanceStatus": {
      "totalMaintenance": 15,
      "completedMaintenance": 12,
      "scheduledMaintenance": 2,
      "inProgressMaintenance": 1,
      "overdueMaintenance": 0,
      "lastMaintenance": {
        "maintenanceLogId": "uuid",
        "title": "Regular Maintenance",
        "actualEndTime": "2023-12-15T12:00:00Z",
        "status": "completed",
        "assignedUser": {
          "userId": "uuid",
          "name": "John Smith"
        }
      },
      "nextMaintenance": {
        "maintenanceLogId": "uuid",
        "title": "Regular Maintenance",
        "scheduledDate": "2024-01-15T10:00:00Z",
        "status": "scheduled",
        "assignedUser": {
          "userId": "uuid",
          "name": "John Smith"
        }
      }
    }
  }
}
```

#### Get Items Requiring Maintenance
```http
GET /api/maintenance/equipment/requiring
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `priority` (optional): Filter by priority
- `daysOverdue` (optional): Filter by days overdue (default: 0)
- `maintenanceType` (optional): Filter by maintenance type

**Response:**
```json
{
  "success": true,
  "data": {
    "itemsRequiringMaintenance": [
      {
        "maintenanceLogId": "uuid",
        "itemId": "uuid",
        "title": "Overdue Maintenance",
        "maintenanceType": "preventive",
        "priority": "high",
        "scheduledDate": "2024-01-10T10:00:00Z",
        "assignedTo": "user_uuid",
        "item": {
          "itemId": "uuid",
          "name": "Laptop Dell XPS",
          "model": "XPS 13",
          "serialNumber": "SN123456",
          "status": "available"
        },
        "assignedUser": {
          "userId": "uuid",
          "name": "John Smith",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

### 5. Maintenance History

#### Get Item Maintenance History
```http
GET /api/maintenance/equipment/:itemId/history
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `maintenanceType` (optional): Filter by maintenance type
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "itemId": "uuid",
      "name": "Laptop Dell XPS",
      "model": "XPS 13",
      "serialNumber": "SN123456"
    },
    "maintenanceHistory": [
      {
        "maintenanceLogId": "uuid",
        "title": "Regular Maintenance",
        "maintenanceType": "preventive",
        "priority": "medium",
        "scheduledDate": "2023-12-15T10:00:00Z",
        "actualStartTime": "2023-12-15T10:05:00Z",
        "actualEndTime": "2023-12-15T12:00:00Z",
        "actualDuration": 115,
        "status": "completed",
        "workPerformed": "Cleaned and tested",
        "cost": 50.00,
        "assignedUser": {
          "userId": "uuid",
          "name": "John Smith",
          "email": "john@example.com"
        },
        "createdByUser": {
          "userId": "uuid",
          "name": "Admin User",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalHistory": 50,
      "itemsPerPage": 10
    }
  }
}
```

#### Get Maintenance Statistics
```http
GET /api/maintenance/statistics/overview
```

**Query Parameters:**
- `period` (optional): Period in days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30 days",
    "statistics": {
      "totalMaintenance": 150,
      "completedMaintenance": 120,
      "scheduledMaintenance": 25,
      "inProgressMaintenance": 3,
      "cancelledMaintenance": 2,
      "overdueMaintenance": 5,
      "completionRate": 80,
      "averageDuration": 95,
      "totalCost": 7500.00,
      "maintenanceByType": [
        {
          "maintenanceType": "preventive",
          "count": "100"
        },
        {
          "maintenanceType": "corrective",
          "count": "30"
        },
        {
          "maintenanceType": "emergency",
          "count": "20"
        }
      ],
      "maintenanceByPriority": [
        {
          "priority": "medium",
          "count": "80"
        },
        {
          "priority": "high",
          "count": "40"
        },
        {
          "priority": "low",
          "count": "30"
        }
      ]
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

- **Admin**: Full access to all endpoints
- **Store Keeper**: Access to CRUD operations, scheduling, and maintenance management
- **Employee**: Access to start/complete assigned maintenance and view maintenance information

## Features

### Equipment Maintenance
- **Complete CRUD operations** for maintenance logs
- **Maintenance scheduling** with flexible date management
- **Priority-based** maintenance organization
- **Multiple maintenance types** (preventive, corrective, emergency)

### Maintenance Scheduling
- **Flexible scheduling** with reschedule capabilities
- **Upcoming maintenance** alerts and notifications
- **Overdue maintenance** tracking and reporting
- **Assignment management** for maintenance tasks

### Maintenance Logs Management
- **Status tracking** (scheduled, in_progress, completed, cancelled)
- **Work documentation** with detailed notes and parts used
- **Cost tracking** for maintenance activities
- **Duration monitoring** with estimated vs actual time

### Equipment Status Tracking
- **Real-time equipment status** monitoring
- **Maintenance history** per equipment item
- **Overdue maintenance** identification
- **Equipment health** assessment

### Maintenance History
- **Comprehensive history** tracking for all equipment
- **Performance analytics** and statistics
- **Cost analysis** and reporting
- **Trend identification** for maintenance patterns

### Advanced Features
- **Audit logging** for all maintenance activities
- **Pagination** for large datasets
- **Advanced filtering** and search capabilities
- **Statistics and analytics** for maintenance performance
- **Integration** with item and user management systems
