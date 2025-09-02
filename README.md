# IEventory Backend

## 🚀 Day 1 Implementation Status

### ✅ Completed Tasks (Betty)
- [x] Setup backend repo (Express, Sequelize, Postgres)
- [x] Create DB connection config
- [x] Build Users model (Admin, Store Keeper, Employee, Delivery Staff)

### 🔄 Partner's Tasks (Day 1)
- [x] Setup migrations folder
- [x] Build Stores, Items, Categories models
- [x] Add foreign keys (store → items, category → items)

---

## 🏗️ Project Structure

```
backend/
├── config/
│   ├── database.js          # Database connection & Sequelize config
│   └── init-db.js          # Database initialization & sync
├── models/
│   ├── User.js             # User model with all roles
│   └── index.js            # Models index & associations
├── controllers/             # API controllers (Day 4)
├── routes/                  # API routes (Day 4)
├── middleware/              # Auth & validation middleware (Day 4)
├── server.js               # Main server file
├── package.json
└── env.example             # Environment variables template
```

---

## 🗄️ Database Models

### User Model
- **Roles**: Admin, Store Keeper, Employee, Delivery Staff
- **Fields**: username, email, password, firstName, lastName, role, phone, isActive, lastLogin
- **Special Fields**: 
  - `vehicleInfo` (JSON) - for delivery staff
  - `assignedStores` (JSON) - for store keepers
- **Security**: Password hashing with bcrypt
- **Methods**: `checkPassword()`, `getFullName()`, `hasRole()`, `hasAnyRole()`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL database
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create `.env` file from `env.example`:
   ```bash
   cp env.example .env
   ```

4. Update `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ieventory_db
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   ```

5. Start the server:
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

---

## 🔗 API Endpoints

### Health Check
- `GET /` - Server status
- `GET /health` - Health check endpoint

### Authentication (Day 4)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users (Day 4)
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

---

## 🔐 Default Admin User

When the database is first initialized, a default admin user is created:

- **Username**: `admin`
- **Email**: `admin@ieventory.com`
- **Password**: `admin123`
- **Role**: `admin`

⚠️ **Important**: Change the default password in production!

---

## 📋 Next Steps (Day 2)

### Your Tasks (Betty)
- [ ] Model + migration for Transactions (borrow, return, transfer)
- [ ] Enforce store rule: borrowed items must be returned to same store

### Partner's Tasks
- [ ] Model + migration for Deliveries (support transfer + return)
- [ ] Add foreign keys (transaction_id, assigned_to delivery staff)

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Check database connection
curl http://localhost:5000/health
```

---

## 📚 Dependencies

- **Express**: Web framework
- **Sequelize**: ORM for database operations
- **PostgreSQL**: Database driver
- **bcrypt**: Password hashing
- **JWT**: Authentication (Day 4)
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variables management
- **nodemon**: Development auto-reload
