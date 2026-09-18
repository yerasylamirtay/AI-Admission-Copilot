import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { Profile, University, RoadmapResult, RoadmapItem } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, universities } = body as { profile: Partial<Profile>; universities: University[] };

    if (!profile || !universities || universities.length === 0) {
      return NextResponse.json({ error: 'Missing profile or universities' }, { status: 400 });
    }

    const uniList = universities.map(u => `${u.name} (Дедлайн: ${u.deadline}, Город/Страна: ${u.city || u.country})`).join('; ');

    // Extract taken exams
    const examsObj = profile.exams || {};
    const takenExamsList: string[] = [];
    const plannedExamsList: string[] = [];

    if (examsObj.ielts?.taken && examsObj.ielts.score) takenExamsList.push(`IELTS ${examsObj.ielts.score} (сдан ${examsObj.ielts.date || ''})`);
    else plannedExamsList.push('IELTS / TOEFL');

    if (examsObj.sat?.taken && examsObj.sat.score) takenExamsList.push(`SAT ${examsObj.sat.score} (сдан ${examsObj.sat.date || ''})`);
    else plannedExamsList.push('SAT');

    if (examsObj.ent?.taken && examsObj.ent.score) takenExamsList.push(`ЕНТ ${examsObj.ent.score} (сдан ${examsObj.ent.date || ''})`);
    else plannedExamsList.push('ЕНТ');

    const systemPrompt = `Ты — ведущий эксперт по составлению индивидуального плана поступления в вузы.
Создай детальный, реалистичный план (Roadmap) на русском языке.

ВНИМАНИЕ К ПРАВИЛАМ:
1. Адаптивность к сданным экзаменам:
   - УЖЕ СДАННЫЕ ЭКЗАМЕНЫ (${takenExamsList.join(', ') || 'нет'}) НЕ ВКЛЮЧАТЬ в план как "нужно сдать"! Они уже сданы.
   - Если нужный экзамен не сдан (${plannedExamsList.join(', ')}), включи конкретные шаги подготовки и сдачи.
2. Обязательно включи следующие ключевые шаги:
   - "Как заполнить анкету/заявку" (конкретные разделы: Academic history, Activities, Personal statement).
   - "Структура эссе" (Hook, Personal Journey, Why Us, Future Impact).
   - "Как запросить рекомендательное письмо у учителя" (шаблон вежливой просьбы, бриф с достижениями).
   - "Когда и как подавать" (с точным дедлайном и ссылкой на приёмную комиссию).
3. Каждая задача ОБЯЗАТЕЛЬНО должна содержать массив "resources" — полезные ссылки, чек-листы, шаблоны.

ФОРМАТ ОТВЕТА (строго валидный JSON):
{
  "items": [
    {
      "id": "step-1",
      "title": "Название шага",
      "description": "Конкретная подробная инструкция что именно делать",
      "category": "exams" | "documents" | "essays" | "recommendation_letters" | "submission",
      "resources": [
        "https://example.com/portal",
        "Шаблон структуры эссе (Hook-Journey-WhyUs)",
        "Чек-лист документов абитуриента"
      ],
      "deadline": "YYYY-MM-DD",
      "completed": false,
      "priority": "high" | "medium" | "low"
    }
  ],
  "weeklyPriority": {
    "title": "Самая приоритетная задача на ближайшие 7 дней",
    "description": "Почему это критически важно выполнить прямо сейчас"
  }
}`;

    const earliestDeadline = universities.map(u => u.deadline).sort()[0] || '2026-12-01';
    const deadlineDate = new Date(earliestDeadline);

    const userMessage = `Профиль абитуриента:
- Класс: ${profile.grade || '11'}
- Успеваемость GPA: ${profile.gpa || 4.5}
- Сданные экзамены: ${takenExamsList.join(', ') || 'Нет (все в процессе)'}
- Планируемые экзамены: ${plannedExamsList.join(', ')}
- Целевые университеты: ${uniList}
- Ближайший дедлайн подачи: ${earliestDeadline}`;

    try {
      const resultText = await callClaude(systemPrompt, userMessage, 1500);
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as RoadmapResult;
        if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
          return NextResponse.json({ roadmap: parsed });
        }
      }
    } catch (aiErr: any) {
      console.warn('Claude roadmap generation failed, using adaptive fallback:', aiErr.message);
    }

    // Adaptive Fallback
    const fallbackItems: RoadmapItem[] = [];
    let stepCount = 1;

    // Only add exam step if needed
    if (!examsObj.ielts?.taken) {
      fallbackItems.push({
        id: `step-${stepCount++}`,
        title: 'Регистрация и сдача IELTS / TOEFL',
        description: 'Зарегистрироваться на тест в официальном тест-центре (British Council / IDP) минимум за 3 месяца до дедлайна.',
        category: 'exams',
        resources: ['https://www.ielts.org', 'Кембриджские практические тесты 15-18', 'Чек-лист подготовки к Speaking & Writing'],
        deadline: new Date(deadlineDate.getTime() - 90 * 86400000).toISOString().split('T')[0],
        completed: false,
        priority: 'high',
      });
    }

    fallbackItems.push(
      {
        id: `step-${stepCount++}`,
        title: 'Сбор официального транскрипта и справок',
        description: 'Запросить в школьной канцелярии табель/транскрипт с оценками за 9-11 классы с переводом на английский язык и печатью.',
        category: 'documents',
        resources: ['Образец перевода школьного транскрипта', 'Шаблон нотариального перевода'],
        deadline: new Date(deadlineDate.getTime() - 75 * 86400000).toISOString().split('T')[0],
        completed: false,
        priority: 'medium',
      },
      {
        id: `step-${stepCount++}`,
        title: 'Запрос рекомендательных писем у преподавателей',
        description: 'Обратиться к 2 профильным учителям. Предоставить им свой бриф (список достижений, олимпиад и целей), чтобы письмо получилось содержательным.',
        category: 'recommendation_letters',
        resources: ['Шаблон письма-просьбы учителю', 'Гайд: что должно быть в сильном Recommendation Letter'],
        deadline: new Date(deadlineDate.getTime() - 60 * 86400000).toISOString().split('T')[0],
        completed: false,
        priority: 'high',
      },
      {
        id: `step-${stepCount++}`,
        title: 'Написание мотивационного эссе (Personal Statement)',
        description: 'Сформулировать историю по структуре 4 блоков: Hook (захватывающее начало) → Journey (твой академический путь) → Why Us (почему именно этот вуз) → Future Impact (как знания изменят мир).',
        category: 'essays',
        resources: ['Интерактивный конструктор эссе AdmitPath', '10 примеров успешных эссе в топ-вузы'],
        deadline: new Date(deadlineDate.getTime() - 45 * 86400000).toISOString().split('T')[0],
        completed: false,
        priority: 'high',
      },
      {
        id: `step-${stepCount++}`,
        title: 'Заполнение разделов официальной анкеты вуза',
        description: 'Создать аккаунт на портале приёмной комиссии или Common App. Внести паспортные данные, список внеучебных активностей (Extracurriculars) и загрузить черновики.',
        category: 'documents',
        resources: ['Портал приёмной комиссии: ' + (universities[0]?.name || 'вуза'), 'Гайд по описанию внеучебных активностей'],
        deadline: new Date(deadlineDate.getTime() - 30 * 86400000).toISOString().split('T')[0],
        completed: false,
        priority: 'high',
      },
      {
        id: `step-${stepCount++}`,
        title: 'Финальная подача заявки и подтверждение документов',
        description: `Отправить готовую форму до официального дедлайна (${earliestDeadline}). Проверить статус получения транскрипта и рекомендаций.`,
        category: 'submission',
        resources: ['Официальный календарь дедлайнов', 'Финальный чек-лист перед нажатием Submit'],
        deadline: earliestDeadline,
        completed: false,
        priority: 'high',
      }
    );

    const fallbackResult: RoadmapResult = {
      items: fallbackItems,
      weeklyPriority: {
        title: fallbackItems[0].title,
        description: 'Это самый срочный этап вашей подготовки. Рекомендуем сфокусироваться на нем в первую очередь.'
      }
    };

    return NextResponse.json({ roadmap: fallbackResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Roadmap error' }, { status: 500 });
  }
}
