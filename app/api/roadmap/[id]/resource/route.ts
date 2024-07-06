import { NextResponse, type NextRequest } from 'next/server';

import { adminClient } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {

  const serachParams = request.nextUrl.searchParams;
  const resourceId = serachParams.get("resourceId");
  if (resourceId) {
    let { data, error } = await adminClient.from('public_resources')
      .select().eq('resource_id', resourceId);

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { data: data[0].contents },
      {
        status: 200
      }
    );
  }
  else {
    const { data, error } = await adminClient
      .from('public_resources')
      .select().eq('roadmap_id', parseInt(params.id) );
    
    if (error) {
      return NextResponse.json(
        { error: 'Error fetching resources' },
        { status: 500 }
      );
    }  
    return NextResponse.json(
      { data: data },
      {
        status: 200
      }
    );
  }
}