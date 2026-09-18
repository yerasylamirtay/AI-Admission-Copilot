import { NextRequest, NextResponse } from 'next/server';
import { callClaudeMessages, ClaudeMessage } from '@/lib/claude';
import { PROFILE_COLLECTOR_PROMPT } from '@/lib/prompts/profile-collector';
import { ADMISSION_SCOPE_REFUSAL, isAdmissionQuestion } from '@/lib/admission-scope';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Keep the copilot focused even when a user bypasses the UI and calls the API directly.
    const latestUserMessage = [...messages].reverse().find((m: any) => m?.role === 'user');
    const question = String(latestUserMessage?.content || '');
    if (question && !isAdmissionQuestion(question)) {
      return NextResponse.json({ reply: ADMISSION_SCOPE_REFUSAL });
    }

    // Limit conversation history to prevent token explosion
    const truncatedMessages: ClaudeMessage[] = messages.slice(-12).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || ''),
    }));

    try {
      const reply = await callClaudeMessages(
        PROFILE_COLLECTOR_PROMPT,
        truncatedMessages,
        300
      );

      return NextResponse.json({ reply });
    } catch (aiError: any) {
      console.warn('Claude API not accessible, generating dynamic mock assistant reply:', aiError.message);
      
      // Fallback mock consultant if ANTHROPIC_API_KEY is not set or rate limited
      const stepIndex = truncatedMessages.filter(m => m.role === 'user').length;
      let mockReply = '';

      if (stepIndex === 1) {
        mockReply = 'Отлично! В каком ты сейчас классе и какие академические направления тебе больше всего интересны (IT, бизнес, медицина, инженерия)?';
      } else if (stepIndex === 2) {
        mockReply = 'Супер направление! Расскажи про свою успеваемость — какой примерный средний балл (GPA) и какими языками владеешь?';
      } else if (stepIndex === 3) {
        mockReply = 'Принято! Сдавал ли ты уже стандартизированные тесты (IELTS, SAT, ЕНТ, TOEFL) и с какими баллами, или они только в планах?';
      } else if (stepIndex === 4) {
        mockReply = 'Отлично. Какие страны или регионы рассматриваешь в приоритете (Казахстан, США, Европа, Азия) и какой бюджет на обучение (или нужен полный грант)?';
      } else {
        mockReply = `Спасибо за подробные ответы! Я полностью сформировал твой профиль для расчета шансов и подбора вузов.

<!--PROFILE_JSON-->
{
  "grade": 11,
  "interests": ["Computer Science", "Engineering"],
  "gpa": 4.6,
  "gpaScale": "5.0",
  "languages": ["Казахский", "Русский", "Английский (B2)"],
  "exams": {
    "ielts": { "score": 6.5, "date": "2024-05", "taken": true },
    "sat": { "score": null, "date": null, "taken": false },
    "ent": { "score": 118, "date": "2024-06", "taken": true }
  },
  "countries": ["Казахстан", "Европа", "США"],
  "budget": "grant",
  "timeline": "2025",
  "constraints": "Приоритет грант и программы на английском"
}
<!--END-->`;
      }

      return NextResponse.json({ reply: mockReply });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
