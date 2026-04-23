/**
 * POST /api/agent/generate-realtime
 * Generate client agent files using templates + form data
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      botName, 
      businessName, 
      industry, 
      field, 
      useCases, 
      tone, 
      customTone,
      personality,
      interfaces, 
      skillLevel,
      integrations 
    } = body;

    // Create agent directory
    const agentSlug = botName.toLowerCase().replace(/\s+/g, '-');
    const agentDir = `/opt/agents/${agentSlug}`;
    
    // Ensure directory exists
    if (!fs.existsSync('/opt/agents')) {
      fs.mkdirSync('/opt/agents', { recursive: true });
    }
    fs.mkdirSync(agentDir, { recursive: true });
    fs.mkdirSync(path.join(agentDir, 'src', 'prompts'), { recursive: true });
    fs.mkdirSync(path.join(agentDir, 'src', 'tools'), { recursive: true });

    // 1. Create package.json
    const packageJson = {
      name: agentSlug,
      version: '1.0.0',
      description: `${botName} - AI agent for ${businessName}`,
      main: 'src/index.ts',
      scripts: {
        dev: 'openclaw dev',
        start: 'openclaw start',
        build: 'openclaw build'
      },
      dependencies: {
        openclaw: '^2026.4.15'
      }
    };
    fs.writeFileSync(path.join(agentDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // 2. Create tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
        rootDir: './src'
      },
      include: ['src/**/*'],
      exclude: ['node_modules']
    };
    fs.writeFileSync(path.join(agentDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    // 3. Create src/index.ts (OpenClaw agent entry)
    const indexTs = `/**
 * ${botName} - AI Agent for ${businessName}
 * Industry: ${industry}
 * Function: ${field}
 * Generated: ${new Date().toISOString()}
 */

import { Agent } from 'openclaw';

// Agent configuration
const agentConfig = {
  name: '${botName}',
  description: '${businessName} - ${field} agent',
  model: '${skillLevel === 'enterprise' ? 'openrouter/claude-sonnet-4' : skillLevel === 'advanced' ? 'openrouter/claude-3-opus' : 'openrouter/claude-3-haiku'}',
  maxTokens: ${skillLevel === 'basic' ? 2048 : skillLevel === 'intermediate' ? 4096 : skillLevel === 'advanced' ? 8192 : 16384},
  temperature: 0.7,
  systemPrompt: `You are ${botName}, an AI agent for ${businessName}. Industry: ${industry}, Field: ${field}. Tone: ${tone}.`,
  tools: [
    // Tools will be imported from ./tools/
  ],
  integrations: ${JSON.stringify(Object.entries(integrations).filter(([_, v]) => v).map(([k]) => k), null, 2).replace(/\n/g, '\n  ')}
};

// Initialize and run agent
async function main() {
  console.log(\`🤖 Starting ${botName}...\`);
  console.log('Industry:', '${industry}');
  console.log('Function:', '${field}');
  console.log('Skill Level:', '${skillLevel}');
  
  const agent = new Agent(agentConfig);
  await agent.start();
  
  console.log(\`✅ ${botName} is ready!\`);
}

main().catch(console.error);
`;
    fs.writeFileSync(path.join(agentDir, 'src', 'index.ts'), indexTs);

    // 4. Create src/config.ts
    const configTs = `/**
 * Agent Configuration
 */
export const config = {
  botName: '${botName}',
  businessName: '${businessName}',
  industry: '${industry}',
  field: '${field}',
  useCases: ${JSON.stringify(useCases)},
  tone: '${tone}'${customTone ? `,
  customTone: '${customTone}'` : ''}${personality ? `,
  personality: \`${personality}\`` : ''},
  interfaces: ${JSON.stringify(interfaces)},
  skillLevel: '${skillLevel}',
  pricing: {
    basic: 49,
    intermediate: 99,
    advanced: 199,
    enterprise: 499
  },
  integrations: ${JSON.stringify(Object.entries(integrations).filter(([_, v]) => v).map(([k]) => k))}
};

export type Config = typeof config;
`;
    fs.writeFileSync(path.join(agentDir, 'src', 'config.ts'), configTs);

    // 5. Create src/prompts/system.md
    const systemPrompt = `# ${botName} - System Prompt

## Identity
You are ${botName}, an AI agent specifically designed to help ${businessName} with ${field} operations in the ${industry} industry.

## Tone
${customTone ? `You speak in a ${customTone} manner. ` : ''}Your overall tone is ${tone}.${personality ? `\n\n## Personality\n${personality}` : ''}

## Primary Functions
Your main responsibilities include:
${useCases.map(uc => `- ${uc.replace(/-/g, ' ')}`).join('\n')}

