/**
 * Docker Templates - Dockerfile and docker-compose.yml templates with placeholders
 */

import { AgentConfig } from '@/types/agent';

export interface DockerTemplateVars {
  PORT: string;
  CLIENT_SLUG: string;
  CLIENT_NAME: string;
  NODE_VERSION: string;
  AGENT_CONFIG: string;
  STRIPE_API_KEY?: string;
}

/**
 * Generate Dockerfile content with placeholders replaced
 */
export function generateDockerfile(vars: DockerTemplateVars): string {
  return `FROM node:${vars.NODE_VERSION}-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE ${vars.PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:${vars.PORT}/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start command
CMD ["npm", "start"]
`;
}

/**
 * Generate docker-compose.yml content with placeholders replaced
 */
export function generateDockerCompose(vars: DockerTemplateVars): string {
  return `version: '3.8'

services:
  agent-${vars.CLIENT_SLUG}:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: agent-${vars.CLIENT_SLUG}
    ports:
      - "${vars.PORT}:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - AGENT_CONFIG=${vars.AGENT_CONFIG}
      ${vars.STRIPE_API_KEY ? `- STRIPE_API_KEY=${vars.STRIPE_API_KEY}` : ''}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    networks:
      - agent-network

networks:
  agent-network:
    driver: bridge
`;
}

/**
 * Generate package.json for the agent
 */
export function generatePackageJson(clientSlug: string, clientName: string): string {
  return `{
  "name": "agent-${clientSlug}",
  "version": "1.0.0",
  "description": "AI Agent for ${clientName}",
  "main": "src/index.ts",
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "stripe": "^14.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.2"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
`;
}

/**
 * Generate tsconfig.json for the agent
 */
export function generateTsConfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`;
}

/**
 * Generate .env.example file
 */
export function generateEnvExample(): string {
  return `# Environment Configuration
# Copy this to .env and fill in your values

# Server Configuration
PORT=3000
NODE_ENV=production

# Stripe Configuration (if using payments)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Agent Configuration (JSON encoded)
AGENT_CONFIG={}

# Optional: Custom API keys for tools
# OPENAI_API_KEY=sk-...
# DATABASE_URL=postgresql://...
`;
}

/**
 * Generate README.md for the agent
 */
export function generateReadme(clientSlug: string, clientName: string, config: AgentConfig): string {
  const industryLabels: Record<string, string> = {
    healthcare: 'Healthcare',
    finance: 'Finance',
    legal: 'Legal',
    ecommerce: 'E-Commerce',
    marketing: 'Marketing',
    hr: 'Human Resources',
    'real-estate': 'Real Estate',
    custom: 'Custom'
  };

  const fieldLabels: Record<string, string> = {
    'customer-service': 'Customer Service',
    'data-entry': 'Data Entry',
    analytics: 'Analytics',
    scheduling: 'Scheduling',
    sales: 'Sales',
    support: 'Support',
    research: 'Research',
    custom: 'Custom'
  };

  const interfaceLabels: Record<string, string> = {
    'web-widget': 'Web Widget',
    'slack-bot': 'Slack Bot',
    sms: 'SMS',
    whatsapp: 'WhatsApp',
    'api-endpoint': 'API Endpoint',
    'chrome-extension': 'Chrome Extension'
  };

  return `# Agent: ${clientName}

AI Agent built with Agent Builder Dashboard

## Configuration

- **Industry:** ${industryLabels[config.industry] || config.industry}
- **Operational Field:** ${fieldLabels[config.operationalField] || config.operationalField}
- **Tone of Voice:** ${config.toneOfVoice}
- **Deployment Interfaces:** ${config.deploymentInterfaces.map(i => interfaceLabels[i] || i).join(', ')}

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the agent
npm start
\`\`\`

## Docker Deployment

\`\`\`bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
\`\`\`

## Environment Variables

See \`.env.example\` for required environment variables.

## License

Proprietary - All rights reserved
`;
}

/**
 * Generate the main index.ts entry point
 */
export function generateIndexTs(config: AgentConfig, clientSlug: string): string {
  const industry = config.industry.charAt(0).toUpperCase() + config.industry.slice(1);
  const field = config.operationalField.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const tone = config.toneOfVoice.charAt(0).toUpperCase() + config.toneOfVoice.slice(1);

  return `/**
 * ${industry} ${field} Agent
 * Generated by Agent Builder Dashboard
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Status endpoint
app.get('/status', (req: Request, res: Response) => {
  res.json({
    agent: '${clientSlug}',
    industry: '${config.industry}',
    field: '${config.operationalField}',
    tone: '${config.toneOfVoice}',
    uptime: process.uptime()
  });
});

// Main agent endpoint
app.post('/api/agent', async (req: Request, res: Response) => {
  try {
    const { message, action } = req.body;
    
    // Agent logic would go here
    // This is where you'd integrate your AI model
    
    const response = {
      message: message,
      agent: '${clientSlug}',
      tone: '${tone}',
      industry: '${industry}',
      field: '${field}',
      response: \`Thank you for your message. I'm a ${tone.toLowerCase()} AI agent specialized in ${field.toLowerCase()} for the ${industry.toLowerCase()} industry.\`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Agent '${clientSlug}' running on port \${PORT}\`);
  console.log(\`Industry: ${industry}\`);
  console.log(\`Field: ${field}\`);
  console.log(\`Tone: \${tone}\`);
});

export default app;
`;
}

/**
 * Generate config.ts
 */
export function generateConfigTs(config: AgentConfig, clientSlug: string): string {
  return `/**
 * Agent Configuration
 * Generated by Agent Builder Dashboard
 */

export const agentConfig = {
  slug: '${clientSlug}',
  industry: '${config.industry}',
  operationalField: '${config.operationalField}',
  toneOfVoice: '${config.toneOfVoice}',
  deploymentInterfaces: ${JSON.stringify(config.deploymentInterfaces, null, 2).replace(/\n/g, '\n  ')},
  useCases: ${JSON.stringify(config.useCases.filter(u => u.selected).map(u => u.label), null, 2).replace(/\n/g, '\n  ') || '[]'},
  custom: {
    tone: ${config.customTone ? `'${config.customTone}'` : 'undefined'},
    industry: ${config.customIndustry ? `'${config.customIndustry}'` : 'undefined'},
    field: ${config.customField ? `'${config.customField}'` : 'undefined'}
  }
};

export default agentConfig;
`;
}