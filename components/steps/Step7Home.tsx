'use client';

import React from 'react';
import { RoadmapResult, RoadmapItem, UserStreak } from '@/lib/types';

interface Step7HomeProps {
  roadmap: RoadmapResult | null;
  roadmapProgress: Record<string, boolean>;
  onToggleRoadmapItem: (id: string) => void;
  streak: UserStreak;
  targetGoalName?: string;
  onGoToRoadmap: () => void;
  onGoToProfile: () => void;
  onGoToUniversities: () => void;
}

const DAILY_QUOTES = [
  { text: "Инвестиции в знания всегда приносят наибольший доход.", author: "Бенджамин Франклин" },
  { text: "Образование — это самое мощное оружие, с помощью которого можно изменить мир.", author: "Нельсон Мандела" },
  { text: "Будущее принадлежит тем, кто верит в красоту своей мечты.", author: "Элеонора Рузвельт" },
  { text: "Маленькие ежедневные шаги приводят к грандиозным результатам.", author: "Народная мудрость" },
  { text: "Дисциплина — это мост между целями и достижениями.", author: "Джим Рон" },
  { text: "Твой единственный предел — это ты сам. Действуй уверенно.", author: "AdmitPath AI" },
  { text: "Успех — это сумма небольших усилий, повторяющихся изо дня в день.", author: "Роберт Кольер" },
  { text: "Чем больше ты учишься, тем больше дверей перед тобой открывается.", author: "Альберт Эйнштейн" },
  { text: "Не жди идеального момента, бери этот момент и делай его идеальным.", author: "Джордж Бернард Шоу" },
  { text: "Сложные дороги часто ведут к самым красивым вершинам.", author: "Конфуций" },
];

export default function Step7Home({
  roadmap,
  roadmapProgress,
  onToggleRoadmapItem,
  streak,
  targetGoalName,
  onGoToRoadmap,
  onGoToProfile,
  onGoToUniversities,
}: Step7HomeProps) {
  const items = roadmap?.items || [];

  // Find the next urgent high priority uncompleted item
  const uncompletedItems = items.filter((item) => !roadmapProgress[item.id]);
  const nextHighPriority = uncompletedItems.find((item) => item.priority === 'high') || uncompletedItems[0] || null;

  // Day of year quote rotation
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const quote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  const completedCount = items.filter((item) => roadmapProgress[item.id]).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="dashboard-shell max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in pb-20">
      {/* Header welcome with streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
            Личный кабинет абитуриента
          </span>
          <h2 className="text-3xl font-extrabold text-ink">
            Твой центр управления поступлением
          </h2>
        </div>

        {/* Streak counter */}
        <div className="flex items-center gap-3 p-3 rounded-card bg-primary-light border border-primary/20 shadow-soft">
          <span className="text-3xl">🔥</span>
          <div>
            <span className="text-xs text-ink-muted font-medium block">Серия посещений</span>
            <span className="text-lg font-bold text-primary">
              {streak.currentStreak} {streak.currentStreak === 1 ? 'день' : streak.currentStreak < 5 ? 'дня' : 'дней'} подряд
            </span>
          </div>
        </div>
      </div>

      {/* Quote of the Day */}
      <div className="card p-6 bg-gradient-to-r from-primary-light via-white to-primary-light/40 border border-primary/20 shadow-soft">
        <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-2">
          💡 Мотивация дня
        </span>
        <blockquote className="text-base sm:text-lg font-semibold text-ink italic mb-2">
          «{quote.text}»
        </blockquote>
        <span className="text-xs text-ink-muted font-medium block">— {quote.author}</span>
      </div>

      {/* NEXT STEP (Big prominent action card) */}
      <div className="card p-6 sm:p-8 bg-white border-2 border-primary shadow-card relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-purple">
              ★
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Твой следующий главный шаг
            </span>
          </div>
          {nextHighPriority && (
            <span className="text-xs font-bold text-ink-muted">
              Дедлайн: 📅 {nextHighPriority.deadline}
            </span>
          )}
        </div>

        {nextHighPriority ? (
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-ink">
              {nextHighPriority.title}
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed max-w-2xl">
              {nextHighPriority.description}
            </p>

            {nextHighPriority.resources && nextHighPriority.resources.length > 0 && (
              <div className="p-3 rounded-xl bg-surface-secondary border border-surface-border">
                <span className="text-xs font-bold text-ink-muted block mb-1">
                  Материалы для выполнения:
                </span>
                <div className="flex flex-wrap gap-2">
                  {nextHighPriority.resources.map((r, i) => (
                    <span key={i} className="text-xs text-primary font-medium bg-white px-2.5 py-1 rounded-md border border-surface-border">
                      📎 {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleRoadmapItem(nextHighPriority.id)}
                className="btn-primary text-sm py-3.5 px-8 w-full sm:w-auto"
              >
                Отметить как выполненное ✓
              </button>
              <button
                type="button"
                onClick={onGoToRoadmap}
                className="btn-secondary text-sm py-3 px-6 w-full sm:w-auto"
              >
                Открыть весь Roadmap →
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <span className="text-4xl">🎉</span>
            <h3 className="text-xl font-bold text-ink">Все текущие шаги выполнены!</h3>
            <p className="text-sm text-ink-muted">
              Отличная работа! Проверьте дедлайны университетов или добавьте новые цели.
            </p>
            <button onClick={onGoToRoadmap} className="btn-primary text-sm py-3 px-6 mt-2">
              Просмотреть Roadmap
            </button>
          </div>
        )}
      </div>

      {/* Target Goal & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-2">
            🎯 Текущая цель
          </span>
          <p className="text-base font-bold text-ink">
            {targetGoalName || 'Поступление на бакалавриат с грантом'}
          </p>
          <button
            onClick={onGoToUniversities}
            className="text-xs font-semibold text-primary hover:underline mt-3 block"
          >
            Смотреть выбранные вузы →
          </button>
        </div>

        <div className="card p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-2">
            📊 Прогресс Roadmap
          </span>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-extrabold text-primary">{progressPercent}%</span>
            <span className="text-xs text-ink-muted">{completedCount}/{items.length} задач</span>
          </div>
          <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="card p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-2">
            ⚙️ Профиль
          </span>
          <p className="text-xs text-ink-secondary mb-4">
            Обновите оценки, баллы тестов или страны для пересчета шансов.
          </p>
          <button
            onClick={onGoToProfile}
            className="btn-secondary text-xs py-2 px-4 w-full"
          >
            Редактировать профиль
          </button>
        </div>
      </div>
    </div>
  );
}
