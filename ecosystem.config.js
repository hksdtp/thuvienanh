require('dotenv').config()

module.exports = {
  apps: [{
    name: 'thuvienanh',
    script: '.next/standalone/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      HOSTNAME: '0.0.0.0',
      // Synology FileStation
      SYNOLOGY_BASE_URL: process.env.SYNOLOGY_BASE_URL,
      SYNOLOGY_ALTERNATIVE_URL: process.env.SYNOLOGY_ALTERNATIVE_URL,
      SYNOLOGY_PHOTOS_URL: process.env.SYNOLOGY_PHOTOS_URL,
      SYNOLOGY_USERNAME: process.env.SYNOLOGY_USERNAME,
      SYNOLOGY_PASSWORD: process.env.SYNOLOGY_PASSWORD,
      SYNOLOGY_SHARED_FOLDER: process.env.SYNOLOGY_SHARED_FOLDER,
      SYNOLOGY_HOST: process.env.SYNOLOGY_HOST,
      SYNOLOGY_PORT: process.env.SYNOLOGY_PORT,
      ENABLE_SYNOLOGY_FOLDER_CREATION: process.env.ENABLE_SYNOLOGY_FOLDER_CREATION,
      // Database
      DATABASE_URL: process.env.DATABASE_URL,
      // Next.js
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
}

