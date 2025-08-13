var config = {};

// Server Configuration
config.env = "production";
config.port = 3000;
config.host = "0.0.0.0";

// Database Configuration
config.db = {
  username: process.env.MYSQL_USERNAME || "codepush",
  password: process.env.MYSQL_PASSWORD || "codepush123",
  database: process.env.MYSQL_DATABASE || "codepush",
  host: process.env.MYSQL_HOST || "codepush-mysql",
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  dialect: "mysql",
  timezone: "+00:00",
  logging: false,
  operatorsAliases: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Redis Configuration
config.redis = {
  host: process.env.REDIS_HOST || "codepush-redis",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  db: 0,
  password: process.env.REDIS_PASSWORD || "",
  lazyConnect: true
};

// Storage Configuration
config.storageDir = process.env.STORAGE_DIR || "/data/storage";
config.dataDir = process.env.DATA_DIR || "/data/tmp";
config.downloadUrl = process.env.DOWNLOAD_URL || "https://codepush.carp.school/download";

// Security Configuration
config.jwt = {
  iss: "CarPoolCodePush",
  secret: process.env.JWT_ENCRYPT_KEY || "your-secret-key-change-in-production",
  expiration: "10h"
};

config.session = {
  secret: process.env.SESSION_SECRET || "your-session-secret-change-in-production",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true when using HTTPS (will be proxied)
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
};

// CORS Configuration (for web interface)
config.cors = {
  origin: [
    "https://codepush.carp.school",
    "https://carp.school",
    "http://localhost:3000",
    "http://localhost:8084"
  ],
  credentials: true
};

// Upload Configuration
config.upload = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedExtensions: [".zip", ".js", ".json", ".html", ".css", ".png", ".jpg", ".svg"]
};

// Logging Configuration
config.log = {
  level: "info",
  format: "combined"
};

// App Configuration
config.app = {
  name: "CarpSchool CodePush",
  description: "CodePush server for CarpSchool mobile app",
  defaultUser: {
    username: "admin",
    password: "carpschool123", // CHANGE IN PRODUCTION
    email: "admin@carp.school"
  }
};

// Client Configuration
config.client = {
  updateCheckUrl: process.env.DOWNLOAD_URL || "https://codepush.carp.school/download",
  updateDownloadUrl: process.env.DOWNLOAD_URL || "https://codepush.carp.school/download"
};

// Feature Flags
config.features = {
  enableAnalytics: true,
  enableMetrics: true,
  enableRollback: true,
  enableTargeting: true
};

module.exports = config;
