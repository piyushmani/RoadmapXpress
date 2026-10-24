import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    server: 'healthy';
    database: {
      status: 'connected' | 'disconnected' | 'not_configured';
      latencyMs?: number;
      error?: string;
    };
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const strict = searchParams.get('strict') === 'true';

  let dbStatus: 'connected' | 'disconnected' | 'not_configured' = 'not_configured';
  let latencyMs: number | undefined;
  let dbError: string | undefined;

  const client = getSupabaseServerClient();

  if (client) {
    const start = Date.now();
    try {
      const { error } = await client
        .from('roadmaps')
        .select('id', { head: true, count: 'exact' })
        .limit(1);

      if (error) {
        dbStatus = 'disconnected';
        dbError = error.message;
      } else {
        dbStatus = 'connected';
        latencyMs = Date.now() - start;
      }
    } catch (err: any) {
      dbStatus = 'disconnected';
      dbError = err?.message || 'Unknown database connection error';
    }
  }

  const isHealthy = dbStatus === 'connected' || dbStatus === 'not_configured';
  const overallStatus = isHealthy ? 'ok' : 'degraded';

  const body: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
    services: {
      server: 'healthy',
      database: {
        status: dbStatus,
        ...(latencyMs !== undefined ? { latencyMs } : {}),
        ...(dbError ? { error: dbError } : {}),
      },
    },
  };

  const httpStatus = strict && !isHealthy ? 503 : 200;

  return NextResponse.json(body, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
