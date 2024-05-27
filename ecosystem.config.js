module.exports = {
  apps: [
    {
      name: 'supervisor-api',
      script: 'dist/main.js',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
