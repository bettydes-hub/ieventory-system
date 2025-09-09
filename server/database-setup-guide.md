# Database Setup Guide

## PostgreSQL Setup Required

The backend requires PostgreSQL to run. Here's how to set it up:

### Option 1: Use PostgreSQL with Authentication

1. **Find your PostgreSQL password:**
   - Open pgAdmin (if installed)
   - Or check your PostgreSQL installation notes
   - Or reset the password

2. **Create the database:**
   ```sql
   CREATE DATABASE ieventory_db;
   ```

3. **Create a .env file in the server directory:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ieventory_db
   DB_USER=postgres
   DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
   DB_LOG_SQL=false

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_inventory_system_2024
   JWT_EXPIRES_IN=24h

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

### Option 2: Reset PostgreSQL Password

1. **Stop PostgreSQL service:**
   ```cmd
   net stop postgresql-x64-17
   ```

2. **Start PostgreSQL in single-user mode:**
   ```cmd
   "C:\Program Files\PostgreSQL\17\bin\postgres.exe" --single -D "C:\Program Files\PostgreSQL\17\data" postgres
   ```

3. **Reset password:**
   ```sql
   ALTER USER postgres PASSWORD '1123';
   \q
   ```

4. **Start PostgreSQL service:**
   ```cmd
   net start postgresql-x64-17
   ```

### Option 3: Use Different Database User

1. **Create a new user:**
   ```sql
   CREATE USER ieventory_user WITH PASSWORD 'ieventory123';
   CREATE DATABASE ieventory_db OWNER ieventory_user;
   GRANT ALL PRIVILEGES ON DATABASE ieventory_db TO ieventory_user;
   ```

2. **Update .env file:**
   ```env
   DB_USER=ieventory_user
   DB_PASSWORD=ieventory123
   ```

## After Database Setup

1. **Run migrations:**
   ```cmd
   npm run db:migrate
   ```

2. **Start the server:**
   ```cmd
   npm run dev
   ```

3. **Test the API:**
   ```cmd
   curl http://localhost:5000/health
   ```
