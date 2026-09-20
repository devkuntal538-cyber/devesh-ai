import { NextResponse } from 'next/server';
import { modelRegistry, providerConfigured } from '@/lib/models';

export async function GET() {
  return NextResponse.json({
    models: modelRegistry.map((model) => ({ ...model, configured: providerConfigured(model.provider) })),
  });
}
