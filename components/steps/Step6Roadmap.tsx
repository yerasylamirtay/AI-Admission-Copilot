'use client';

import React from 'react';
import { RoadmapResult, RoadmapItem, RoadmapCategory } from '@/lib/types';

interface Step6RoadmapProps {
  roadmap: RoadmapResult | null;
  roadmapProgress: Record<string, boolean>;
  onToggleRoadmapItem: (id: string) => void;
  isLoadingRoadmap?: boolean;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_META: Record<RoadmapCategory, { label: string; icon: string; color: string }> = {
  exams: { label: 'Экзамены и тесты', icon: '📝', color: 'bg-primary-light text-primary border-primary/20' },
  documents: { label: 'Документы и транскрипты', icon: '📁', color: 'bg-surface-muted text-ink-secondary border-surface-border' },
  essays: { label: 'Мотивационные эссе', icon: '✍️', color: 'bg-warning-muted text-warning border-warning/20' },
  recommendation_letters: { label: 'Рекомендательные письма', icon: '💌', color: 'bg-success-muted text-success border-success/20' },
  submission: { label: 'Финальная подача', icon: '🚀', color: 'bg-primary text-white border-transparent' },
};

export default function Step6Roadmap({
  roadmap,
  roadmapProgress,
  onToggleRoadmapItem,
  isLoadingRoadmap,
  onNext,
  onBack,
}: Step6RoadmapProps) {
  if (isLoadingRoadmap || !roadmap) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-in">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-2xl font-bold text-ink">AI строит пошаговый план поступления...</h2>
        <p className="text-sm text-ink-muted max-w-md mx-auto">
          Учитываем уже сданные вами экзамены, дедлайны выбранных вузов, шаблоны эссе и требования к документам.
        </p>
      </div>
    );
  }

  const items = roadmap.items || [];
  const completedCount = items.filter((item) => roadmapProgress[item.id]).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold uppercase tracking-wider">
          📋 Персональный план
        </div>
        <h2 className="text-3xl font-extrabold text-ink">
          Roadmap твоего поступления
        </h2>
        <p className="text-sm text-ink-muted max-w-xl mx-auto">
          Адаптирован под твой профиль. Отмечай выполненные задачи — прогресс синхронизируется в облаке.
        </p>
      </div>

      {/* Progress banner */}
      <div className="card p-6 bg-white border border-surface-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-1">
            Общий прогресс подготовки
          </span>
          <p className="text-lg font-bold text-ink">
            Выполнено {completedCount} из {items.length} шагов ({progressPercent}%)
          </p>
        </div>
        <div className="w-full sm:w-64 h-3 bg-surface-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Weekly urgent priority alert if available */}
      {roadmap.weeklyPriority && (
        <div className="card p-5 bg-primary-light/60 border border-primary/20 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚡</span>
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">
              Фокус недели: {roadmap.weeklyPriority.title}
            </span>
            <p className="text-xs text-ink-secondary leading-relaxed">
              {roadmap.weeklyPriority.description}
            </p>
          </div>
        </div>
      )}

      {/* Step by step tasks list */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const isDone = Boolean(roadmapProgress[item.id]);
          const meta = CATEGORY_META[item.category] || CATEGORY_META.documents;

          return (
            <div
              key={item.id}
              className={`card p-5 transition-all duration-200 border ${
                isDone
                  ? 'bg-surface-secondary/40 border-surface-border opacity-75'
                  : 'bg-white border-surface-border hover:border-primary/40 shadow-soft'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Custom Large Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleRoadmapItem(item.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold transition-all mt-0.5 flex-shrink-0 ${
                    isDone
                      ? 'bg-primary border-primary text-white shadow-purple'
                      : 'border-surface-border hover:border-primary bg-white text-transparent'
                  }`}
                >
                  ✓
                </button>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4
                      className={`text-base font-bold text-ink ${
                        isDone ? 'line-through text-ink-muted' : ''
                      }`}
                    >
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="text-xs font-bold text-ink-muted">
                        📅 {item.deadline}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {item.description}
                  </p>

                  {/* Attached Resources */}
                  {item.resources && item.resources.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-surface-border/60">
                      <span className="text-[11px] font-bold text-ink-muted block mb-1.5">
                        🔗 Материалы и ресурсы:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.resources.map((res, rIdx) => {
                          const isUrl = res.startsWith('http');
                          return isUrl ? (
                            <a
                              key={rIdx}
                              href={res}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chip text-[11px] py-1 bg-surface-muted hover:bg-primary-light text-primary inline-flex items-center gap-1 font-semibold"
                            >
                              <span>🌐</span> {res.replace(/^https?:\/\//, '').split('/')[0]} ↗
                            </a>
                          ) : (
                            <span
                              key={rIdx}
                              className="px-2.5 py-1 rounded-full text-[11px] bg-surface-muted border border-surface-border text-ink-secondary font-medium"
                            >
                              📎 {res}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-surface-border">
        <button onClick={onBack} className="btn-secondary text-xs py-3 px-6">
          ← Назад к сравнению
        </button>
        <button onClick={onNext} className="btn-primary text-sm py-3.5 px-8">
          Перейти к следующему шагу (Дашборд) →
        </button>
      </div>
    </div>
  );
}
