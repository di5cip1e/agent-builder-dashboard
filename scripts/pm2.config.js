module.exports = {
  apps: [
    {
      name: 'agent-builder-dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/.openclaw/workspace/agent-builder-dashboard',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      error_file: '/var/log/agent-builder/error.log',
      out_file: '/var/log/agent-builder/out.log',
      log_file: '/var/log/agent-builder/combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 8000,
      kill_timeout: 5000,
      restart_delay: 4000,
      // Graceful shutdown
      kill_timeout: 5000,
      // Merge logs
      merge_logs: true,
      // Exponential backoff restart delay
      exp_backoff_restart_delay: 100,
      // Health check
      pmx: false,
      // Source maps for better error tracking
      source_map_support: true,
      // Node arguments
      node_args: '--max-old-space-size=1024',
      // Wait before sending SIGTERM
      kill_timeout: 5000
    }
  ]
};

/*
 * Alternative: Using npm start script with Next.js
 * If you prefer running via npm:
 * 
 * module.exports = {
 *   apps: [
 *     {
 *       name: 'agent-builder-dashboard',
 *       script: 'npm',
 *       args: 'start',
 *       cwd: '/root/.openclaw/workspace/agent-builder-dashboard',
 *       instances: 1,
 *       exec_mode: 'fork',
 *       watch: false,
 *       max_memory_restart: '1G',
 *       env: {
 *         NODE_ENV: 'production',
 *         PORT: 3000
 *       }
 *     }
 *   ]
 * };
 *
 * Docker Compose Integration for Agents:
 * 
 * When agents are deployed, they'll run in Docker containers.
 * Use docker-compose to manage them:
 * 
 * docker-compose -f /opt/agents/{client-slug}/docker-compose.yml up -d
 *
 * PM2 can also manage Docker containers using pm2-docker:
 * pm2-docker start --name agent-{slug} -i 1 -- /opt/agents/{slug}/Dockerfile
 *
 * Or use pm2-runtime with the docker container
 */