import { NextResponse } from 'next/server';
import { diagnoseProfile } from '@/lib/diagnose-engine';
import { Profile } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile = body as Profile;

    if (!profile || typeof profile.gpa !== 'number') {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }

    const diagnosis = diagnoseProfile(profile);

    return NextResponse.json({ diagnosis }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/diagnose:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
