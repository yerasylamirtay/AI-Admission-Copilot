"use client";

import React from 'react';
import { Profile, DiagnoseResult, RecommendResult, RecommendedUniversity } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface StepProps {
  profile: Partial<Profile>;
  onNext: () => void;
  onBack: () => void;
  recommendations: RecommendResult | null;
  selectedForComparison: string[];
  [key: string]: any;
}

export default function Step5Compare({
  selectedForComparison,
  recommendations,
  onBack,
  onNext,
}: StepProps) {
  const allRecs: RecommendedUniversity[] = [
    ...(recommendations?.dream ?? []),
    ...(recommendations?.target ?? []),
    ...(recommendations?.safety ?? []),
  ];

  const selectedUnis = allRecs.filter((u) => selectedForComparison.includes(u.id));

  if (selectedUnis.length < 2) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-12">
        <h2 className="text-heading-md text-center">Сравнение вузов</h2>
        <Card className="p-8 text-center">
          <p className="text-body text-text-secondary mb-4">Выберите минимум 2 вуза для сравнения.</p>
          <Button onClick={onBack} variant="secondary">Назад к рекомендациям</Button>
        </Card>
      </div>
    );
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'dream': return <span className="badge-dream">🌟 Dream</span>;
      case 'target': return <span className="badge-target">🎯 Target</span>;
      case 'safety': return <span className="badge-safety">🛡️ Safety</span>;
      default: return null;
    }
  };

  // Find best values for highlighting
  const minTuition = Math.min(...selectedUnis.map((u) => u.tuition));
  const maxAcceptance = Math.max(...selectedUnis.map((u) => u.acceptanceRate));
  const bestRanking = Math.min(...selectedUnis.map((u) => u.ranking));

  const rows = [
    { label: 'Страна', render: (u: RecommendedUniversity) => u.country },
    { label: 'Город', render: (u: RecommendedUniversity) => (u as any).city ?? '—' },
    { label: 'Адрес', render: (u: RecommendedUniversity) => (u as any).address ?? '—' },
    { label: 'Эшелон', render: (u: RecommendedUniversity) => getTierBadge(u.tier) },
    {
      label: 'Стоимость',
      render: (u: RecommendedUniversity) => (
        <span className={u.tuition === minTuition ? 'text-success font-bold' : ''}>
          ${u.tuition.toLocaleString()}/год
        </span>
      ),
    },
    { label: 'Стипендии', render: (u: RecommendedUniversity) => u.scholarships || '—' },
    { label: 'GPA', render: (u: RecommendedUniversity) => u.gpaReq ?? '—' },
    { label: 'IELTS', render: (u: RecommendedUniversity) => u.ieltsReq ?? '—' },
    { label: 'SAT', render: (u: RecommendedUniversity) => u.satReq ?? '—' },
    { label: 'Дедлайн', render: (u: RecommendedUniversity) => new Date(u.deadline).toLocaleDateString('ru-RU') },
    {
      label: 'Acceptance Rate',
      render: (u: RecommendedUniversity) => (
        <span className={u.acceptanceRate === maxAcceptance ? 'text-success font-bold' : ''}>
          {Math.round(u.acceptanceRate * 100)}%
        </span>
      ),
    },
    {
      label: 'Рейтинг',
      render: (u: RecommendedUniversity) => (
        <span className={u.ranking === bestRanking ? 'text-success font-bold' : ''}>
          #{u.ranking}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="text-center">
        <h2 className="text-heading-md mb-2">Сравнение вузов</h2>
        <p className="text-body text-text-secondary">
          {selectedUnis.length} вузов выбрано · лучшие значения подсвечены
        </p>
      </div>

      <div className="overflow-x-auto rounded-card shadow-card border border-bg-border">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-bg-surface border-b border-bg-border">
              <th className="p-4 font-semibold text-text-secondary text-body-sm">Характеристика</th>
              {selectedUnis.map((u) => (
                <th key={u.id} className="p-4 text-card-title font-bold text-text min-w-[180px]">
                  {u.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-border">
            {rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-bg' : 'bg-bg-surface/50'}>
                <td className="p-4 text-text-secondary font-medium text-body-sm">{row.label}</td>
                {selectedUnis.map((u) => (
                  <td key={u.id} className="p-4 text-body-sm">{row.render(u)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="secondary">Назад</Button>
        <Button onClick={onNext}>Далее — Roadmap</Button>
      </div>
    </div>
  );
}
