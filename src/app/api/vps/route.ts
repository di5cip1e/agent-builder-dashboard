/**
 * VPS Management API
 * Add/remove/list VPS servers for agent hosting
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VPS_FILE = '/root/.openclaw/workspace/agent-builder-dashboard/data/vps-servers.json';

// Ensure data directory exists
const dataDir = path.dirname(VPS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if doesn't exist
if (!fs.existsSync(VPS_FILE)) {
  fs.writeFileSync(VPS_FILE, JSON.stringify([], null, 2));
}

function getVPSList() {
  try {
    return JSON.parse(fs.readFileSync(VPS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveVPSList(list: any[]) {
  fs.writeFileSync(VPS_FILE, JSON.stringify(list, null, 2));
}

// GET - List all VPS servers
export async function GET() {
  const vpsList = getVPSList();
  return NextResponse.json({ vps: vpsList });
}

// POST - Add new VPS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip, name, sshUser = 'root', sshKey = '/root/.ssh/deploy_key' } = body;

    if (!ip) {
      return NextResponse.json({ error: 'IP address required' }, { status: 400 });
    }

    const vpsList = getVPSList();
    
    // Check if already exists
    if (vpsList.find((v: any) => v.ip === ip)) {
      return NextResponse.json({ error: 'VPS already registered' }, { status: 400 });
    }

    const newVPS = {
      id: `vps_${Date.now()}`,
      ip,
      name: name || ip,
      sshUser,
      sshKey,
      status: 'unknown',
      agentCount: 0,
      createdAt: new Date().toISOString()
    };

    vpsList.push(newVPS);
    saveVPSList(vpsList);

    return NextResponse.json({ 
      success: true, 
      vps: newVPS,
      message: `VPS ${ip} added successfully`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove VPS
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');

  if (!ip) {
    return NextResponse.json({ error: 'IP required' }, { status: 400 });
  }

  const vpsList = getVPSList();
  const filtered = vpsList.filter((v: any) => v.ip !== ip);
  
  if (filtered.length === vpsList.length) {
    return NextResponse.json({ error: 'VPS not found' }, { status: 404 });
  }

  saveVPSList(filtered);
  return NextResponse.json({ success: true, message: `VPS ${ip} removed` });
}