## Guidelines
1. Always prioritize ${businessName}'s goals and interests
2. Maintain professionalism while being ${tone}
3. Ask clarifying questions when needed
4. Provide accurate, helpful responses
5. Escalate complex issues to human operators when appropriate

## Capabilities
You can help with:
- Responding to inquiries about ${businessName}'s services
- Collecting and qualifying leads
- Scheduling appointments
- Providing product/service information
- Handling common objections
- Processing orders or requests

## Limitations
- Don't make promises about outcomes
- Don't access private data without authorization
- Don't make up information - say "I don't know" when appropriate

Remember: Your goal is to provide excellent ${tone} support while helping ${businessName} grow their business!
`;
    fs.writeFileSync(path.join(agentDir, 'src', 'prompts', 'system.md'), systemPrompt);

    // 6. Create src/tools/api.ts
    const apiTools = `/**
 * API Tools for ${botName}
 */

export const apiTools = {
  /**
   * Fetch customer data
   */
  async getCustomer(customerId: string) {
    // TODO: Connect to your CRM/database
    return { id: customerId, name: 'Sample Customer', email: 'customer@example.com' };
  },

  /**
   * Create a new lead
   */
  async createLead(data: { name: string; email: string; phone?: string }) {
    // TODO: Connect to your CRM
    console.log('Creating lead:', data);
    return { success: true, leadId: \`lead_\${Date.now()}\` };
  },

  /**
   * Schedule an appointment
   */
  async scheduleAppointment(customerId: string, date: string, time: string, notes?: string) {
    // TODO: Connect to calendar
    console.log('Scheduling:', { customerId, date, time, notes });
    return { success: true, appointmentId: \`apt_\${Date.now()}\` };
  },

  /**
   * Send notification
   */
  async sendNotification(to: string, message: string) {
    // TODO: Connect to email/SMS service
    console.log('Sending notification to:', to, 'message:', message);
    return { success: true };
  }
};

export default apiTools;
`;
    fs.writeFileSync(path.join(agentDir, 'src', 'tools', 'api.ts'), apiTools);

    // 7. Create Dockerfile
    const dockerfile = `FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY *.json ./
COPY tsconfig.json ./

# Build TypeScript (if needed)
RUN npm run build || true

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
`;
    fs.writeFileSync(path.join(agentDir, 'Dockerfile'), dockerfile);

    // 8. Create docker-compose.yml
    const dockerCompose = `version: '3.8'

services:
  ${agentSlug}:
    build: .
    container_name: ${agentSlug}
    ports:
      - "3${Math.floor(Math.random() * 900) + 100}:3000"
    environment:
      - NODE_ENV=production
      - AGENT_NAME=${botName}
      - BUSINESS_NAME=${businessName}
      - INDUSTRY=${industry}
      - FIELD=${field}
    restart: unless-stopped
    volumes:
      - agent-data:/app/data

volumes:
  agent-data:
`;
    fs.writeFileSync(path.join(agentDir, 'docker-compose.yml'), dockerCompose);

    // 9. Create .env.example
    const envExample = `# Agent Configuration
AGENT_NAME=${botName}
BUSINESS_NAME=${businessName}

# OpenAI / AI Provider
OPENAI_API_KEY=your_api_key_here

# Database (optional)
DATABASE_URL=postgresql://user:pass@localhost:5432/agent_db

# Integrations
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
WHATSAPP_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SENDGRID_API_KEY=

# Stripe (for payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Logging
LOG_LEVEL=info
`;
    fs.writeFileSync(path.join(agentDir, '.env.example'), envExample);

    // 10. Create README.md
    const readme = `# ${botName}

AI Agent for ${businessName}

## Description
- **Industry:** ${industry}
- **Function:** ${field}
- **Skill Level:** ${skillLevel}
- **Tone:** ${tone}${customTone ? ` (${customTone})` : ''}
- **Use Cases:** ${useCases.join(', ')}

## Interfaces
${interfaces.map(i => `- ${i}`).join('\n')}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure environment:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your API keys
   \`\`\`

3. Run locally:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Deploy with Docker:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

## Generated
This agent was automatically generated by the Agent Builder Dashboard on ${new Date().toISOString()}

## Configuration
See \`src/config.ts\` for all configuration options.
`;
    fs.writeFileSync(path.join(agentDir, 'README.md'), readme);

    // List created files
    const files = fs.readdirSync(agentDir, { recursive: true }).map(f => f.toString());

    return NextResponse.json({
      success: true,
      agentSlug,
      agentDir,
      files,
      message: `Agent "${botName}" generated successfully!`,
      config: { botName, businessName, industry, field, skillLevel, price: { basic: 49, intermediate: 99, advanced: 199, enterprise: 499 }[skillLevel] }
    });

  } catch (error: any) {
    console.error('Agent generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate agent', success: false },
      { status: 500 }
    );
  }
}