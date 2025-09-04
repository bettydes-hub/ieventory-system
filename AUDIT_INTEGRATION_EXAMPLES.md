# Audit Integration Examples

This document provides examples of how to integrate audit logging into your existing controllers and services.

## 1. Basic Audit Logging in Controllers

### Example: User Controller Integration

```javascript
const AuditService = require('../services/auditService');

// In user creation
router.post('/', authenticateToken, canManageUsers, async (req, res) => {
  try {
    const userData = req.body;
    const user = await User.create(userData);
    
    // Log the user creation
    await AuditService.logInsert(req.user.id, 'users', user.id, userData);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    // Handle error
  }
});

// In user update
router.put('/:id', authenticateToken, canManageUsers, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    const oldData = user.toJSON();
    
    await user.update(req.body);
    const newData = user.toJSON();
    
    // Log the user update
    await AuditService.logUpdate(req.user.id, 'users', user.id, oldData, newData);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    // Handle error
  }
});

// In user deletion
router.delete('/:id', authenticateToken, canManageUsers, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    const userData = user.toJSON();
    
    await user.destroy();
    
    // Log the user deletion
    await AuditService.logDelete(req.user.id, 'users', user.id, userData);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    // Handle error
  }
});
```

## 2. Business Logic Audit Logging

### Example: Transaction Controller Integration

```javascript
// In transaction creation (borrow)
router.post('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.user.id
    };
    
    const transaction = await Transaction.create(transactionData);
    
    // Log the borrow operation
    await AuditService.logBorrow(req.user.id, transaction.id, transactionData);
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    // Handle error
  }
});

// In transaction return
router.put('/:id/return', authenticateToken, requireAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    const oldData = transaction.toJSON();
    
    const returnData = req.body;
    await transaction.update({
      ...returnData,
      status: 'Returned',
      returnedAt: new Date()
    });
    
    const newData = transaction.toJSON();
    
    // Log the return operation
    await AuditService.logReturn(req.user.id, transaction.id, returnData);
    
    res.json({
      success: true,
      message: 'Item returned successfully',
      data: transaction
    });
  } catch (error) {
    // Handle error
  }
});
```

## 3. Service Layer Integration

### Example: Inventory Service with Audit Logging

```javascript
class InventoryService {
  static async addItem(userId, itemData) {
    try {
      const item = await Item.create(itemData);
      
      // Log the item addition
      await AuditService.logInsert(userId, 'items', item.id, itemData);
      
      return item;
    } catch (error) {
      throw error;
    }
  }
  
  static async updateItem(userId, itemId, updateData) {
    try {
      const item = await Item.findByPk(itemId);
      if (!item) {
        throw new Error('Item not found');
      }
      
      const oldData = item.toJSON();
      await item.update(updateData);
      const newData = item.toJSON();
      
      // Log the item update
      await AuditService.logUpdate(userId, 'items', itemId, oldData, newData);
      
      return item;
    } catch (error) {
      throw error;
    }
  }
  
  static async deleteItem(userId, itemId) {
    try {
      const item = await Item.findByPk(itemId);
      if (!item) {
        throw new Error('Item not found');
      }
      
      const itemData = item.toJSON();
      await item.destroy();
      
      // Log the item deletion
      await AuditService.logDelete(userId, 'items', itemId, itemData);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async transferItem(userId, itemId, fromStoreId, toStoreId, quantity) {
    try {
      const transferData = {
        itemId,
        fromStoreId,
        toStoreId,
        quantity,
        transferredBy: userId,
        transferredAt: new Date()
      };
      
      // Perform the transfer logic
      const result = await this.performTransfer(transferData);
      
      // Log the transfer operation
      await AuditService.logTransfer(userId, itemId, transferData);
      
      return result;
    } catch (error) {
      throw error;
    }
  }
}
```

## 4. Middleware Integration

### Example: Automatic Audit Middleware

