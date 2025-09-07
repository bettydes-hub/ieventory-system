# IEventory API Testing Guide

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
cd backend
npm install
```

### **2. Environment Setup**
```bash
# Copy environment file
cp env.example .env

# Edit .env file with your configuration
# Set JWT_SECRET, database credentials, etc.
```

### **3. Start Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### **4. Test Health Check**
```bash
curl http://localhost:5000/health
```

## 🔐 **Authentication Flow**

### **Step 1: Register Admin User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@ieventory.com",
    "password": "AdminPass123!",
    "role": "Admin"
  }'
```

### **Step 2: Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ieventory.com",
    "password": "AdminPass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@ieventory.com",
      "role": "Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Step 3: Use Token in Requests**
```bash
# Set token variable
TOKEN="your_jwt_token_here"

# Use in Authorization header
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/profile
```

## 👥 **User Management (Admin Only)**

### **Create Store Keeper**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Store",
    "lastName": "Keeper",
    "email": "keeper@ieventory.com",
    "password": "KeeperPass123!",
    "role": "Store Keeper"
  }'
```

### **Create Regular User**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Regular",
    "lastName": "User",
    "email": "user@ieventory.com",
    "password": "UserPass123!",
    "role": "User"
  }'
```

### **Get All Users**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/users
```

## 📦 **Transaction Management**

### **Create Borrow Transaction**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "borrow",
    "itemId": "item-uuid",
    "storeId": "store-uuid",
    "dueDate": "2024-02-15",
    "notes": "Borrowing for event"
  }'
```

### **Approve Transaction (Store Keeper/Admin)**
```bash
curl -X PUT http://localhost:5000/api/transactions/transaction-uuid/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### **Process Return**
```bash
curl -X PUT http://localhost:5000/api/transactions/transaction-uuid/return \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "returnStoreId": "store-uuid",
    "notes": "Item returned in good condition"
  }'
```

### **Get Overdue Transactions**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/transactions/overdue
```

## 🔧 **Damage Management**

### **Report Serial Item Damage**
```bash
curl -X POST http://localhost:5000/api/damages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "item-uuid",
    "item_type": "serial",
    "serial_number": "SN001-2024",
    "description": "Screen cracked during transport",
    "notes": "Reported by delivery team"
  }'
```

### **Report Bulk Item Damage**
```bash
curl -X POST http://localhost:5000/api/damages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "item-uuid",
    "item_type": "bulk",
    "quantity_damaged": 5,
    "description": "Water damage to packaging",
    "notes": "Found during inventory check"
  }'
```

### **Resolve Damage (Store Keeper/Admin)**
```bash
curl -X PUT http://localhost:5000/api/damages/damage-uuid/resolve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Fixed",
    "notes": "Screen replaced, item ready for use"
  }'
```

### **Get Damage by Serial Number**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/damages/serial/SN001-2024
```

### **Get Damage Statistics**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/damages/stats
```

## 📬 **Notification Management**

### **Create Notification (Admin)**
```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "type": "dashboard alert",
    "message": "You have overdue items to return"
  }'
```

### **Create Bulk Notifications (Admin)**
```bash
curl -X POST http://localhost:5000/api/notifications/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["user-uuid-1", "user-uuid-2"],
    "type": "email",
    "message": "System maintenance scheduled for tonight"
  }'
```

### **Get User Notifications**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/notifications
```

### **Get Unread Count**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/notifications/unread-count
```

## 🚚 **Delivery Management**

### **Create Delivery (Store Keeper/Admin)**
```bash
curl -X POST http://localhost:5000/api/deliveries \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_to": "user-uuid",
    "delivery_type": "pickup",
    "address": "123 Main St, City, State",
    "scheduled_date": "2024-01-15T10:00:00Z",
    "notes": "Urgent delivery for event"
  }'
```

### **Assign Delivery**
```bash
curl -X PUT http://localhost:5000/api/deliveries/delivery-uuid/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_to": "user-uuid",
    "notes": "Assigned to delivery team"
  }'
```

### **Update Delivery Status**
```bash
curl -X PUT http://localhost:5000/api/deliveries/delivery-uuid/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed",
    "notes": "Delivery completed successfully"
  }'
```

### **Get My Deliveries**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/deliveries/my-deliveries
```

## 📊 **Statistics & Reports**

### **Transaction Statistics**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/transactions/stats
```

### **Damage Statistics**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/damages/stats
```

### **Delivery Statistics**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/deliveries/stats
```

### **Notification Statistics (Admin)**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/notifications/stats
```

## 🔍 **Error Testing**

### **Test Invalid Token**
```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:5000/api/auth/profile
```

### **Test Missing Token**
```bash
curl http://localhost:5000/api/auth/profile
```

### **Test Insufficient Permissions**
```bash
# Login as regular user, then try admin endpoint
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Test"}'
```

### **Test Validation Errors**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "email": "invalid-email",
    "password": "weak"
  }'
```

## 🧪 **Postman Collection**

### **Environment Variables**
Create a Postman environment with:
- `base_url`: `http://localhost:5000`
- `admin_token`: `{{admin_jwt_token}}`
- `user_token`: `{{user_jwt_token}}`
- `admin_user_id`: `{{admin_user_id}}`
- `regular_user_id`: `{{regular_user_id}}`

### **Pre-request Scripts**
```javascript
// Set authorization header
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.environment.get('admin_token')
});
```

### **Test Scripts**
```javascript
// Test response status
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test response structure
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

// Save response data
pm.test("Save user ID", function () {
    var jsonData = pm.response.json();
    pm.environment.set('user_id', jsonData.data.id);
});
```

## 📝 **Testing Checklist**

### **Authentication**
- [ ] User registration with valid data
- [ ] User registration with invalid data
- [ ] User login with valid credentials
- [ ] User login with invalid credentials
- [ ] Token validation
- [ ] Token expiration handling
- [ ] Password change functionality

### **Authorization**
- [ ] Admin-only endpoints (users, system settings)
- [ ] Store Keeper permissions (approvals, deliveries)
- [ ] User permissions (own data only)
- [ ] Role-based access control

### **CRUD Operations**
- [ ] Create operations with valid data
- [ ] Create operations with invalid data
- [ ] Read operations (single and list)
- [ ] Update operations
- [ ] Delete operations
- [ ] Pagination functionality

### **Business Logic**
- [ ] Store rule enforcement (return to same store)
- [ ] Serial vs bulk item logic
- [ ] Transaction approval workflow
- [ ] Damage resolution workflow
- [ ] Delivery assignment workflow

### **Error Handling**
- [ ] 400 Bad Request responses
- [ ] 401 Unauthorized responses
- [ ] 403 Forbidden responses
- [ ] 404 Not Found responses
- [ ] 500 Internal Server Error responses

### **Security**
- [ ] Password hashing verification
- [ ] JWT token security
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention

## 🚀 **Performance Testing**

### **Load Testing with Artillery**
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/transactions"
          headers:
            Authorization: "Bearer {{token}}"
```

### **Run Load Test**
```bash
npm install -g artillery
artillery run artillery-config.yml
```

This comprehensive testing guide covers all aspects of the IEventory API, from basic authentication to complex business logic testing. Use this guide to ensure your API is working correctly and securely.
