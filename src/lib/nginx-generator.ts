import fs from 'fs';
import path from 'path';

// Configuration
const NGINX_SITES_AVAILABLE = process.env.NGINX_SITES_AVAILABLE || '/etc/nginx/sites-available';
const NGINX_SITES_ENABLED = process.env.NGINX_SITES_ENABLED || '/etc/nginx/sites-enabled';
const DOMAIN_SUFFIX = process.env.DOMAIN_SUFFIX || 'yourdomain.com';

export interface NginxConfigOptions {
  clientSlug: string;
  port: number;
  domain?: string;
  enableSSL?: boolean;
  sslCertPath?: string;
  sslKeyPath?: string;
  enableWebSocket?: boolean;
  rateLimitRequests?: number;
  rateLimitBurst?: number;
  customHeaders?: Record<string, string>;
  upstreamTimeout?: number;
}

export interface NginxGeneratorResult {
  success: boolean;
  configPath?: string;
  symlinkPath?: string;
  error?: string;
}

/**
 * Generate nginx configuration for an agent
 */
export function generateNginxConfig(options: NginxConfigOptions): string {
  const {
    clientSlug,
    port,
    domain,
    enableSSL = false,
    enableWebSocket = true,
    rateLimitRequests = 20,
    rateLimitBurst = 20,
    customHeaders = {},
    upstreamTimeout = 60,
  } = options;

  const fullDomain = domain || `${clientSlug}.${DOMAIN_SUFFIX}`;

  // Build custom headers
  const customHeaderLines = Object.entries(customHeaders)
    .map(([key, value]) => `    add_header ${key} "${value}" always;`)
    .join('\n');

  // Build SSL config if enabled
  const sslConfig = enableSSL ? `
    # SSL Configuration
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    ssl_certificate ${options.sslCertPath || `/etc/ssl/certs/${clientSlug}.crt`};
    ssl_certificate_key ${options.sslKeyPath || `/etc/ssl/private/${clientSlug}.key`};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;` : '';

  // Build WebSocket headers if enabled
  const websocketHeaders = enableWebSocket ? `
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';` : '';

  // Build rate limiting config
  const rateLimitConfig = rateLimitRequests > 0 ? `
    limit_req zone=agent_${clientSlug}_limit burst=${rateLimitBurst} nodelay;` : '';

  return `# Nginx configuration for agent: ${clientSlug}
# Generated at: ${new Date().toISOString()}
# Port: ${port}
# Domain: ${fullDomain}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=agent_${clientSlug}_limit:10m rate=${rateLimitRequests}r/s;

server {
    listen 80;
    listen [::]:80;
    server_name ${fullDomain};${sslConfig}

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;${customHeaderLines ? '\n' + customHeaderLines : ''}

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:${port}/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        access_log off;
    }

    # Main proxy
    location / {${rateLimitConfig}
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;

        # WebSocket support
${websocketHeaders}

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        # Timeouts
        proxy_connect_timeout ${upstreamTimeout}s;
        proxy_send_timeout ${upstreamTimeout}s;
        proxy_read_timeout ${upstreamTimeout}s;

        # Cache bypass for WebSocket
        proxy_cache_bypass $http_upgrade;
    }

    # Logging
    access_log /var/log/nginx/agent-${clientSlug}_access.log;
    error_log /var/log/nginx/agent-${clientSlug}_error.log;

    # Redirect HTTP to HTTPS (if SSL enabled)
    ${enableSSL ? `if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }` : ''}
}
`;
}

/**
 * Write nginx config to file and create symlink
 */
