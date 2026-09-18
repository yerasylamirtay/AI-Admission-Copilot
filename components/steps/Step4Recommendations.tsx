'use client';

import React, { useState, useEffect } from 'react';
import { Profile, RecommendResult, RecommendedUniversity } from '@/lib/types';

interface Step4RecommendationsProps {
  profile: Partial<Profile>;
  recommendations: RecommendResult | null;
  selectedForComparison: string[];
  onToggleComparison: (id: string) => void;
  isLoadingRecommend?: boolean;
  onNext: () => void;
  onBack: () => void;
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
    Kazakhstan: '🇰🇿',
    Germany: '🇩🇪',
    Estonia: '🇪🇪',
    'Czech Republic': '🇨🇿',
    Poland: '🇵🇱',
    Sweden: '🇸🇪',
    Singapore: '🇸🇬',
    'South Korea': '🇰🇷',
    Japan: '🇯🇵',
    'Hong Kong': '🇭🇰',
    USA: '🇺🇸',
    'United States': '🇺🇸',
    Switzerland: '🇨🇭',
    Netherlands: '🇳🇱',
    Austria: '🇦🇹',
    Italy: '🇮🇹',
    France: '🇫🇷',
    Spain: '🇪🇸',
    Ireland: '🇮🇪',
    UK: '🇬🇧',
    China: '🇨🇳',
    Taiwan: '🇹🇼',
  };

  return (
    <div
      className={`card p-6 flex flex-col justify-between transition-all duration-200 relative ${
        isSelected ? 'border-primary ring-2 ring-primary/20 shadow-card-hover' : 'hover:border-primary/40'
      }`}
    >
      <div>
        {/* Top header */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <h4 className="text-lg font-bold text-ink tracking-tight leading-snug">{uni.name}</h4>
            <p className="text-xs font-medium text-ink-muted mt-0.5 flex items-center gap-1.5">
              <span>{countryFlag[uni.country] ?? '🌍'}</span>
              <span>{uni.country}</span>
              {uni.city && <span>· {uni.city}</span>}
            </p>
            {uni.address && (
              <p className="text-[11px] text-ink-light truncate max-w-[280px] mt-0.5">
                📍 {uni.address}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggle(uni.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all flex-shrink-0 ${
              isSelected
                ? 'bg-primary text-white shadow-purple'
                : 'bg-surface-muted text-ink-secondary hover:text-primary hover:bg-primary-light border border-surface-border'
            }`}
          >
            {isSelected ? '✓ Выбрано' : '+ В сравнение'}
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-3 my-3 border-y border-surface-border text-xs">
          <div className="p-2 rounded-lg bg-surface-secondary">
            <span className="text-ink-muted block text-[11px]">💰 Стоимость</span>
            <span className="font-bold text-ink">
              {uni.tuition === 0 ? 'Грант ($0)' : `$${uni.tuition.toLocaleString()}/год`}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-surface-secondary">
            <span className="text-ink-muted block text-[11px]">📊 Проходной GPA</span>
            <span className="font-bold text-ink">{uni.gpaReq || 'От 3.5'}</span>
          </div>

          <div className="p-2 rounded-lg bg-surface-secondary">
            <span className="text-ink-muted block text-[11px]">🌐 Тесты</span>
            <span className="font-bold text-ink">
              {uni.ieltsReq ? `IELTS ${uni.ieltsReq}` : uni.satReq ? `SAT ${uni.satReq}` : uni.entReq ? `ЕНТ ${uni.entReq}` : 'Без требований'}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-surface-secondary">
            <span className="text-ink-muted block text-[11px]">📅 Дедлайн</span>
            <span className="font-bold text-ink">
              {uni.deadline ? new Date(uni.deadline).toLocaleDateString('ru-RU') : '2026-07-15'}
            </span>
          </div>
        </div>

        {/* Scholarships & Housing */}
        {uni.scholarships && (
          <div className="mb-3 text-xs text-ink-secondary bg-primary-light/50 p-2.5 rounded-lg border border-primary/10">
            <span className="font-bold text-primary block text-[11px] mb-0.5">🎓 Гранты & Стипендии:</span>
            <p className="line-clamp-2">{uni.scholarships}</p>
          </div>
        )}
      </div>

      {/* AI Explanation Footer */}
      <div className="pt-3 mt-2 border-t border-surface-border">
        {loading ? (
          <div className="space-y-1.5 animate-pulse">
            <div className="h-3 bg-surface-muted rounded w-full" />
            <div className="h-3 bg-surface-muted rounded w-4/5" />
          </div>
        ) : (
          <div className="text-xs text-ink-secondary leading-relaxed bg-surface-secondary p-3 rounded-xl border border-surface-border">
            <span className="font-bold text-primary mr-1">🤖 AI-оценка:</span>
            {explanation || `Совпадение профиля: ${uni.matchScore}%. Рекомендуется к подаче.`}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Step4Recommendations({
  profile,
  recommendations,
  selectedForComparison,
  onToggleComparison,
  isLoadingRecommend,
  onNext,
  onBack,
}: Step4RecommendationsProps) {
  if (isLoadingRecommend || !recommendations) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-in">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-2xl font-bold text-ink">ИИ подбирает университеты...</h2>
        <p className="text-sm text-ink-muted max-w-md mx-auto">
          Сравниваем требования 120+ вузов с вашим средним баллом, тестами и бюджетом.
        </p>
      </div>
    );
  }

  const { dream, target, safety } = recommendations;
  const total = dream.length + target.length + safety.length;

  const tiers = [
    { key: 'dream', title: '🌟 Dream Вузы', subtitle: 'Максимальный престиж (конкурс выше)', list: dream, badgeClass: 'badge-dream' },
    { key: 'target', title: '🎯 Target Вузы', subtitle: 'Оптимальное попадание под твой профиль', list: target, badgeClass: 'badge-target' },
    { key: 'safety', title: '🛡️ Safety Вузы', subtitle: 'Надежная подушка безопасности с грантами', list: safety, badgeClass: 'badge-safety' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-10 animate-fade-in pb-28">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold uppercase tracking-wider">
          🏛️ Каталог рекомендаций
        </div>
        <h2 className="text-3xl font-extrabold text-ink">
          Университеты, подобранные для тебя
        </h2>
        <p className="text-sm text-ink-muted max-w-xl mx-auto">
          Найдено {total} вариантов. Выберите до 8 вузов для детального сравнения критериев.
        </p>
      </div>

      {/* Tiers Sections */}
      {tiers.map(({ key, title, subtitle, list, badgeClass }) =>
        list.length > 0 ? (
          <section key={key} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-surface-border pb-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-ink">{title}</h3>
                <span className={badgeClass}>{list.length} вузов</span>
              </div>
              <span className="text-xs text-ink-muted">{subtitle}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {list.map((uni) => (
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

      {/* Floating Bottom Compare Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-surface-border shadow-card z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="btn-secondary text-xs py-3 px-5 hidden sm:block"
          >
            ← Назад к диагностике
          </button>

          <div className="flex items-center gap-2 text-xs text-ink-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span>Выбрано: <strong>{selectedForComparison.length}</strong> из 8 возможных</span>
          </div>

          <button
            onClick={onNext}
            disabled={selectedForComparison.length < 2}
            className="btn-primary text-sm py-3.5 px-8 flex-1 sm:flex-initial"
          >
            Сравнить выбранные ({selectedForComparison.length}) →
          </button>
        </div>
      </div>
    </div>
  );
}
