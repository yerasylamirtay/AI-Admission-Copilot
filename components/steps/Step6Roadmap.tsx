"use client";

import React, { useState, useEffect } from 'react';
import { Profile, RecommendResult, RoadmapResult, RoadmapCategory } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface StepProps {
  profile: Partial<Profile>;
  onNext: () => void;
  onBack: () => void;
  recommendations: RecommendResult | null;
  selectedForComparison: string[];
  roadmap: RoadmapResult | null;
  roadmapProgress: Record<string, boolean>;
  onToggleRoadmapItem: (id: string) => void;
  onSetRoadmap?: (roadmap: RoadmapResult) => void;
  [key: string]: any;
}

export default function Step6Roadmap({
  profile,
  recommendations,
  selectedForComparison,
  roadmap,
  roadmapProgress,
  onToggleRoadmapItem,
  onSetRoadmap,
  onBack,
  onNext,
}: StepProps) {
  const [localRoadmap, setLocalRoadmap] = useState<RoadmapResult | null>(roadmap);
  const [loading, setLoading] = useState(!roadmap);
  const [filter, setFilter] = useState<RoadmapCategory | 'all'>('all');

  useEffect(() => {
    if (roadmap) {
      setLocalRoadmap(roadmap);
      setLoading(false);
      return;
    }

    const fetchRoadmap = async () => {
      setLoading(true);
      try {
        const allRecs = [
          ...(recommendations?.dream ?? []),
          ...(recommendations?.target ?? []),
          ...(recommendations?.safety ?? []),
        ];
        const selectedUnis = allRecs.filter((u) => selectedForComparison.includes(u.id));

        const res = await fetch('/api/roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, universities: selectedUnis }),
        });

        if (!res.ok) throw new Error('Failed to fetch roadmap');
        const data = await res.json();
        const result = data.roadmap ?? data;
        setLocalRoadmap(result);
        onSetRoadmap?.(result);
      } catch (error) {
        console.error(error);
        // Fallback roadmap
        const fallback: RoadmapResult = {
          items: [
            { id: 'fb-1', title: 'Сдать IELTS / TOEFL', description: 'Зарегистрироваться и подготовиться к языковому экзамену', category: 'exams', deadline: '2027-01-15', completed: false, priority: 'high' },
            { id: 'fb-2', title: 'Подготовить транскрипт', description: 'Запросить официальный транскрипт в школе', category: 'documents', deadline: '2027-02-01', completed: false, priority: 'medium' },
            { id: 'fb-3', title: 'Написать мотивационное письмо', description: 'Составить черновик и получить обратную связь', category: 'essays', deadline: '2027-02-15', completed: false, priority: 'high' },
            { id: 'fb-4', title: 'Запросить рекомендации', description: 'Попросить 2 учителей написать рекомендательные письма', category: 'documents', deadline: '2027-02-15', completed: false, priority: 'high' },
            { id: 'fb-5', title: 'Подать заявки', description: 'Проверить и отправить все документы до дедлайна', category: 'documents', deadline: '2027-03-15', completed: false, priority: 'high' },
          ],
          weeklyPriority: { title: 'Сдать IELTS / TOEFL', description: 'Самый срочный экзамен — начните подготовку сегодня' },
        };
        setLocalRoadmap(fallback);
        onSetRoadmap?.(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [roadmap]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <h2 className="text-heading-md">Ваш Roadmap</h2>
        <Skeleton className="h-16 w-full" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
    );
  }

  const items = localRoadmap?.items ?? [];
  const filteredItems = items
    .filter((item) => filter === 'all' || item.category === filter)
    .sort((a, b) => {
      // Completed items go to bottom
      const aDone = roadmapProgress[a.id] ? 1 : 0;
      const bDone = roadmapProgress[b.id] ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      // Then sort by deadline
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  const completedCount = items.filter((item) => roadmapProgress[item.id]).length;
  const totalCount = items.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const getDeadlineColor = (dateStr: string) => {
    const days = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (days < 14) return 'text-red-400';
    if (days < 30) return 'text-warning';
    return 'text-success';
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'exams': return '📝 Экзамены';
      case 'documents': return '📄 Документы';
      case 'essays': return '✍️ Эссе';
      default: return '📌 Другое';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      <h2 className="text-heading-md">Ваш Roadmap</h2>

      {/* Progress bar */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-body font-semibold">Выполнено {completedCount} из {totalCount}</span>
          <span className="text-body-sm text-text-secondary">{progressPercent}%</span>
        </div>
        <div className="w-full bg-bg-border h-2.5 rounded-full overflow-hidden">
          <div className="bg-success h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </Card>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'exams', 'documents', 'essays'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`chip ${filter === cat ? 'chip-active' : ''}`}
          >
            {cat === 'all' ? '📋 Все' : getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isDone = roadmapProgress[item.id];
          return (
            <Card
              key={item.id}
              className={`p-4 flex items-start gap-4 transition-all duration-200 ${
                isDone ? 'opacity-50' : 'hover:-translate-y-0.5'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  checked={isDone ?? false}
                  onChange={() => onToggleRoadmapItem(item.id)}
                  className="w-5 h-5 rounded border-bg-border cursor-pointer accent-accent"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <h3 className={`text-card-title font-semibold ${isDone ? 'line-through text-text-secondary' : ''}`}>
                    {item.title}
                  </h3>
                  <span className={`text-caption px-2 py-0.5 rounded-full ${
                    item.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    item.priority === 'medium' ? 'bg-warning-muted text-warning border border-warning/20' :
                    'bg-bg-border text-text-secondary'
                  }`}>
                    {item.priority === 'high' ? '🔴 Важно' : item.priority === 'medium' ? '🟡 Средний' : '🟢 Низкий'}
                  </span>
                </div>
                <p className="text-body-sm text-text-secondary mt-1">{item.description}</p>
                <div className="flex items-center gap-4 mt-2 text-caption">
                  <span className="text-text-secondary">{getCategoryLabel(item.category)}</span>
                  <span className={isDone ? 'text-text-secondary' : getDeadlineColor(item.deadline)}>
                    📅 {new Date(item.deadline).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="secondary">Назад</Button>
        <Button onClick={onNext}>Далее — Финал</Button>
      </div>
    </div>
  );
}