export async function writeNginxConfig(
  options: NginxConfigOptions
): Promise<NginxGeneratorResult> {
  try {
    const config = generateNginxConfig(options);
    const configFileName = `agent-${options.clientSlug}.conf`;
    const configPath = path.join(NGINX_SITES_AVAILABLE, configFileName);
    const symlinkPath = path.join(NGINX_SITES_ENABLED, configFileName);

    // Ensure directories exist
    if (!fs.existsSync(NGINX_SITES_AVAILABLE)) {
      fs.mkdirSync(NGINX_SITES_AVAILABLE, { recursive: true });
    }
    if (!fs.existsSync(NGINX_SITES_ENABLED)) {
      fs.mkdirSync(NGINX_SITES_ENABLED, { recursive: true });
    }

    // Write config file
    fs.writeFileSync(configPath, config, 'utf-8');

    // Create symlink if it doesn't exist
    if (!fs.existsSync(symlinkPath)) {
      fs.symlinkSync(configPath, symlinkPath);
    }

    return {
      success: true,
      configPath,
      symlinkPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Remove nginx config for an agent
 */
export async function removeNginxConfig(
  clientSlug: string
): Promise<NginxGeneratorResult> {
  try {
    const configFileName = `agent-${clientSlug}.conf`;
    const configPath = path.join(NGINX_SITES_AVAILABLE, configFileName);
    const symlinkPath = path.join(NGINX_SITES_ENABLED, configFileName);

    // Remove symlink
    if (fs.existsSync(symlinkPath)) {
      fs.unlinkSync(symlinkPath);
    }

    // Remove config file
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }

    return {
      success: true,
      configPath,
      symlinkPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all active nginx configs
 */
export function listNginxConfigs(): string[] {
  try {
    if (!fs.existsSync(NGINX_SITES_ENABLED)) {
      return [];
    }

    return fs.readdirSync(NGINX_SITES_ENABLED)
      .filter(file => file.startsWith('agent-') && file.endsWith('.conf'))
      .map(file => path.join(NGINX_SITES_ENABLED, file));
  } catch (error) {
    console.error('Error listing nginx configs:', error);
    return [];
  }
}

/**
 * Reload nginx configuration
 */
export async function reloadNginx(): Promise<boolean> {
  const { exec } = await import('child_process');
  
  return new Promise((resolve) => {
    exec('nginx -t && systemctl reload nginx', (error, stdout, stderr) => {
      if (error) {
        console.error('Nginx reload failed:', stderr);
        resolve(false);
      } else {
        console.log('Nginx reloaded successfully');
        resolve(true);
      }
    });
  });
}

/**
 * Test nginx configuration
 */
export async function testNginxConfig(): Promise<{ valid: boolean; output: string }> {
  const { exec } = await import('child_process');
  
  return new Promise((resolve) => {
    exec('nginx -t', (error, stdout, stderr) => {
      const output = error ? stderr : stdout;
      resolve({
        valid: !error,
        output,
      });
    });
  });
}

/**
 * Generate config for all agents from port allocation file
 */
export async function generateAllConfigs(
  agentsDir: string = '/opt/agents',
  portAllocationFile: string = '/opt/agents/port-allocation.json'
): Promise<NginxGeneratorResult[]> {
  const results: NginxGeneratorResult[] = [];

  try {
    // Read port allocation file
    if (!fs.existsSync(portAllocationFile)) {
      console.log('Port allocation file not found');
      return results;
    }

    const allocation = JSON.parse(fs.readFileSync(portAllocationFile, 'utf-8'));

    // Generate configs for each agent
    for (const [clientSlug, port] of Object.entries(allocation)) {
      const result = await writeNginxConfig({
        clientSlug,
        port: port as number,
      });
      results.push(result);
    }

    // Reload nginx
    await reloadNginx();
  } catch (error) {
    console.error('Error generating all configs:', error);
  }

  return results;
}

/**
 * Get agent domain from client slug
 */
export function getAgentDomain(clientSlug: string): string {
  return `${clientSlug}.${DOMAIN_SUFFIX}`;
}

/**
 * Validate port range
 */
export function isValidPort(port: number): boolean {
  return port >= 3001 && port <= 3999;
}

/**
 * Get next available port from range
 */
export function getNextAvailablePort(
  allocation: Record<string, number>
): number {
  const startPort = 3001;
  const endPort = 3999;
  const usedPorts = Object.values(allocation);

  for (let port = startPort; port <= endPort; port++) {
    if (!usedPorts.includes(port)) {
      return port;
    }
  }

  throw new Error('No available ports in range 3001-3999');
}