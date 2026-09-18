"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Profile, DiagnoseResult } from '@/lib/types';

interface StepProps {
  profile: Partial<Profile>;
  onNext: () => void;
  onBack: () => void;
  diagnoseResult: DiagnoseResult | null;
  isLoadingDiagnose?: boolean;
  [key: string]: any;
}

export default function Step3Diagnose({
  profile,
  onNext,
  onBack,
  diagnoseResult,
  isLoadingDiagnose,
}: StepProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    if (diagnoseResult) {
      setLoadingExplanation(true);
      fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          university: null,
          tier: diagnoseResult.tier,
        }),
      })
        .then((res) => res.json())
        .then((data) => setExplanation(data.explanation))
        .catch(() => setExplanation(null))
        .finally(() => setLoadingExplanation(false));
    }
  }, [diagnoseResult]);

  if (!diagnoseResult || isLoadingDiagnose) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <div className="flex flex-col items-center gap-6">
          <Skeleton variant="circle" className="w-48 h-48" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const { readinessIndex, factors, tier } = diagnoseResult;
  const scoreColor = readinessIndex >= 75 ? 'text-success' : readinessIndex >= 50 ? 'text-warning' : 'text-safety';
  const strokeColor = readinessIndex >= 75 ? '#34D399' : readinessIndex >= 50 ? '#FBBF24' : '#94A3B8';
  const tierLabel = tier === 'high' ? '🚀 Высокая готовность' : tier === 'medium' ? '📈 Средняя готовность' : '⚠️ Требуется подготовка';

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (readinessIndex / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up pb-20">
      {/* Readiness Circle */}
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-heading-md">Индекс готовности</h2>

        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="transparent" stroke="#232838" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="45"
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${scoreColor}`}>{readinessIndex}%</span>
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-body-sm font-semibold ${
          tier === 'high' ? 'bg-success-muted text-success border border-success/20' :
          tier === 'medium' ? 'bg-warning-muted text-warning border border-warning/20' :
          'bg-safety-muted text-safety border border-safety/20'
        }`}>
          {tierLabel}
        </div>
      </div>

      {/* Factor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {factors.map((factor) => {
          const barColor = factor.score >= 75 ? 'bg-success' : factor.score >= 50 ? 'bg-warning' : 'bg-safety';
          return (
            <Card key={factor.name} className="p-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-card-title font-semibold">{factor.label}</h4>
                <span className="text-caption text-text-secondary">Вес: {Math.round(factor.weight * 100)}%</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-2 bg-bg-border rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} transition-all duration-1000`} style={{ width: `${factor.score}%` }} />
                </div>
                <span className="text-body font-bold w-12 text-right">{factor.score}</span>
              </div>
              <p className="text-body-sm text-text-secondary">{factor.detail}</p>
            </Card>
          );
        })}
      </div>

      {/* AI Explanation */}
      <Card className="p-6 border-accent/20 bg-accent/5">
        <div className="flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">🤖</span>
          <div className="flex-1">
            <h3 className="text-card-title font-bold mb-2">AI Анализ профиля</h3>
            {loadingExplanation ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : explanation ? (
              <p className="text-body-sm leading-relaxed whitespace-pre-wrap">{explanation}</p>
            ) : (
              <p className="text-body-sm text-text-secondary">
                ИИ-объяснение временно недоступно. Ваш индекс готовности: {readinessIndex}%.
                Основные факторы: {factors.map((f) => `${f.label} (${f.score})`).join(', ')}.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="secondary">Назад</Button>
        <Button onClick={onNext}>Далее — Подбор вузов</Button>
      </div>
    </div>
  );
}
