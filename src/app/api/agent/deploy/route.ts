/**
 * Agent Deployment API
 * Deploys generated agents to remote VPS servers
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DeployRequest {
  agentSlug: string;
  remoteHost: string;
  sshKey?: string;
  sshUser?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DeployRequest = await request.json();
    const { agentSlug, remoteHost, sshUser = 'root', sshKey = '/root/.ssh/deploy_key' } = body;

    if (!agentSlug || !remoteHost) {
      return NextResponse.json(
        { error: 'agentSlug and remoteHost are required' },
        { status: 400 }
      );
    }

    // Validate agent exists
    const agentDir = `/opt/agents/${agentSlug}`;
    const fs = require('fs');
    if (!fs.existsSync(agentDir)) {
      return NextResponse.json(
        { error: `Agent ${agentSlug} not found` },
        { status: 404 }
      );
    }

    // Check SSH connectivity
    const checkSsh = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${sshUser}@${remoteHost} "echo OK"`;
    
    try {
      await execAsync(checkSsh);
    } catch (error) {
      return NextResponse.json(
        { error: `Cannot connect to ${remoteHost} via SSH` },
        { status: 500 }
      );
    }

    // Deploy command
    const deployCmd = `cd /root/.openclaw/workspace/agent-builder-dashboard/scripts/deployment && ./deploy.sh ${agentSlug} ${remoteHost} deploy`;
    
    let output = '';
    try {
      const result = await execAsync(deployCmd, { timeout: 120000 });
      output = result.stdout + result.stderr;
    } catch (error: any) {
      output = error.stdout || error.message || String(error);
    }

    return NextResponse.json({
      success: true,
      message: `Agent ${agentSlug} deployed to ${remoteHost}`,
      output,
      url: `http://${remoteHost}:3001`
    });

  } catch (error: any) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      { error: error.message || 'Deployment failed' },
      { status: 500 }
    );
  }
}

// Get deployment status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const remoteHost = searchParams.get('host');
  const agentSlug = searchParams.get('agent');

  if (!remoteHost || !agentSlug) {
    return NextResponse.json(
      { error: 'host and agent parameters required' },
      { status: 400 }
    );
  }

  try {
    const { execSync } = require('child_process');
    const status = execSync(
      `ssh -o ConnectTimeout=5 root@${remoteHost} "pm2 describe ${agentSlug} 2>/dev/null || echo 'not_found'"`,
      { encoding: 'utf8' }
    );

    const isRunning = status.includes('online');
    const isStopped = status.includes('stopped') || status.includes('not_found');

    return NextResponse.json({
      agent: agentSlug,
      host: remoteHost,
      status: isRunning ? 'running' : isStopped ? 'stopped' : 'unknown',
      details: status.substring(0, 500)
    });
  } catch (error) {
    return NextResponse.json({
      agent: agentSlug,
      host: remoteHost,
      status: 'unreachable'
    });
  }
}