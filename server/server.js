require("dotenv").config({ path: './.env' });

const app = require("./app");
const { testConnection } = require("./config/database");
const { initializeDatabase } = require("./config/init-db");

// Debug: Check environment variables
console.log("🔍 Environment variables:");
console.log("PORT from env:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);

const PORT = process.env.PORT || 5000;
console.log("Final PORT:", PORT);

// Initialize server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database and create tables
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
