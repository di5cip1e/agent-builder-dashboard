/**
 * Agent Generator - Core logic for scaffolding agent directories on disk
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Agent,
  AgentConfig,
  AgentStatus,
  GenerationRequest,
  GenerationResponse
} from '@/types/agent';
import { getPortManager } from './port-manager';
import {
  generateDockerfile,
  generateDockerCompose,
  generatePackageJson,
  generateTsConfig,
  generateEnvExample,
  generateReadme,
  generateIndexTs,
  generateConfigTs
} from './docker-templates';

const AGENTS_BASE_PATH = '/opt/agents';
const AGENTS_REGISTRY_FILE = '/opt/agents/.registry.json';

interface AgentRegistry {
  agents: Agent[];
}

class AgentGenerator {
  private registry: AgentRegistry;

  constructor() {
    this.registry = this.loadRegistry();
  }

  private loadRegistry(): AgentRegistry {
    try {
      if (fs.existsSync(AGENTS_REGISTRY_FILE)) {
        const data = fs.readFileSync(AGENTS_REGISTRY_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load agent registry:', error);
    }
    return { agents: [] };
  }

  private saveRegistry(): void {
    try {
      if (!fs.existsSync(AGENTS_BASE_PATH)) {
        fs.mkdirSync(AGENTS_BASE_PATH, { recursive: true });
      }
      fs.writeFileSync(AGENTS_REGISTRY_FILE, JSON.stringify(this.registry, null, 2));
    } catch (error) {
      console.error('Failed to save agent registry:', error);
      throw error;
    }
  }

  /**
   * Start agent generation process
   */
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const { clientName, clientSlug, config } = request;

    // Check if agent already exists
    const existing = this.registry.agents.find(a => a.slug === clientSlug);
    if (existing) {
      return {
        id: existing.id,
        status: existing.status,
        message: `Agent '${clientSlug}' already exists`
      };
    }

    // Create new agent
    const id = uuidv4();
    const agent: Agent = {
      id,
      slug: clientSlug,
      name: `${clientName} Agent`,
      clientName,
      status: 'generating',
      port: 0, // Will be allocated during generation
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to registry
    this.registry.agents.push(agent);
    this.saveRegistry();

    // Start generation in background
    this.performGeneration(agent).catch(err => {
      console.error(`Generation failed for agent ${id}:`, err);
      this.updateAgentStatus(id, 'error', err.message);
    });

    return {
      id,
      status: 'generating',
      message: 'Agent generation started'
    };
  }

  /**
   * Perform the actual directory scaffolding
   */
  private async performGeneration(agent: Agent): Promise<void> {
    try {
      const agentPath = path.join(AGENTS_BASE_PATH, agent.slug);
      
      // Allocate port
      const portManager = getPortManager();
      const port = portManager.allocate(agent.id, agent.slug);
      
      // Update agent with port
      agent.port = port;
      agent.status = 'generating';
      agent.updatedAt = new Date().toISOString();
      this.saveRegistry();

      // Create directory structure
      this.ensureDirectory(agentPath);
      this.ensureDirectory(path.join(agentPath, 'src'));
      this.ensureDirectory(path.join(agentPath, 'src', 'prompts'));
      this.ensureDirectory(path.join(agentPath, 'src', 'tools'));

      // Generate template variables
      const templateVars = {
        PORT: port.toString(),
        CLIENT_SLUG: agent.slug,
        CLIENT_NAME: agent.clientName,
        NODE_VERSION: '20',
        AGENT_CONFIG: JSON.stringify(agent.config).replace(/"/g, '\\"')
      };

      // Write files
      this.writeFile(path.join(agentPath, 'Dockerfile'), generateDockerfile(templateVars));
      this.writeFile(path.join(agentPath, 'docker-compose.yml'), generateDockerCompose(templateVars));
      this.writeFile(path.join(agentPath, 'package.json'), generatePackageJson(agent.slug, agent.clientName));
      this.writeFile(path.join(agentPath, 'tsconfig.json'), generateTsConfig());
      this.writeFile(path.join(agentPath, '.env.example'), generateEnvExample());
      this.writeFile(path.join(agentPath, 'README.md'), generateReadme(agent.slug, agent.clientName, agent.config));
      this.writeFile(path.join(agentPath, 'src', 'index.ts'), generateIndexTs(agent.config, agent.slug));
      this.writeFile(path.join(agentPath, 'src', 'config.ts'), generateConfigTs(agent.config, agent.slug));
      
      // Generate system prompt
      const systemPrompt = this.generateSystemPrompt(agent.config);
      this.writeFile(path.join(agentPath, 'src', 'prompts', 'system.md'), systemPrompt);

      // Generate tool stubs based on deployment interfaces
      const tools = this.generateToolStubs(agent.config);
      tools.forEach(tool => {
        this.writeFile(path.join(agentPath, 'src', 'tools', tool.filename), tool.content);
      });

      // Update status to ready
      agent.status = 'ready';
      agent.updatedAt = new Date().toISOString();
      this.saveRegistry();

    } catch (error: any) {
      agent.status = 'error';
      agent.error = error.message;
      agent.updatedAt = new Date().toISOString();
      this.saveRegistry();
      throw error;
    }
  }

  private ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private writeFile(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  /**
   * Generate system prompt based on config
   */
  private generateSystemPrompt(config: AgentConfig): string {
    const industryDescriptions: Record<string, string> = {
      healthcare: 'You are assisting with healthcare-related inquiries. Always maintain HIPAA compliance awareness and suggest consulting professionals for medical advice.',
      finance: 'You are assisting with financial matters. Provide general information only and always recommend consulting qualified financial advisors for investment decisions.',
      legal: 'You are assisting with legal inquiries. Provide general information only and always recommend consulting licensed attorneys for legal advice.',
      ecommerce: 'You are helping with e-commerce operations including product inquiries, orders, and customer support.',
      marketing: 'You are assisting with marketing tasks including content creation, campaign management, and customer engagement.',
      hr: 'You are helping with human resources functions including employee inquiries, policy information, and HR processes.',
      'real-estate': 'You are assisting with real estate inquiries including property information, scheduling viewings, and market information.',
      custom: 'You are a custom AI assistant.'
    };

    const toneInstructions: Record<string, string> = {
      professional: 'Communicate in a professional, business-like manner.',
      friendly: 'Be warm, approachable, and friendly in your responses.',
      casual: 'Keep conversations casual and relaxed.',
      technical: 'Use precise, technical language appropriate for technical users.',
      authoritative: 'Provide confident, definitive answers with authority.',
      custom: 'Adapt your communication style as specified.'
    };

    const fieldInstructions: Record<string, string> = {
      'customer-service': 'Focus on resolving customer issues, answering questions, and providing excellent support.',
      'data-entry': 'Accurately capture and organize data, verify information, and maintain data integrity.',
      analytics: 'Analyze data, identify patterns, and provide insights and recommendations.',
      scheduling: 'Manage appointments, coordinate schedules, and handle calendar-related requests.',
      sales: 'Identify leads, nurture relationships, and guide prospects through the sales process.',
      support: 'Provide technical support, troubleshoot issues, and guide users through solutions.',
      research: 'Gather information, analyze findings, and present comprehensive research results.',
      custom: 'Adapt to the specific custom field requirements.'
    };

    let prompt = '# System Prompt\n\n';
    prompt += industryDescriptions[config.industry] || industryDescriptions.custom;
    prompt += '\n\n';
    prompt += toneInstructions[config.toneOfVoice] || toneInstructions.professional;
    prompt += '\n\n';
    prompt += fieldInstructions[config.operationalField] || fieldInstructions.custom;
    prompt += '\n\n';

    // Add use case instructions
    const selectedUseCases = config.useCases.filter(u => u.selected);
    if (selectedUseCases.length > 0) {
      prompt += '## Primary Use Cases\n\n';
      selectedUseCases.forEach(uc => {
        prompt += `- ${uc.label}\n`;
      });
      prompt += '\n';
    }

    // Add deployment interface context
    prompt += '## Deployment Interfaces\n\n';
    prompt += `This agent is configured to work through: ${config.deploymentInterfaces.join(', ')}\n\n`;
    
    prompt += '## Guidelines\n\n';
    prompt += '- Always prioritize user privacy and data security\n';
    prompt += '- Provide clear, accurate information\n';
    prompt += '- When uncertain, acknowledge limitations\n';
    prompt += '- Escalate complex issues to human operators when appropriate\n';

    return prompt;
  }

  /**
   * Generate tool stub files based on deployment interfaces
   */
  private generateToolStubs(config: AgentConfig): Array<{ filename: string; content: string }> {
    const tools: Array<{ filename: string; content: string }> = [];

    if (config.deploymentInterfaces.includes('api-endpoint')) {
      tools.push({
        filename: 'api-tool.ts',
        content: `/**
 * API Tool - Handles direct API endpoint interactions
 */

export interface ApiToolConfig {
  baseUrl?: string;
  timeout?: number;
}

export class ApiTool {
  private config: ApiToolConfig;

  constructor(config: ApiToolConfig = {}) {
    this.config = config;
  }

  async call(prompt: string, context: any): Promise<any> {
    // API tool implementation
    return { success: true, message: 'API tool ready' };
  }
}

export default ApiTool;
`
      });
    }

    if (config.deploymentInterfaces.includes('slack-bot')) {
      tools.push({
        filename: 'slack-tool.ts',
        content: `/**
 * Slack Bot Tool - Handles Slack messaging and interactions
 */

export interface SlackToolConfig {
  botToken?: string;
  signingSecret?: string;
  defaultChannel?: string;
}

export class SlackTool {
  private config: SlackToolConfig;

  constructor(config: SlackToolConfig = {}) {
    this.config = config;
  }

  async sendMessage(channel: string, message: string): Promise<any> {
    // Slack integration implementation
    return { success: true, channel, message };
  }

  async handleSlashCommand(command: string, args: string): Promise<any> {
    // Slash command handler
    return { success: true, command, args };
  }
}

export default SlackTool;
`
      });
    }

    if (config.deploymentInterfaces.includes('web-widget')) {
      tools.push({
        filename: 'web-widget-tool.ts',
        content: `/**
 * Web Widget Tool - Handles embedded widget interactions
 */

export interface WidgetConfig {
  widgetId?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
}

export class WebWidgetTool {
  private config: WidgetConfig;

  constructor(config: WidgetConfig = {}) {
    this.config = config;
  }

  async processWidgetMessage(userId: string, message: string): Promise<any> {
    // Web widget message handler
    return { success: true, userId, message };
  }
}

export default WebWidgetTool;
`
      });
    }

    // Always add a base tool
    tools.push({
      filename: 'base-tool.ts',
      content: `/**
 * Base Tool - Core functionality for the agent
 */

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class BaseTool {
  name = 'base';

  async execute(action: string, params: any): Promise<ToolResult> {
    try {
      switch (action) {
        case 'greet':
          return { success: true, data: { message: \`Hello, \${params.name || 'there'}!\` } };
        case 'help':
          return { success: true, data: { commands: ['greet', 'help', 'status'] } };
        case 'status':
          return { success: true, data: { status: 'operational' } };
        default:
          return { success: false, error: \`Unknown action: \${action}\` };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default BaseTool;
`
    });

    return tools;
  }

  /**
   * Get agent status
   */
  getStatus(agentId: string): Agent | null {
    return this.registry.agents.find(a => a.id === agentId) || null;
  }

  /**
   * Get agent by slug
   */
  getBySlug(slug: string): Agent | null {
    return this.registry.agents.find(a => a.slug === slug) || null;
  }

  /**
   * List all agents
   */
  listAgents(): Agent[] {
    return [...this.registry.agents];
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId: string, status: AgentStatus, error?: string): void {
    const agent = this.registry.agents.find(a => a.id === agentId);
    if (agent) {
      agent.status = status;
      agent.error = error;
      agent.updatedAt = new Date().toISOString();
      this.saveRegistry();
    }
  }

  /**
   * Delete an agent
   */
  deleteAgent(agentId: string): boolean {
    const agent = this.registry.agents.find(a => a.id === agentId);
    if (!agent) {
      return false;
    }

    // Release port
    const portManager = getPortManager();
    portManager.release(agentId);

    // Remove from registry
    this.registry.agents = this.registry.agents.filter(a => a.id !== agentId);
    this.saveRegistry();

    // Optionally delete files (commented out to preserve data)
    // const agentPath = path.join(AGENTS_BASE_PATH, agent.slug);
    // if (fs.existsSync(agentPath)) {
    //   fs.rmSync(agentPath, { recursive: true, force: true });
    // }

    return true;
  }

  /**
   * Get agent directory path
   */
  getAgentPath(slug: string): string {
    return path.join(AGENTS_BASE_PATH, slug);
  }
}

// Singleton instance
let agentGeneratorInstance: AgentGenerator | null = null;

export function getAgentGenerator(): AgentGenerator {
  if (!agentGeneratorInstance) {
    agentGeneratorInstance = new AgentGenerator();
  }
  return agentGeneratorInstance;
}

export { AgentGenerator };