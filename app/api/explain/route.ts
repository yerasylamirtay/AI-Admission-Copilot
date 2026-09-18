import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { Profile, University } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, university, tier } = body as { profile: Profile; university: University; tier: string };

    if (!profile || !university || !tier) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const systemPrompt = `You are an education counselor. Explain to a high school student in simple, friendly language (2-3 sentences in Russian) why university ${university.name} falls into the ${tier} category for them. Base your explanation ONLY on these facts: GPA ${profile.gpa}, IELTS ${profile.ielts || 'N/A'}, budget ${profile.budget}, university requirements (GPA ${university.gpaReq}, IELTS ${university.ieltsReq}). Do not invent data.`;
    const userMessage = "Пожалуйста, объясни.";

    try {
      const explanation = await callClaude(systemPrompt, userMessage, 300);
      return NextResponse.json({ explanation, source: 'ai' }, { status: 200 });
    } catch (aiError) {
      console.warn('Claude API failed in /api/explain, using fallback:', aiError);
      
      // Fallback
      const fallback = `Университет ${university.name} отнесен к категории ${tier}, так как ваш средний балл (${profile.gpa}) и уровень английского (${profile.ielts || 'не сдан'}) сравнимы с их требованиями (GPA: ${university.gpaReq || 'нет'}, IELTS: ${university.ieltsReq || 'нет'}). Бюджет и другие факторы также были учтены.`;
      
      return NextResponse.json({ explanation: fallback, source: 'fallback' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in /api/explain:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
