import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { Profile, University, EssayAnswers, EssayDraftResult } from '@/lib/types';
import { checkAndIncrementBudget } from '@/lib/token-budget';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, university, answers } = body as {
      profile: Partial<Profile>;
      university: University;
      answers: EssayAnswers;
    };

    if (!profile || !university || !answers) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const systemPrompt = `You are an expert admissions essay editor. Write a motivation letter draft in Russian based on the student's 4 answers to key essay questions.

Structure:
1. Вступление (Hook) — use the student's unique story
2. Путь (Journey) — how they discovered their passion
3. Почему этот вуз (Why Us) — specific reasons for this university
4. Будущее влияние (Future Impact) — what they plan to achieve

Requirements:
- Write in Russian
- Professional but warm tone suitable for a high school student
- 250-350 words
- Specific to ${university.name}
- Base ONLY on the provided answers, do not invent facts

Return ONLY the letter text, no additional commentary.`;

    const userMessage = `Студент подаёт в ${university.name} (${university.country}).
GPA: ${profile.gpa}, Специальности: ${(profile.specialties ?? []).join(', ')}.

Ответы на вопросы:
1. Хук (уникальная история): ${answers.hook}
2. Путь к специальности: ${answers.journey}
3. Почему этот вуз: ${answers.whyUs}
4. Будущее влияние: ${answers.futureImpact}`;

    if (!checkAndIncrementBudget().allowed) {
      return NextResponse.json({ result: buildFallbackDraft(university, profile, answers), source: 'fallback' });
    }
    try {
      const draftText = await callClaude(systemPrompt, userMessage, 900);
      const wordCount = draftText.split(/\s+/).filter(Boolean).length;
      const result: EssayDraftResult = {
        draft: draftText,
        wordCount,
        suggestions: [
          'Проверьте письмо на грамматику и пунктуацию',
          'Попросите учителя или ментора прочитать черновик',
          'Убедитесь, что письмо отражает вашу уникальную историю',
        ],
      };
      return NextResponse.json({ result, source: 'ai' }, { status: 200 });
    } catch (aiError) {
      console.warn('Claude API failed in /api/essay-draft, using fallback:', aiError);

      const fallbackDraft = `Уважаемая приёмная комиссия ${university.name}!

${answers.hook}

Мой путь к выбору специальности начался с того, что ${answers.journey}

Я выбираю именно ${university.name}, потому что ${answers.whyUs}

После окончания университета я планирую ${answers.futureImpact}

Мой средний балл составляет ${profile.gpa}${profile.ielts ? `, уровень IELTS — ${profile.ielts}` : ''}. Я уверен(а), что мой академический опыт и мотивация позволят мне успешно учиться в вашем университете.

С уважением,
Абитуриент`;

      const wordCount = fallbackDraft.split(/\s+/).filter(Boolean).length;
      const result: EssayDraftResult = {
        draft: fallbackDraft,
        wordCount,
        suggestions: [
          'ИИ-генерация временно недоступна — это шаблонный черновик',
          'Доработайте каждый абзац, добавив конкретные детали',
          'Попросите учителя помочь с редактурой',
        ],
      };
      return NextResponse.json({ result, source: 'fallback' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in /api/essay-draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function buildFallbackDraft(university: University, profile: Partial<Profile>, answers: EssayAnswers): EssayDraftResult {
  const draft = `Уважаемая приёмная комиссия ${university.name}!\n\n${answers.hook}\n\nМой путь к выбору специальности начался с того, что ${answers.journey}\n\nЯ выбираю именно ${university.name}, потому что ${answers.whyUs}\n\nПосле окончания университета я планирую ${answers.futureImpact}\n\nС уважением,\nАбитуриент`;
  return { draft, wordCount: draft.split(/\s+/).filter(Boolean).length, suggestions: ['ИИ-генерация временно недоступна — это шаблонный черновик', 'Добавьте конкретные детали', 'Попросите учителя помочь с редактурой'] };
}
