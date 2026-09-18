'use client';

import React from 'react';
import { RecommendResult, RecommendedUniversity } from '@/lib/types';

interface Step5CompareProps {
  selectedForComparison: string[];
  recommendations: RecommendResult | null;
  onBack: () => void;
  onNext: () => void;
  onToggleComparison: (id: string) => void;
}

export default function Step5Compare({
  selectedForComparison,
  recommendations,
  onBack,
  onNext,
  onToggleComparison,
}: Step5CompareProps) {
  const allRecs: RecommendedUniversity[] = [
    ...(recommendations?.dream ?? []),
    ...(recommendations?.target ?? []),
    ...(recommendations?.safety ?? []),
  ];

  const selectedUnis = allRecs.filter((u) => selectedForComparison.includes(u.id));

  if (selectedUnis.length < 2) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="card p-8 space-y-4">
          <span className="text-4xl">⚖️</span>
          <h2 className="text-2xl font-bold text-ink">Выберите вузы для сравнения</h2>
          <p className="text-sm text-ink-muted">
            Для детального сравнительного анализа выберите от 2 до 8 университетов в каталоге рекомендаций.
          </p>
          <button onClick={onBack} className="btn-primary text-sm py-3 px-6">
            ← Вернуться к каталогу вузов
          </button>
        </div>
      </div>
    );
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'dream':
        return <span className="badge-dream">🌟 Dream</span>;
      case 'target':
        return <span className="badge-target">🎯 Target</span>;
      case 'safety':
        return <span className="badge-safety">🛡️ Safety</span>;
      default:
        return null;
    }
  };

  const minTuition = Math.min(...selectedUnis.map((u) => u.tuition));
  const maxAcceptance = Math.max(...selectedUnis.map((u) => u.acceptanceRate));
  const bestRanking = Math.min(...selectedUnis.map((u) => u.ranking));

  const rows = [
    { label: 'Эшелон', render: (u: RecommendedUniversity) => getTierBadge(u.tier) },
    {
      label: 'Город / Страна',
      render: (u: RecommendedUniversity) => (
        <div>
          <span className="font-semibold text-ink block">{u.country}</span>
          <span className="text-xs text-ink-muted">{u.city || u.address || '—'}</span>
        </div>
      ),
    },
    {
      label: 'Стоимость обучения',
      render: (u: RecommendedUniversity) => (
        <span className={`font-bold ${u.tuition === minTuition ? 'text-success' : 'text-ink'}`}>
          {u.tuition === 0 ? 'Бесплатно / Грант' : `$${u.tuition.toLocaleString()}/год`}
        </span>
      ),
    },
    {
      label: 'Гранты и стипендии',
      render: (u: RecommendedUniversity) => (
        <p className="text-xs text-ink-secondary leading-snug">{u.scholarships || 'Доступны конкурсы'}</p>
      ),
    },
    {
      label: 'Требования GPA',
      render: (u: RecommendedUniversity) => (
        <span className="font-semibold text-ink">{u.gpaReq || 'От 3.5'}</span>
      ),
    },
    {
      label: 'Языковые тесты (IELTS)',
      render: (u: RecommendedUniversity) => (
        <span className="font-semibold text-ink">{u.ieltsReq ? `От ${u.ieltsReq}` : 'Не требуется'}</span>
      ),
    },
    {
      label: 'SAT / ЕНТ',
      render: (u: RecommendedUniversity) => (
        <span className="font-semibold text-ink">
          {u.satReq ? `SAT ${u.satReq}` : u.entReq ? `ЕНТ ${u.entReq}` : 'Опционально'}
        </span>
      ),
    },
    {
      label: 'Acceptance Rate',
      render: (u: RecommendedUniversity) => (
        <span className={`font-bold ${u.acceptanceRate === maxAcceptance ? 'text-success' : 'text-ink'}`}>
          {Math.round(u.acceptanceRate * 100)}%
        </span>
      ),
    },
    {
      label: 'Мировой рейтинг',
      render: (u: RecommendedUniversity) => (
        <span className={`font-bold ${u.ranking === bestRanking ? 'text-primary' : 'text-ink'}`}>
          #{u.ranking}
        </span>
      ),
    },
    {
      label: 'Дедлайн подачи',
      render: (u: RecommendedUniversity) => (
        <span className="font-semibold text-ink">
          {new Date(u.deadline).toLocaleDateString('ru-RU')}
        </span>
      ),
    },
    {
      label: 'Программы',
      render: (u: RecommendedUniversity) => (
        <div className="flex flex-wrap gap-1">
          {u.programs.slice(0, 3).map((p, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded bg-surface-muted text-[11px] text-ink-secondary">
              {p}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold uppercase tracking-wider">
          ⚖️ Сравнительный анализ
        </div>
        <h2 className="text-3xl font-extrabold text-ink">
          Сравнение выбранных университетов
        </h2>
        <p className="text-sm text-ink-muted">
          Выбрано {selectedUnis.length} вузов (поддерживается до 8 вузов в таблице)
        </p>
      </div>

      {/* Horizontal Scroll Table */}
      <div className="card p-0 overflow-hidden border border-surface-border shadow-soft">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-secondary border-b border-surface-border">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-muted w-48 sticky left-0 bg-surface-secondary z-10">
                  Критерий
                </th>
                {selectedUnis.map((u) => (
                  <th key={u.id} className="p-4 min-w-[200px] border-l border-surface-border">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-ink block">{u.name}</span>
                      <button
                        onClick={() => onToggleComparison(u.id)}
                        className="text-ink-muted hover:text-danger text-xs font-bold"
                        title="Удалить из сравнения"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm">
              {rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-surface-secondary/40'}>
                  <td className="p-4 font-semibold text-ink-secondary text-xs sticky left-0 bg-inherit z-10 border-r border-surface-border">
                    {row.label}
                  </td>
                  {selectedUnis.map((u) => (
                    <td key={u.id} className="p-4 border-l border-surface-border">
                      {row.render(u)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-surface-border">
        <button onClick={onBack} className="btn-secondary text-xs py-3 px-6">
          ← Назад к рекомендациям
        </button>
        <button onClick={onNext} className="btn-primary text-sm py-3.5 px-8">
          Сформировать Roadmap поступления →
        </button>
      </div>
    </div>
  );
}