```javascript
// middleware/auditMiddleware.js
const AuditService = require('../services/auditService');

const auditMiddleware = (req, res, next) => {
  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override res.send to capture response data
  res.send = function(data) {
    // Log the request if it's a successful operation
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logRequest(req, data);
    }
    originalSend.call(this, data);
  };
  
  // Override res.json to capture response data
  res.json = function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logRequest(req, data);
    }
    originalJson.call(this, data);
  };
  
  next();
};

async function logRequest(req, responseData) {
  try {
    // Only log certain operations
    const loggableMethods = ['POST', 'PUT', 'DELETE'];
    const loggablePaths = ['/api/users', '/api/items', '/api/transactions'];
    
    if (loggableMethods.includes(req.method) && 
        loggablePaths.some(path => req.path.startsWith(path))) {
      
      const actionType = getActionType(req.method, req.path);
      const targetTable = getTargetTable(req.path);
      
      if (actionType && targetTable) {
        await AuditService.logAction({
          user_id: req.user?.id,
          action_type: actionType,
          target_table: targetTable,
          target_id: req.params.id || responseData?.data?.id,
          new_value: responseData?.data
        });
      }
    }
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw error - audit failure shouldn't break main operations
  }
}

function getActionType(method, path) {
  if (method === 'POST') return 'INSERT';
  if (method === 'PUT') return 'UPDATE';
  if (method === 'DELETE') return 'DELETE';
  return null;
}

function getTargetTable(path) {
  if (path.includes('/users')) return 'users';
  if (path.includes('/items')) return 'items';
  if (path.includes('/transactions')) return 'transactions';
  if (path.includes('/deliveries')) return 'deliveries';
  if (path.includes('/damages')) return 'damages';
  return null;
}

module.exports = { auditMiddleware };
```

## 5. Model Hooks Integration

### Example: Sequelize Model Hooks

```javascript
// models/Item.js
const { DataTypes } = require('sequelize');
const AuditService = require('../services/auditService');

const Item = sequelize.define('Item', {
  // ... item fields
});

// Add hooks for automatic audit logging
Item.addHook('afterCreate', async (item, options) => {
  try {
    if (options.userId) {
      await AuditService.logInsert(options.userId, 'items', item.id, item.toJSON());
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
});

Item.addHook('afterUpdate', async (item, options) => {
  try {
    if (options.userId && options.previousValues) {
      await AuditService.logUpdate(
        options.userId, 
        'items', 
        item.id, 
        options.previousValues, 
        item.toJSON()
      );
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
});

Item.addHook('afterDestroy', async (item, options) => {
  try {
    if (options.userId) {
      await AuditService.logDelete(options.userId, 'items', item.id, item.toJSON());
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
});

module.exports = Item;
```

## 6. Error Handling in Audit Logging

### Example: Robust Error Handling

```javascript
class AuditService {
  static async logAction(auditData) {
    try {
      const audit = await AuditLog.create({
        ...auditData,
        timestamp: new Date()
      });
      return audit;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      
      // Log to alternative system if available
      if (process.env.ALTERNATIVE_AUDIT_LOG) {
        await this.logToAlternativeSystem(auditData, error);
      }
      
      // Don't throw error - audit failure shouldn't break main operations
      return null;
    }
  }
  
  static async logToAlternativeSystem(auditData, error) {
    try {
      // Log to file system, external service, etc.
      const fs = require('fs');
      const logEntry = {
        timestamp: new Date().toISOString(),
        auditData,
        error: error.message
      };
      
      fs.appendFileSync('audit-fallback.log', JSON.stringify(logEntry) + '\n');
    } catch (fallbackError) {
      console.error('Failed to log to alternative system:', fallbackError);
    }
  }
}
```

## 7. Performance Optimization

### Example: Batch Audit Logging

