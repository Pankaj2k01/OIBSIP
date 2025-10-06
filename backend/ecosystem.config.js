module.exports = {
  apps: [{
    name: 'pizza-ordering-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    kill_timeout: 5000,
    restart_delay: 5000,
    max_restarts: 5,
    min_uptime: '10s'
  }],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/pizza-ordering-system.git',
      path: '/var/www/pizza-ordering-system',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run seed && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};