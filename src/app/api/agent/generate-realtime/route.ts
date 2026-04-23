/**
 * POST /api/agent/generate-realtime
 * Spawn OpenClaw sub-agent to generate client agent in real-time
 */

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
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

    // Generate the agent using openclaw command
    const prompt = `Generate a complete AI agent for ${businessName} with the following specifications:

- Bot Name: ${botName}
- Industry: ${industry}
- Primary Field: ${field}
- Use Cases: ${useCases.join(', ')}
- Tone: ${tone}
- Interfaces: ${interfaces.join(', ')}
- Skill Level: ${skillLevel}
- Integrations: ${Object.entries(integrations).filter(([_, v]) => v).map(([k]) => k).join(', ')}

Create the following files in ${agentDir}:

1. src/index.ts - Main entry point with OpenClaw agent configuration
2. src/config.ts - Agent configuration with all settings
3. src/prompts/system.md - System prompt defining the agent's role and behavior
4. src/tools/api.ts - API tools the agent can use
5. src/tools/database.ts - Database tools if needed
6. package.json - Dependencies for the agent
7. Dockerfile - Container configuration
8. docker-compose.yml - Deployment config
9. .env.example - Environment variables template
10. README.md - Documentation

Use the OpenClaw framework. Make it production-ready with proper error handling, TypeScript types, and configuration options. The agent should be designed for ${field} operations in the ${industry} industry.

After creating the files, provide a summary of what was created.`;

    // Spawn openclaw to generate the agent
    const openclawProcess = spawn('openclaw', ['--prompt', prompt], {
      cwd: agentDir,
      shell: true
    });

    // Collect output
    let output = '';
    
    openclawProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    openclawProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    // Wait for process with timeout
    const result = await new Promise<{code: number, output: string}>((resolve) => {
      openclawProcess.on('close', (code) => {
        resolve({ code: code || 0, output });
      });
      // Timeout after 5 minutes
      setTimeout(() => {
        openclawProcess.kill();
        resolve({ code: 1, output: output + '\n[TIMEOUT] Generation took too long' });
      }, 300000);
    });

    // List created files
    const files = fs.existsSync(agentDir) 
      ? fs.readdirSync(agentDir, { recursive: true }).map(f => f.toString())
      : [];

    return NextResponse.json({
      success: result.code === 0,
      agentSlug,
      agentDir,
      output: result.output,
      files,
      message: `Agent "${botName}" generated successfully!`
    });

  } catch (error: any) {
    console.error('Agent generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate agent' },
      { status: 500 }
    );
  }
}