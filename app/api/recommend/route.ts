import { NextResponse } from 'next/server';
import { recommendUniversities } from '@/lib/recommend-engine';
import { Profile, DiagnoseResult } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile = body.profile as Profile;
    const diagnosis = body.diagnosis as DiagnoseResult;

    if (!profile || !diagnosis) {
      return NextResponse.json({ error: 'Missing profile or diagnosis data' }, { status: 400 });
    }

    const recommendations = recommendUniversities(profile, diagnosis);

    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/recommend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
