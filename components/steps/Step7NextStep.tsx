"use client";

import React, { useState } from 'react';
import { Profile, RecommendResult, RoadmapResult, RecommendedUniversity } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

interface StepProps {
  profile: Partial<Profile>;
  recommendations: RecommendResult | null;
  selectedForComparison: string[];
  roadmap: RoadmapResult | null;
  roadmapProgress: Record<string, boolean>;
  onToggleRoadmapItem: (id: string) => void;
  [key: string]: any;
}

export default function Step7NextStep({
  profile,
  roadmap,
  roadmapProgress,
  onToggleRoadmapItem,
  recommendations,
  selectedForComparison,
}: StepProps) {
  const [essayDraft, setEssayDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedUniId, setSelectedUniId] = useState('');
  const [essayAnswers, setEssayAnswers] = useState({
    hook: '', journey: '', whyUs: '', futureImpact: '',
  });
  const [teacherData, setTeacherData] = useState({
    studentName: '', teacherName: '', subject: '', university: '',
  });
  const [wordCount, setWordCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');

  const allRecs: RecommendedUniversity[] = [
    ...(recommendations?.dream ?? []),
    ...(recommendations?.target ?? []),
    ...(recommendations?.safety ?? []),
  ];
  const selectedUnis = allRecs.filter((u) => selectedForComparison.includes(u.id));
  const selectedUni = allRecs.find((u) => u.id === selectedUniId);

  // Weekly priority: first uncompleted high-priority, or first uncompleted
  const priorityItem =
    roadmap?.items?.find((item) => !roadmapProgress[item.id] && item.priority === 'high') ??
    roadmap?.items?.find((item) => !roadmapProgress[item.id]);

  const handleGenerateEssay = async () => {
    if (!selectedUni) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/essay-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          university: selectedUni,
          answers: essayAnswers,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const result = data.result ?? data;
      setEssayDraft(result.draft ?? '');
      setWordCount(result.wordCount ?? result.draft?.split(/\s+/).length ?? 0);
    } catch {
      // Fallback template
      const fallback = `Уважаемая приёмная комиссия ${selectedUni.name}!\n\n${essayAnswers.hook}\n\nМой путь к выбору специальности начался с того, что ${essayAnswers.journey}\n\nЯ выбираю именно ${selectedUni.name}, потому что ${essayAnswers.whyUs}\n\nПосле окончания университета я планирую ${essayAnswers.futureImpact}\n\nС уважением,\nАбитуриент`;
      setEssayDraft(fallback);
      setWordCount(fallback.split(/\s+/).filter(Boolean).length);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const teacherLetter = `Уважаемый(ая) ${teacherData.teacherName || '[Имя учителя]'}!

Я, ${teacherData.studentName || '[Ваше имя]'}, обращаюсь к вам с просьбой написать рекомендательное письмо для моего поступления в ${teacherData.university || '[Название вуза]'}. Ваш предмет «${teacherData.subject || '[Предмет]'}» сыграл важную роль в моём академическом развитии, и я считаю, что вы могли бы лучше всего оценить мои способности и стремление к знаниям.

Рекомендательное письмо должно отражать мою академическую подготовку, мотивацию и личные качества. Я был бы благодарен(а), если бы вы смогли подготовить его до [укажите дату].

При необходимости я могу предоставить дополнительную информацию о требованиях университета.

Заранее благодарю за ваше время и поддержку!

С уважением,
${teacherData.studentName || '[Ваше имя]'}`;

  const handleReset = () => {
    localStorage.removeItem('admitpath_state');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <h2 className="text-heading-md">Следующие шаги</h2>

      {/* Weekly Priority */}
      {priorityItem && (
        <Card className="p-6 border-2 border-accent/50 shadow-glow">
          <h3 className="text-card-title font-bold text-accent mb-3">
            🎯 Главный приоритет этой недели
          </h3>
          <div className="mb-4">
            <h4 className="text-heading-sm">{priorityItem.title}</h4>
            <p className="text-body text-text-secondary mt-1">{priorityItem.description}</p>
            <p className="text-body-sm font-medium mt-2 text-warning">
              📅 Дедлайн: {new Date(priorityItem.deadline).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <Button onClick={() => onToggleRoadmapItem(priorityItem.id)}>
            ✅ Отметить выполненным
          </Button>
        </Card>
      )}

      {/* Essay Constructor */}
      <div className="space-y-4">
        <h3 className="text-heading-sm">✍️ Конструктор мотивационного письма</h3>
        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-body-sm font-medium text-text-secondary mb-1">
              Выберите университет
            </label>
            <select
              className="input-field"
              value={selectedUniId}
              onChange={(e) => setSelectedUniId(e.target.value)}
            >
              <option value="">-- Выберите вуз --</option>
              {selectedUnis.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
              {allRecs.filter(u => !selectedForComparison.includes(u.id)).map((u) => (
                <option key={u.id} value={u.id}>{u.name} (другой)</option>
              ))}
            </select>
          </div>

          {[
            { key: 'hook', label: 'Hook: Что зацепит приёмную комиссию?', placeholder: 'Расскажи уникальную историю или факт о себе' },
            { key: 'journey', label: 'Journey: Какой путь привёл тебя к выбору специальности?', placeholder: 'Опиши ключевые события и решения' },
            { key: 'whyUs', label: 'Why Us: Почему именно этот университет?', placeholder: 'Что конкретно привлекает: программы, профессора, возможности' },
            { key: 'futureImpact', label: 'Future Impact: Какое влияние ты хочешь оказать?', placeholder: 'Опиши свои планы и цели после выпуска' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">{label}</label>
              <textarea
                className="input-field min-h-[80px]"
                value={essayAnswers[key as keyof typeof essayAnswers]}
                onChange={(e) => setEssayAnswers({ ...essayAnswers, [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}

          <Button
            onClick={handleGenerateEssay}
            disabled={isGenerating || !selectedUniId}
            loading={isGenerating}
          >
            {isGenerating ? 'Генерируем...' : '✨ Сгенерировать черновик'}
          </Button>

          {essayDraft && (
            <div className="mt-4 p-5 bg-bg rounded-card border border-bg-border relative group">
              <div className="flex justify-between items-center mb-3">
                <span className="text-caption text-text-secondary">📝 Слов: {wordCount}</span>
                <button
                  onClick={() => copyToClipboard(essayDraft, 'essay')}
                  className="text-caption text-accent hover:underline"
                >
                  {copySuccess === 'essay' ? '✓ Скопировано' : '📋 Копировать'}
                </button>
              </div>
              <p className="text-body whitespace-pre-wrap leading-relaxed">{essayDraft}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Teacher Letter */}
      <div className="space-y-4">
        <h3 className="text-heading-sm">📧 Шаблон письма учителю за рекомендацией</h3>
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">Ваше имя</label>
              <input type="text" className="input-field" value={teacherData.studentName} onChange={(e) => setTeacherData({ ...teacherData, studentName: e.target.value })} placeholder="Иван Иванов" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">Имя учителя</label>
              <input type="text" className="input-field" value={teacherData.teacherName} onChange={(e) => setTeacherData({ ...teacherData, teacherName: e.target.value })} placeholder="Мария Петровна" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">Предмет</label>
              <input type="text" className="input-field" value={teacherData.subject} onChange={(e) => setTeacherData({ ...teacherData, subject: e.target.value })} placeholder="Математика" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1">Университет</label>
              <input type="text" className="input-field" value={teacherData.university} onChange={(e) => setTeacherData({ ...teacherData, university: e.target.value })} placeholder="Nazarbayev University" />
            </div>
          </div>
          <div className="p-5 bg-bg rounded-card border border-bg-border relative">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => copyToClipboard(teacherLetter, 'teacher')}
                className="text-caption text-accent hover:underline"
              >
                {copySuccess === 'teacher' ? '✓ Скопировано' : '📋 Копировать'}
              </button>
            </div>
            <p className="text-body whitespace-pre-wrap leading-relaxed">{teacherLetter}</p>
          </div>
        </Card>
      </div>

      {/* Reset */}
      <div className="pt-8 border-t border-bg-border text-center">
        <p className="text-body-sm text-text-secondary mb-4">
          Хотите начать заново с другим профилем?
        </p>
        <Button variant="secondary" onClick={handleReset}>🔄 Начать заново</Button>
      </div>
    </div>
  );
}
