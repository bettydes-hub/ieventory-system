@echo off
echo 🚀 Setting up Git for IEventory Backend...
echo.

echo 📁 Initializing Git repository...
git init

echo.
echo 📝 Adding all files to Git...
git add .

echo.
echo 💾 Making first commit...
git commit -m "🚀 Day 1: Backend setup with Express, Sequelize, and User models

✅ Completed Tasks:
- Setup backend repo (Express, Sequelize, Postgres)
- Create DB connection config  
- Build Users model (Admin, Store Keeper, Employee, Delivery Staff)

🏗️ Project Structure:
- Database configuration with PostgreSQL
- User model with 4 roles and bcrypt security
- Database initialization script
- Health check endpoints
- Development scripts

📋 Next: Partner will add Stores, Items, Categories models"

echo.
echo 🎉 Git repository setup complete!
echo.
echo 📋 Next steps:
echo 1. Create GitHub repository
echo 2. Add remote origin: git remote add origin YOUR_GITHUB_URL
echo 3. Push to GitHub: git push -u origin main
echo.
pause
