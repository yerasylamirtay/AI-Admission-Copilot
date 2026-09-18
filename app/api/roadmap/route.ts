import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { Profile, University, RoadmapResult, RoadmapItem } from '@/lib/types';
import { checkAndIncrementBudget } from '@/lib/token-budget';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, universities } = body as { profile: Partial<Profile>; universities: University[] };

    if (!profile || !universities || universities.length === 0) {
      return NextResponse.json({ error: 'Missing profile or universities' }, { status: 400 });
    }

    const uniList = universities.map(u => `${u.name} (Deadline: ${u.deadline})`).join(', ');

    const systemPrompt = `You are an expert admission planner. Generate a personalized step-by-step preparation plan in Russian for a student applying to universities.

Return ONLY valid JSON matching this EXACT schema:
{
  "items": [
    {
      "id": "string (unique, e.g. 'task-1')",
      "title": "string (task title in Russian)",
      "description": "string (detailed description in Russian)",
      "category": "exams" | "documents" | "essays",
      "deadline": "YYYY-MM-DD",
      "completed": false,
      "priority": "high" | "medium" | "low"
    }
  ],
  "weeklyPriority": {
    "title": "string (most urgent task this week, in Russian)",
    "description": "string (why it's urgent, in Russian)"
  }
}

Generate 8-12 tasks covering all three categories. Base deadlines on the university deadlines provided. Order tasks chronologically. Make descriptions specific and actionable.`;

    const userMessage = `Student profile: GPA ${profile.gpa}, IELTS ${profile.ielts ?? 'not taken'}, SAT ${profile.sat ?? 'not taken'}, ENT ${profile.ent ?? 'not taken'}.
Target universities: ${uniList}`;

    const buildFallback = () => {
      const earliestDeadline = universities.map(u => u.deadline).sort()[0] || '2027-03-01';
      const deadlineDate = new Date(earliestDeadline);
      const items: RoadmapItem[] = [
        ['Сдать IELTS / TOEFL', 'Зарегистрироваться и сдать языковой экзамен.', 'exams', 90, 'high'],
        ['Подготовить SAT / ЕНТ', 'Пройти пробные тесты и зарегистрироваться на экзамен.', 'exams', 75, 'high'],
        ['Собрать транскрипт оценок', 'Запросить официальный транскрипт в школе.', 'documents', 60, 'medium'],
        ['Написать мотивационное письмо', 'Составить черновик и получить обратную связь.', 'essays', 45, 'high'],
        ['Запросить рекомендательные письма', 'Попросить учителей написать рекомендации.', 'documents', 45, 'high'],
        ['Подать заявки', `Финальная подача заявок до ${earliestDeadline}.`, 'documents', 0, 'high'],
      ].map(([title, description, category, days, priority], index) => ({ id: `task-${index + 1}`, title: title as string, description: description as string, category: category as RoadmapItem['category'], deadline: new Date(deadlineDate.getTime() - Number(days) * 86400000).toISOString().split('T')[0], completed: false, priority: priority as RoadmapItem['priority'] }));
      return { items, weeklyPriority: { title: items[0].title, description: 'Это самый срочный пункт вашего плана. Начните с него сегодня.' } };
    };
    if (!checkAndIncrementBudget().allowed) return NextResponse.json({ roadmap: buildFallback(), source: 'fallback' });
    try {
      const resultText = await callClaude(systemPrompt, userMessage, 1200);
      // Try to extract JSON from response (handle markdown code blocks)
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      const parsed = JSON.parse(jsonMatch[0]) as RoadmapResult;
      return NextResponse.json({ roadmap: parsed, source: 'ai' }, { status: 200 });
    } catch (aiError) {
      console.warn('Claude API failed in /api/roadmap, using fallback:', aiError);

      // Generate template roadmap from university deadlines
      const earliestDeadline = universities.map(u => u.deadline).sort()[0] || '2027-03-01';

      const deadlineDate = new Date(earliestDeadline);
      const items: RoadmapItem[] = [
        {
          id: 'task-1',
          title: 'Сдать IELTS / TOEFL',
          description: 'Зарегистрироваться и сдать языковой экзамен. Результат нужен минимум за 2 месяца до дедлайна.',
          category: 'exams',
          deadline: new Date(deadlineDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false,
          priority: 'high',
        },
        {
          id: 'task-2',
          title: 'Подготовить SAT / ЕНТ',
          description: 'Пройти пробные тесты и зарегистрироваться на экзамен.',
          category: 'exams',
          deadline: new Date(deadlineDate.getTime() - 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false,
          priority: 'high',
        },
        {
          id: 'task-3',
          title: 'Собрать транскрипт оценок',
          description: 'Запросить официальный транскрипт в школе. Перевод и нотариальное заверение если нужно.',
          category: 'documents',
          deadline: new Date(deadlineDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false,
          priority: 'medium',
        },
        {
          id: 'task-4',
          title: 'Написать мотивационное письмо',
          description: 'Составить черновик, получить обратную связь от учителя/ментора, отредактировать.',
          category: 'essays',
          deadline: new Date(deadlineDate.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false,
          priority: 'high',
        },
        {
          id: 'task-5',
          title: 'Запросить рекомендательные письма',
          description: 'Попросить 2-3 учителей написать рекомендации. Дать им достаточно времени (минимум 3 недели).',
          category: 'documents',
          deadline: new Date(deadlineDate.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false,
          priority: 'high',
        },
        {
          id: 'task-6',
          title: 'Подготовить копию паспорта',
          description: 'Сделать скан-копию паспорта. Проверить срок действия.',
          category: 'documents',
          deadline: new Date(deadlineDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false,
          priority: 'low',
        },
        {
          id: 'task-7',
          title: 'Написать эссе Why Us',
          description: 'Для каждого вуза написать персонализированное эссе "Почему именно этот университет".',
          category: 'essays',
          deadline: new Date(deadlineDate.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false,
          priority: 'medium',
        },
        {
          id: 'task-8',
          title: 'Подать заявки',
          description: `Финальная подача заявок. Дедлайн: ${earliestDeadline}. Проверить все документы дважды.`,
          category: 'documents',
          deadline: earliestDeadline,
          completed: false,
          priority: 'high',
        },
      ];

      const fallbackRoadmap: RoadmapResult = {
        items,
        weeklyPriority: {
          title: items[0].title,
          description: 'Это самый срочный пункт вашего плана. Начните с него сегодня.',
        },
      };

      return NextResponse.json({ roadmap: fallbackRoadmap, source: 'fallback' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in /api/roadmap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
