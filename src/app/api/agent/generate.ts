/**
 * POST /api/agent/generate
 * Start agent generation process
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentGenerator } from '@/lib/agent-generator';
import { GenerationRequest, AgentConfig } from '@/types/agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.clientName || !body.clientSlug || !body.config) {
      return NextResponse.json(
        { error: 'Missing required fields: clientName, clientSlug, config' },
        { status: 400 }
      );
    }

    // Validate config
    const config: AgentConfig = body.config;
    if (!config.industry || !config.operationalField || !config.toneOfVoice) {
      return NextResponse.json(
        { error: 'Invalid config: must include industry, operationalField, and toneOfVoice' },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric with hyphens)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(body.clientSlug)) {
      return NextResponse.json(
        { error: 'Invalid slug: must be lowercase alphanumeric with hyphens' },
        { status: 400 }
      );
    }

    const requestData: GenerationRequest = {
      clientName: body.clientName,
      clientSlug: body.clientSlug.toLowerCase(),
      config
    };

    const generator = getAgentGenerator();
    const result = await generator.generate(requestData);

    return NextResponse.json(result, { status: 202 });
  } catch (error: any) {
    console.error('Agent generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start agent generation' },
      { status: 500 }
    );
  }
}