'use client';

import React from 'react';
import { DiagnoseResult, Profile } from '@/lib/types';

interface Step3DiagnoseProps {
  diagnosis: DiagnoseResult | null;
  profile: Partial<Profile>;
  isLoadingDiagnose: boolean;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Diagnose({
  diagnosis,
  profile,
  isLoadingDiagnose,
  onNext,
  onBack,
}: Step3DiagnoseProps) {
  if (isLoadingDiagnose || !diagnosis) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-in">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-2xl font-bold text-ink">AI анализирует ваш профиль...</h2>
        <p className="text-sm text-ink-muted max-w-md mx-auto">
          Рассчитываем детерминированный индекс готовности и формируем сильные стороны и цели поступления.
        </p>
      </div>
    );
  }

  const { readinessIndex, tier, factors, summary, strengths, constraints, goal } = diagnosis;

  const tierBadge = {
    high: { label: 'Высокая готовность', color: 'bg-success-muted text-success border-success/30' },
    medium: { label: 'Средняя готовность', color: 'bg-warning-muted text-warning border-warning/30' },
    low: { label: 'Требуется усиление', color: 'bg-danger-muted text-danger border-danger/30' },
  }[tier] || { label: 'Оценивается', color: 'bg-primary-light text-primary border-primary/30' };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold uppercase tracking-wider">
          📊 Результаты диагностики
        </div>
        <h2 className="text-3xl font-extrabold text-ink">
          Оценка шансов и готовности к поступлению
        </h2>
      </div>

      {/* Main Readiness Index Banner */}
      <div className="card p-8 text-center bg-white border border-surface-border shadow-soft relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl sm:text-6xl font-extrabold text-primary tracking-tight">
              {readinessIndex}%
            </span>
            <div className="text-left">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${tierBadge.color} mb-1`}>
                {tierBadge.label}
              </span>
              <span className="text-xs text-ink-muted block">Индекс готовности</span>
            </div>
          </div>

          {/* Progress visual */}
          <div className="h-3 w-full bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
              style={{ width: `${readinessIndex}%` }}
            />
          </div>

          {summary && (
            <p className="text-sm text-ink-secondary leading-relaxed pt-2">
              {summary}
            </p>
          )}
        </div>
      </div>

      {/* AI Structured Synthesis: Strengths / Constraints / Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card p-6 border-l-4 border-l-success">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-success-muted text-success flex items-center justify-center font-bold text-sm">
              ✓
            </span>
            <h3 className="text-lg font-bold text-ink">Сильные стороны профиля</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-ink-secondary">
            {(strengths && strengths.length > 0 ? strengths : [
              'Высокий средний балл GPA создает устойчивое преимущество',
              'Четко сформированный интерес к профильному направлению',
              'Хороший стартовый базис для подготовки к грантовым конкурсам'
            ]).map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-success font-bold mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Constraints / Areas of growth */}
        <div className="card p-6 border-l-4 border-l-warning">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-warning-muted text-warning flex items-center justify-center font-bold text-sm">
              ⚡
            </span>
            <h3 className="text-lg font-bold text-ink">Ограничения и точки роста</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-ink-secondary">
            {(constraints && constraints.length > 0 ? constraints : [
              'Необходимо подтвердить уровень владения языком официальным сертификатом',
              'Рекомендуется усилить портфолио профильными проектами или олимпиадами',
              'Важно соблюдать ранние дедлайн-окна для стипендиальных программ'
            ]).map((c, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-warning font-bold mt-0.5">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Goal Block */}
      {goal && (
        <div className="card p-6 bg-primary-light/40 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-purple">
              🎯
            </div>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                Твоя образовательная цель
              </span>
              <p className="text-base font-semibold text-ink leading-relaxed">
                {goal}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Factor breakdown bars */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-ink mb-4">Детализация по факторам</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {factors.map((factor) => (
            <div key={factor.name} className="p-4 rounded-card bg-surface-secondary border border-surface-border">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-ink">{factor.label}</span>
                <span className="text-xs font-bold text-primary">{factor.score}%</span>
              </div>
              <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${factor.score}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-muted leading-tight">{factor.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation actions */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-border">
        <button
          onClick={onBack}
          className="btn-secondary text-xs py-3 px-6"
        >
          ← Назад к профилю
        </button>
        <button
          onClick={onNext}
          className="btn-primary text-sm py-3.5 px-8"
        >
          Подобрать университеты →
        </button>
      </div>
    </div>
  );
}
