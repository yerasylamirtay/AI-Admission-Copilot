import { NextRequest, NextResponse } from 'next/server';
import { Profile, DiagnoseResult } from '@/lib/types';
import { diagnoseProfile } from '@/lib/diagnose-engine';
import { callClaude } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const profile: Profile = await req.json();

    // 1. Calculate deterministic rule-based readiness index
    const baseDiagnosis: DiagnoseResult = diagnoseProfile(profile);

    // 2. Call AI to generate human-readable synthesis
    const systemPrompt = `Ты — ведущий эксперт по международному поступлению.
Твоя задача — проанализировать профиль абитуриента и рассчитанный индекс готовности, затем сформировать емкое, мотивирующее и точное резюме.

ФОРМАТ ОТВЕТА (строго JSON):
{
  "summary": "2-3 предложения общего саммари текущего положения абитуриента",
  "strengths": [
    "Сильная сторона 1",
    "Сильная сторона 2",
    "Сильная сторона 3"
  ],
  "constraints": [
    "Ограничение или точка роста 1",
    "Ограничение или точка роста 2"
  ],
  "goal": "Четкая формулировка образовательной цели одним предложением"
}

Никакого другого текста вокруг JSON.`;

    const userMessage = `Профиль абитуриента:
- Класс: ${profile.grade || '11'}
- Интересы: ${(profile.interests || []).join(', ') || 'IT, Инженерия'}
- GPA: ${profile.gpa || 4.5} (шкала: ${profile.gpaScale || '5.0'})
- Языки: ${(profile.languages || []).join(', ') || 'Русский, Английский'}
- Экзамены: ${JSON.stringify(profile.exams || {})}
- Желаемые страны: ${(profile.countries || []).join(', ') || 'Казахстан, США, Европа'}
- Бюджет: ${profile.budget || 'грант'}
- Сроки: ${profile.timeline || '2025'}
- Ограничения: ${profile.constraints || 'нет'}
- Рассчитанный индекс готовности: ${baseDiagnosis.readinessIndex}% (уровень: ${baseDiagnosis.tier})`;

    const tierWording: Record<string, string> = {
      high: 'Сильный профиль с хорошими шансами на целевые и амбициозные программы.',
      medium: 'Средний по готовности профиль — с точечной доработкой шансы вырастут заметно.',
      low: 'Профиль пока в начале пути — есть конкретные точки роста, которые стоит закрыть в первую очередь.',
    };

    let aiSummary = {
      summary: `Профиль абитуриента с индексом готовности ${baseDiagnosis.readinessIndex}%. ${tierWording[baseDiagnosis.tier] || tierWording.medium}`,
      strengths: profile.gpa
        ? [`GPA ${profile.gpa} — используется как основа расчёта`]
        : [`Базовые данные учтены в расчёте`],
      constraints: [
        `Часть данных ещё не подтверждена — заполни профиль подробнее для более точного расчёта`,
      ],
      goal: `Поступление на программу бакалавриата${(profile.interests || [])[0] ? ` по направлению ${profile.interests![0]}` : ''}.`
    };

    try {
      const claudeResponse = await callClaude(systemPrompt, userMessage, 400);
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiSummary = {
          summary: parsed.summary || aiSummary.summary,
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : aiSummary.strengths,
          constraints: Array.isArray(parsed.constraints) ? parsed.constraints : aiSummary.constraints,
          goal: parsed.goal || aiSummary.goal,
        };
      }
    } catch (aiErr: any) {
      console.warn('Claude diagnosis synthesis failed, using fallback summary:', aiErr.message);
    }

    const diagnosis: DiagnoseResult = {
      ...baseDiagnosis,
      summary: aiSummary.summary,
      strengths: aiSummary.strengths,
      constraints: aiSummary.constraints,
      goal: aiSummary.goal,
    };

    return NextResponse.json({ diagnosis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Diagnosis failed' }, { status: 500 });
  }
}
