/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: 'cryptogod',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/cryptogod',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/pm2/cryptogod-error.log',
      out_file:   '/var/log/pm2/cryptogod-out.log',
      merge_logs: true,
    },
  ],
};
