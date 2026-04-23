/**
 * GET /api/agent/list
 * List all generated agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentGenerator } from '@/lib/agent-generator';

export async function GET(request: NextRequest) {
  try {
    const generator = getAgentGenerator();
    const agents = generator.listAgents();

    // Optional filtering by status
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let filteredAgents = agents;
    if (status) {
      filteredAgents = agents.filter(a => a.status === status);
    }

    const response = filteredAgents.map(agent => ({
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      clientName: agent.clientName,
      status: agent.status,
      port: agent.port,
      domain: agent.domain,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      industry: agent.config.industry,
      operationalField: agent.config.operationalField,
      deploymentInterfaces: agent.config.deploymentInterfaces
    }));

    return NextResponse.json({
      agents: response,
      total: response.length
    });
  } catch (error: any) {
    console.error('List agents error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list agents' },
      { status: 500 }
    );
  }
}