```javascript
class AuditService {
  static auditQueue = [];
  static batchSize = 10;
  static batchTimeout = 5000; // 5 seconds
  
  static async logAction(auditData) {
    // Add to queue
    this.auditQueue.push({
      ...auditData,
      timestamp: new Date()
    });
    
    // Process batch if queue is full
    if (this.auditQueue.length >= this.batchSize) {
      await this.processBatch();
    }
  }
  
  static async processBatch() {
    if (this.auditQueue.length === 0) return;
    
    try {
      const batch = this.auditQueue.splice(0, this.batchSize);
      await AuditLog.bulkCreate(batch);
    } catch (error) {
      console.error('Batch audit logging error:', error);
      // Re-queue failed items
      this.auditQueue.unshift(...batch);
    }
  }
  
  // Process remaining items on interval
  static startBatchProcessor() {
    setInterval(() => {
      this.processBatch();
    }, this.batchTimeout);
  }
}

// Start batch processor
AuditService.startBatchProcessor();
```

## 8. Testing Audit Logging

### Example: Unit Tests for Audit Logging

```javascript
// tests/audit.test.js
const request = require('supertest');
const app = require('../app');
const { AuditLog, User } = require('../models');

describe('Audit Logging', () => {
  let authToken;
  let testUser;
  
  beforeEach(async () => {
    // Setup test user and auth token
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'Admin'
    });
    
    authToken = generateTestToken(testUser);
  });
  
  afterEach(async () => {
    // Clean up test data
    await AuditLog.destroy({ where: {} });
    await User.destroy({ where: { id: testUser.id } });
  });
  
  test('should log user creation', async () => {
    const userData = {
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      password: 'password123',
      role: 'Employee'
    };
    
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send(userData)
      .expect(201);
    
    // Check if audit log was created
    const auditLog = await AuditLog.findOne({
      where: {
        user_id: testUser.id,
        action_type: 'INSERT',
        target_table: 'users'
      }
    });
    
    expect(auditLog).toBeTruthy();
    expect(auditLog.new_value).toEqual(expect.objectContaining(userData));
  });
  
  test('should log user update', async () => {
    const updateData = { firstName: 'Updated' };
    
    const response = await request(app)
      .put(`/api/users/${testUser.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);
    
    // Check if audit log was created
    const auditLog = await AuditLog.findOne({
      where: {
        user_id: testUser.id,
        action_type: 'UPDATE',
        target_table: 'users',
        target_id: testUser.id
      }
    });
    
    expect(auditLog).toBeTruthy();
    expect(auditLog.old_value).toBeTruthy();
    expect(auditLog.new_value).toBeTruthy();
  });
});
```

## 9. Integration Checklist

When integrating audit logging into your application:

- [ ] **Import AuditService** in all controllers that need auditing
- [ ] **Add audit logging** to all CRUD operations (Create, Read, Update, Delete)
- [ ] **Log business operations** like borrow, return, transfer, damage reports
- [ ] **Include user context** in all audit logs (req.user.id)
- [ ] **Handle audit errors gracefully** - don't let audit failures break main operations
- [ ] **Test audit logging** to ensure it works correctly
- [ ] **Monitor audit log performance** and implement batching if needed
- [ ] **Set up log retention policies** to manage database size
- [ ] **Implement audit log cleanup** for old entries
- [ ] **Add audit log viewing** to admin dashboard
- [ ] **Generate audit reports** for compliance and monitoring

## 10. Best Practices

1. **Always include user context** - Every audit log should have a user_id
2. **Log before and after values** - For updates, log both old and new values
3. **Use consistent action types** - Standardize action type naming
4. **Handle errors gracefully** - Audit failures shouldn't break main operations
5. **Consider performance** - Use batch logging for high-volume operations
6. **Implement retention policies** - Clean up old audit logs regularly
7. **Test thoroughly** - Ensure audit logging works in all scenarios
8. **Monitor audit logs** - Set up alerts for unusual activity
9. **Secure audit data** - Protect audit logs from unauthorized access
10. **Document audit policies** - Clearly define what gets audited and why
