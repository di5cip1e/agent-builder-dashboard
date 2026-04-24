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
import { config } from './config';

// Agent configuration - loaded from config.ts
const agentConfig = {
  name: config.botName,
  description: config.businessName + ' - ' + config.field + ' agent',
  model: config.skillLevel === 'enterprise' ? 'openrouter/claude-sonnet-4' 
    : config.skillLevel === 'advanced' ? 'openrouter/claude-3-opus' 
    : 'openrouter/claude-3-haiku',
  maxTokens: config.skillLevel === 'basic' ? 2048 
    : config.skillLevel === 'intermediate' ? 4096 
    : config.skillLevel === 'advanced' ? 8192 
    : 16384,
  temperature: 0.7,
  systemPrompt: 'See src/prompts/system.md',
  tools: [],
  integrations: config.integrations
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

    // Generate web app if selected
    if (interfaces.includes('web-app') || interfaces.includes('web-widget')) {
      const webAppDir = path.join(agentDir, 'web-app');
      fs.mkdirSync(webAppDir, { recursive: true });
      fs.mkdirSync(path.join(webAppDir, 'src'), { recursive: true });

      // package.json for web app
      const webPackageJson = {
        name: `${agentSlug}-web`,
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start'
        },
        dependencies: {
          next: '^14.0.0',
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          typescript: '^5.0.0',
          tailwindcss: '^3.4.0',
          autoprefixer: '^10.4.0',
          postcss: '^8.4.0'
        }
      };
      fs.writeFileSync(path.join(webAppDir, 'package.json'), JSON.stringify(webPackageJson, null, 2));

      // Next.js config
      const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    AGENT_NAME: '${botName}',
    BUSINESS_NAME: '${businessName}',
    AGENT_API_URL: 'http://localhost:3000'
  }
};
module.exports = nextConfig;`;
      fs.writeFileSync(path.join(webAppDir, 'next.config.js'), nextConfig);

      // Main page with chat interface
      const pageHtml = `'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\\'m ${botName}. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">${botName}</h1>
            <p className="text-sm text-slate-400">${businessName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 h-[calc(100vh-180px)]">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                <div className={\`max-w-[80%] rounded-2xl p-4 \${
                  msg.role === 'user' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-slate-700 text-white'
                }\`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 px-6 py-3 rounded-xl font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}`;
      fs.writeFileSync(path.join(webAppDir, 'src', 'app', 'page.tsx'), pageHtml);

      // layout.tsx
      const layoutHtml = `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
      fs.mkdirSync(path.join(webAppDir, 'src', 'app'));
      fs.writeFileSync(path.join(webAppDir, 'src', 'app', 'layout.tsx'), layoutHtml);

      // globals.css
      const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #6366f1;
  --secondary: #22d3ee;
}

body {
  background: #0f172a;
  color: #f8fafc;
}`;
      fs.writeFileSync(path.join(webAppDir, 'src', 'app', 'globals.css'), globalsCss);

      // tailwind.config.js
      const tailwindConfig = `module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: []
}`;
      fs.writeFileSync(path.join(webAppDir, 'tailwind.config.js'), tailwindConfig);
    }

    // Generate mobile app if selected
    if (interfaces.includes('mobile-app')) {
      const mobileDir = path.join(agentDir, 'mobile-app');
      fs.mkdirSync(mobileDir, { recursive: true });

      // Basic React Native app structure would go here
      // For now, create a placeholder with setup instructions
      const readme = `# ${botName} Mobile App

## Setup
1. Install Expo: \`npm install -g expo-cli\`
2. Navigate to this directory
3. Run: \`expo start\`

The mobile app connects to your agent API for real-time chat.

## Features
- Real-time chat with ${botName}
- Push notifications (configure Firebase)
- Offline message caching
- Deep linking support
`;
      fs.writeFileSync(path.join(mobileDir, 'README.md'), readme);
    }

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