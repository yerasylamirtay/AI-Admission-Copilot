import { NextRequest, NextResponse } from 'next/server';
import { callClaudeMessages } from '@/lib/claude';

// This endpoint is the reliable fallback for "Завершить" — instead of hoping
// the chat model happens to emit the <!--PROFILE_JSON--> marker on exactly
// the right turn, we explicitly ask it (in a fresh, isolated call) to read
// the WHOLE conversation transcript and extract only what the user actually
// said, as strict JSON. This removes the dependency on marker-matching
// inside the free-flowing chat and fixes the "always the same mock numbers"
// bug caused by few-shot example anchoring.

const EXTRACT_SYSTEM_PROMPT = `Ты — модуль извлечения структурированных данных. Тебе дана полная переписка между консультантом по поступлению и школьником.
Прочитай её и верни СТРОГО валидный JSON (и больше ничего, без пояснений, без markdown-обёртки) со следующими полями:
{
  "grade": число или null,
  "interests": [строки] или [],
  "gpa": число или null,
  "gpaScale": "4.0" или "5.0" или null,
  "languages": [строки] или [],
  "exams": {
    "ielts": { "score": число или null, "date": строка или null, "taken": true/false },
    "sat": { "score": число или null, "date": строка или null, "taken": true/false },
    "ent": { "score": число или null, "date": строка или null, "taken": true/false }
  },
  "countries": [строки] или [],
  "budget": строка или null,
  "timeline": строка или null,
  "constraints": строка или null
}

КРИТИЧЕСКИ ВАЖНО: бери значения ТОЛЬКО из того, что реально написал пользователь (роль "user") в переписке. Если пользователь не назвал какое-то поле — ставь null (или пустой массив для списков). НИКОГДА не выдумывай правдоподобные числа. Если пользователь вообще ничего не успел рассказать — верни все поля как null/[].`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const transcript = messages
      .map((m: any) => `${m.role === 'user' ? 'Школьник' : 'Консультант'}: ${m.content}`)
      .join('\n');

    const raw = await callClaudeMessages(
      EXTRACT_SYSTEM_PROMPT,
      [{ role: 'user', content: `Вот переписка:\n\n${transcript}\n\nВерни JSON профиля.` }],
      500
    );

    const cleaned = raw.replace(/```json|```/g, '').trim();
    const profile = JSON.parse(cleaned);

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('profile-extract failed:', error.message);
    return NextResponse.json({ error: error.message || 'extraction failed' }, { status: 500 });
  }
}
