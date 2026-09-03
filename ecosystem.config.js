/**
 * PROJECT SETU - PM2 Production Ecosystem Configuration
 * Manages Node.js Express REST API and Python FastAPI NLP Microservice
 * 
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 status
 *   pm2 logs
 *   pm2 reload all
 */

module.exports = {
  apps: [
    // 1. Node.js Express Backend API
    {
      name: "setu-backend",
      cwd: "./backend",
      script: "dist/server.js",
      instances: "max", // Utilize all available CPU cores in cluster mode
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      merge_logs: true,
    },

    // 2. Python FastAPI NLP Microservice
    {
      name: "setu-ai-service",
      cwd: "./ai-service",
      script: "python",
      args: "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4",
      interpreter: "none",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        ENVIRONMENT: "development",
        PORT: 8000,
      },
      env_production: {
        ENVIRONMENT: "production",
        PORT: 8000,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/ai-error.log",
      out_file: "./logs/ai-out.log",
      merge_logs: true,
    },
  ],
};
