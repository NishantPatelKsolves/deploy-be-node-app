module.exports = {
  apps: [
    {
      name: "JonasBackend",
      script: "./src/server.js", // path to your compiled file
      // instances: "max", // cluster mode with max CPU cores
      instances: 2,
      exec_mode: "cluster", // enables cluster mode
      watch: false, // turn off watching in production
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
