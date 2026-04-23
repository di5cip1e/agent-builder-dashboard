/**
 * GET /api/agent/status/[id]
 * Get agent generation status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentGenerator } from '@/lib/agent-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const generator = getAgentGenerator();
    const agent = generator.getStatus(id);

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      status: agent.status,
      port: agent.port,
      domain: agent.domain,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      error: agent.error,
      config: {
        industry: agent.config.industry,
        operationalField: agent.config.operationalField,
        toneOfVoice: agent.config.toneOfVoice,
        deploymentInterfaces: agent.config.deploymentInterfaces
      }
    });
  } catch (error: any) {
    console.error('Get status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get agent status' },
      { status: 500 }
    );
  }
}