module.exports = {
  apps: [
    {
      name: "hq88-bot",
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "500M",
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 50,
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
