"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Profile } from '@/lib/types';

interface Step1Props {
  onNext: () => void;
  onPresetSelect: (profile: Profile) => void;
  [key: string]: any;
}

const presets: { id: string; title: string; description: string; profile: Profile }[] = [
  {
    id: 'preset-1',
    title: '🏆 Отличник из НИШ',
    description: 'GPA 5.0, IELTS 7.5, SAT 1400, олимпиады',
    profile: {
      grade: 11,
      schoolType: 'nis',
      gpa: 5.0,
      gpaScale: '5.0',
      ielts: 7.5,
      sat: 1400,
      ent: null,
      olympiads: [
        { name: 'Республиканская олимпиада по математике', level: 'national' },
        { name: 'Олимпиада по физике', level: 'region' },
      ],
      specialties: ['Computer Science', 'Engineering'],
      regions: ['europe', 'usa', 'asia'],
      budget: 'grant',
      priorities: ['prestige', 'career', 'city', 'cost'],
    },
  },
  {
    id: 'preset-2',
    title: '📚 Средний ученик',
    description: 'GPA 3.5, ЕНТ 100, Казахстан, бюджет $15k',
    profile: {
      grade: 11,
      schoolType: 'general',
      gpa: 3.5,
      gpaScale: '5.0',
      ielts: null,
      sat: null,
      ent: 100,
      olympiads: [],
      specialties: ['Business', 'Economics'],
      regions: ['kazakhstan'],
      budget: '15k',
      priorities: ['cost', 'career', 'city', 'prestige'],
    },
  },
  {
    id: 'preset-3',
    title: '🎯 Целевой абитуриент',
    description: 'GPA 4.2, IELTS 6.5, SAT 1300, ЕНТ 120',
    profile: {
      grade: 11,
      schoolType: 'lyceum',
      gpa: 4.2,
      gpaScale: '5.0',
      ielts: 6.5,
      sat: 1300,
      ent: 120,
      olympiads: [{ name: 'Городская олимпиада по информатике', level: 'city' }],
      specialties: ['Computer Science', 'Data Science'],
      regions: ['kazakhstan', 'europe', 'asia'],
      budget: '5k',
      priorities: ['career', 'prestige', 'cost', 'city'],
    },
  },
];

export default function Step1Landing({ onNext, onPresetSelect }: Step1Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold gradient-text">AdmitPath</h1>
        <p className="text-xl md:text-2xl text-text-secondary max-w-xl mx-auto">
          Персональный маршрут поступления в университет
        </p>
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {[
          { emoji: '🎯', title: 'AI-диагностика', desc: 'Узнай свои шансы за 2 минуты' },
          { emoji: '🏫', title: 'Подбор вузов', desc: 'Dream / Target / Safety — персонально для тебя' },
          { emoji: '📋', title: 'Пошаговый план', desc: 'Roadmap с дедлайнами и чек-листом' },
        ].map((item, idx) => (
          <Card
            key={idx}
            className="p-6 text-center animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' } as React.CSSProperties}
          >
            <div className="text-4xl mb-3">{item.emoji}</div>
            <h3 className="text-card-title font-bold mb-2">{item.title}</h3>
            <p className="text-body-sm text-text-secondary">{item.desc}</p>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <Button onClick={onNext} className="text-lg px-10 py-4">
        Начать бесплатно →
      </Button>

      {/* Presets for Jury */}
      <div className="w-full max-w-4xl pt-8 border-t border-bg-border">
        <div className="text-center mb-6">
          <h2 className="text-heading-sm mb-2">⚡ Быстрые пресеты для жюри</h2>
          <p className="text-body-sm text-text-secondary">
            Нажмите на профиль, чтобы мгновенно перейти к результатам
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <Card
              key={preset.id}
              interactive
              className="p-5 cursor-pointer"
              onClick={() => onPresetSelect(preset.profile)}
            >
              <h3 className="text-card-title font-bold mb-2">{preset.title}</h3>
              <p className="text-body-sm text-text-secondary mb-3">{preset.description}</p>
              <ul className="text-caption text-text-secondary space-y-1">
                <li>📍 Регионы: {preset.profile.regions.map(r =>
                  r === 'kazakhstan' ? 'KZ' : r === 'europe' ? 'EU' : r === 'asia' ? 'Asia' : 'US'
                ).join(', ')}</li>
                <li>💰 Бюджет: {preset.profile.budget === 'grant' ? 'Грант' : `$${preset.profile.budget}`}</li>
                <li>🎓 Специальности: {preset.profile.specialties.slice(0, 2).join(', ')}</li>
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
