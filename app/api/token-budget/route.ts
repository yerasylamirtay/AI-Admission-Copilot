import { NextResponse } from 'next/server';
import { getTokenBudget } from '@/lib/token-budget';

export async function GET() {
  return NextResponse.json(getTokenBudget());
}
