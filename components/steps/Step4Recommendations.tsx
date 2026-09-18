"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Profile, RecommendResult, RecommendedUniversity } from '@/lib/types';

interface StepProps {
  profile: Partial<Profile>;
  onNext: () => void;
  onBack: () => void;
  recommendations: RecommendResult | null;
  selectedForComparison: string[];
  onToggleComparison: (id: string) => void;
  isLoadingRecommend?: boolean;
  [key: string]: any;
}

function UniCard({
  uni,
  profile,
  isSelected,
  onToggle,
}: {
  uni: RecommendedUniversity;
  profile: Partial<Profile>;
  isSelected: boolean;
  onToggle: (id: string) => void;
}) {
  const [explanation, setExplanation] = useState<string | null>(uni.explanation ?? null);
  const [loading, setLoading] = useState(!uni.explanation);

  useEffect(() => {
    if (uni.explanation) {
      setExplanation(uni.explanation);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, university: uni, tier: uni.tier }),
    })
      .then((res) => res.json())
      .then((data) => setExplanation(data.explanation))
      .catch(() => setExplanation(null))
      .finally(() => setLoading(false));
  }, [uni.id]);

  const countryFlag: Record<string, string> = {
    'Kazakhstan': '🇰🇿', 'Germany': '🇩🇪', 'Estonia': '🇪🇪', 'Czech Republic': '🇨🇿',
    'Poland': '🇵🇱', 'Sweden': '🇸🇪', 'Singapore': '🇸🇬', 'South Korea': '🇰🇷',
    'Japan': '🇯🇵', 'Hong Kong': '🇭🇰', 'USA': '🇺🇸', 'United States': '🇺🇸',
  };

  return (
    <Card className={`p-5 flex flex-col h-full animate-fade-in transition-all duration-200 ${
      isSelected ? 'border-accent shadow-card-hover' : ''
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-card-title font-bold">{uni.name}</h3>
          <p className="text-caption text-text-secondary mt-1">
            {countryFlag[uni.country] ?? '🌍'} {uni.country}
          </p>
          {(uni as any).city && <p className="text-caption text-text-secondary">{(uni as any).city}, {(uni as any).address}</p>}
        </div>
        <button
          onClick={() => onToggle(uni.id)}
          className={`px-3 py-1.5 text-caption rounded-full font-medium transition-all ${
            isSelected
              ? 'bg-accent text-white'
              : 'bg-bg border border-bg-border text-text-secondary hover:border-accent/50'
          }`}
        >
          {isSelected ? '✓ Выбрано' : '+ Сравнить'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-body-sm">
        <div>
          <span className="text-text-secondary block text-caption">💰 Стоимость</span>
          <span className="font-semibold">${uni.tuition.toLocaleString()}/год</span>
        </div>
        <div>
          <span className="text-text-secondary block text-caption">📊 Min GPA</span>
          <span className="font-semibold">{uni.gpaReq}</span>
        </div>
        <div>
          <span className="text-text-secondary block text-caption">🌐 IELTS</span>
          <span className="font-semibold">{uni.ieltsReq ?? '—'}</span>
        </div>
        <div>
          <span className="text-text-secondary block text-caption">📅 Дедлайн</span>
          <span className="font-semibold">{new Date(uni.deadline).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>

      {/* Acceptance rate bar */}
      <div className="mb-4">
        <div className="flex justify-between text-caption mb-1">
          <span className="text-text-secondary">Acceptance Rate</span>
          <span>{Math.round(uni.acceptanceRate * 100)}%</span>
        </div>
        <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all" style={{ width: `${uni.acceptanceRate * 100}%` }} />
        </div>
      </div>

      {/* AI Explanation */}
      <div className="mt-auto pt-3 border-t border-bg-border">
        {loading ? (
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ) : explanation ? (
          <p className="text-caption text-text-secondary leading-relaxed">🤖 {explanation}</p>
        ) : (
          <p className="text-caption text-text-secondary italic">
            Match Score: {uni.matchScore}%
          </p>
        )}
      </div>
    </Card>
  );
}

export default function Step4Recommendations({
  profile,
  onNext,
  onBack,
  recommendations,
  selectedForComparison,
  onToggleComparison,
  isLoadingRecommend,
}: StepProps) {
  if (!recommendations || isLoadingRecommend) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 py-12">
        <Skeleton className="h-10 w-64 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const { dream, target, safety } = recommendations;
  const total = dream.length + target.length + safety.length;

  const tierSections = [
    { key: 'dream', title: '🌟 Dream', subtitle: 'Сложно, но возможно', unis: dream, badgeClass: 'badge-dream' },
    { key: 'target', title: '🎯 Target', subtitle: 'Оптимальный выбор', unis: target, badgeClass: 'badge-target' },
    { key: 'safety', title: '🛡️ Safety', subtitle: 'Надёжный вариант', unis: safety, badgeClass: 'badge-safety' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-heading-md">Подобранные вузы</h2>
        <p className="text-body text-text-secondary">Найдено {total} вариантов по вашему профилю</p>
      </div>

      {tierSections.map(({ key, title, subtitle, unis, badgeClass }) =>
        unis.length > 0 ? (
          <section key={key} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-heading-sm">{title}</h3>
              <span className={`${badgeClass} text-caption uppercase tracking-wider`}>{subtitle}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {unis.map((uni) => (
                <UniCard
                  key={uni.id}
                  uni={uni}
                  profile={profile}
                  isSelected={selectedForComparison.includes(uni.id)}
                  onToggle={onToggleComparison}
                />
              ))}
            </div>
          </section>
        ) : null
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="secondary">Назад</Button>
      </div>

      {/* Floating bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg-surface/95 glass border-t border-bg-border shadow-lg flex justify-center z-50">
        <Button
          onClick={onNext}
          disabled={selectedForComparison.length < 2}
          className="w-full max-w-md"
        >
          Сравнить выбранные ({selectedForComparison.length})
        </Button>
      </div>
    </div>
  );
}
