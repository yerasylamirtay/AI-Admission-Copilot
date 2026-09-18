"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { DragRanking } from '@/components/ui/DragRanking';
import { Badge } from '@/components/ui/Badge';
import { Profile, DiagnoseResult, RecommendResult } from '@/lib/types';

interface StepProps {
  profile: Partial<Profile>;
  onUpdateProfile: (updates: Partial<Profile>) => void;
  onNext: () => void;
  onBack: () => void;
  diagnoseResult: DiagnoseResult | null;
  isLoadingDiagnose?: boolean;
  [key: string]: any;
}

const PRIORITY_ITEMS = [
  { id: 'prestige', label: 'Престиж и рейтинг', emoji: '🏆' },
  { id: 'career', label: 'Карьерные перспективы', emoji: '💼' },
  { id: 'city', label: 'Город и страна', emoji: '🌍' },
  { id: 'cost', label: 'Стоимость обучения', emoji: '💰' },
];

export default function Step2Profile({
  profile,
  onUpdateProfile,
  onNext,
  onBack,
  diagnoseResult,
  isLoadingDiagnose,
}: StepProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newOlympiadName, setNewOlympiadName] = useState('');
  const [newOlympiadLevel, setNewOlympiadLevel] = useState<string>('city');

  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [diagnoseResult]);

  const handleChange = (updates: Partial<Profile>) => {
    setHasUnsavedChanges(true);
    onUpdateProfile(updates);
  };

  const handleAddOlympiad = () => {
    if (!newOlympiadName.trim()) return;
    const current = profile.olympiads ?? [];
    handleChange({
      olympiads: [...current, { name: newOlympiadName, level: newOlympiadLevel as any }],
    });
    setNewOlympiadName('');
  };

  const handleRemoveOlympiad = (index: number) => {
    const current = profile.olympiads ?? [];
    handleChange({ olympiads: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Header with live preview */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-heading-md">Профиль абитуриента</h2>
        <div className="flex flex-col items-end gap-2">
          {diagnoseResult && (
            <div className="flex items-center gap-2 bg-bg-surface border border-bg-border px-4 py-2 rounded-button">
              <span className="text-body-sm text-text-secondary">Текущий индекс:</span>
              <span className="text-xl font-bold text-accent">{diagnoseResult.readinessIndex}%</span>
            </div>
          )}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning-muted border border-warning/20 text-warning text-caption">
              📊 Индекс изменится — нажмите Далее для пересчёта
            </div>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <Card className="p-6 space-y-6">
        <h3 className="text-card-title font-semibold">Основная информация</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-body-sm font-medium mb-2">Класс</label>
            <ChipGroup
              options={[
                { value: '9', label: '9 класс' },
                { value: '10', label: '10 класс' },
                { value: '11', label: '11/12 класс' },
              ]}
              selected={profile.grade?.toString() ?? ''}
              onChange={(val: string) => handleChange({ grade: parseInt(val) as any })}
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium mb-2">Тип школы</label>
            <select
              className="input-field"
              value={profile.schoolType ?? 'general'}
              onChange={(e) => handleChange({ schoolType: e.target.value as any })}
            >
              <option value="general">Общеобразовательная</option>
              <option value="nis">НИШ</option>
              <option value="bil">БИЛ</option>
              <option value="lyceum">Лицей</option>
              <option value="gymnasium">Гимназия</option>
              <option value="other">Другое</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-body-sm font-medium mb-2">GPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="input-field"
                value={profile.gpa ?? ''}
                onChange={(e) => handleChange({ gpa: parseFloat(e.target.value) || 0 })}
                placeholder="Например, 4.5"
              />
            </div>
            <div className="w-32">
              <label className="block text-body-sm font-medium mb-2">Шкала</label>
              <select
                className="input-field"
                value={profile.gpaScale ?? '5.0'}
                onChange={(e) => handleChange({ gpaScale: e.target.value as any })}
              >
                <option value="4.0">из 4.0</option>
                <option value="5.0">из 5.0</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Exams */}
      <Card className="p-6 space-y-6">
        <h3 className="text-card-title font-semibold">Экзамены и языки</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* IELTS */}
          <div>
            <label className="block text-body-sm font-medium mb-2">IELTS</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="9"
              disabled={profile.ielts === null}
              className="input-field disabled:opacity-40"
              value={profile.ielts ?? ''}
              onChange={(e) => handleChange({ ielts: parseFloat(e.target.value) || 0 })}
              placeholder="0 – 9"
            />
            <label className="flex items-center gap-2 text-caption mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.ielts === null}
                onChange={(e) => handleChange({ ielts: e.target.checked ? null : undefined })}
                className="rounded border-bg-border"
              />
              Не сдавал
            </label>
          </div>

          {/* SAT */}
          <div>
            <label className="block text-body-sm font-medium mb-2">SAT</label>
            <input
              type="number"
              step="10"
              min="400"
              max="1600"
              disabled={profile.sat === null}
              className="input-field disabled:opacity-40"
              value={profile.sat ?? ''}
              onChange={(e) => handleChange({ sat: parseInt(e.target.value) || 0 })}
              placeholder="400 – 1600"
            />
            <label className="flex items-center gap-2 text-caption mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.sat === null}
                onChange={(e) => handleChange({ sat: e.target.checked ? null : undefined })}
                className="rounded border-bg-border"
              />
              Не сдавал
            </label>
          </div>

          {/* ENT */}
          <div>
            <label className="block text-body-sm font-medium mb-2">ЕНТ</label>
            <input
              type="number"
              step="1"
              min="0"
              max="140"
              disabled={profile.ent === null}
              className="input-field disabled:opacity-40"
              value={profile.ent ?? ''}
              onChange={(e) => handleChange({ ent: parseInt(e.target.value) || 0 })}
              placeholder="0 – 140"
            />
            <label className="flex items-center gap-2 text-caption mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.ent === null}
                onChange={(e) => handleChange({ ent: e.target.checked ? null : undefined })}
                className="rounded border-bg-border"
              />
              Не сдавал
            </label>
          </div>
        </div>
      </Card>

      {/* Olympiads */}
      <Card className="p-6 space-y-6">
        <h3 className="text-card-title font-semibold">Олимпиады и достижения</h3>

        {(profile.olympiads ?? []).length > 0 && (
          <ul className="space-y-2">
            {(profile.olympiads ?? []).map((ol, index) => (
              <li key={index} className="flex items-center justify-between bg-bg p-3 rounded-button border border-bg-border">
                <div>
                  <p className="font-medium text-body-sm">{ol.name}</p>
                  <p className="text-caption text-text-secondary">
                    {ol.level === 'international' ? '🌍 Международная' :
                     ol.level === 'national' ? '🏅 Республиканская' :
                     ol.level === 'region' ? '📍 Областная' :
                     ol.level === 'city' ? '🏙️ Городская' : '🏫 Школьная'}
                  </p>
                </div>
                <button onClick={() => handleRemoveOlympiad(index)} className="text-text-secondary hover:text-warning transition-colors text-lg">✕</button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-3 flex-col md:flex-row">
          <input
            type="text"
            placeholder="Название олимпиады"
            className="input-field flex-1"
            value={newOlympiadName}
            onChange={(e) => setNewOlympiadName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddOlympiad()}
          />
          <select
            className="input-field md:w-48"
            value={newOlympiadLevel}
            onChange={(e) => setNewOlympiadLevel(e.target.value)}
          >
            <option value="international">Международная</option>
            <option value="national">Республиканская</option>
            <option value="region">Областная</option>
            <option value="city">Городская</option>
            <option value="school">Школьная</option>
          </select>
          <Button onClick={handleAddOlympiad} variant="secondary">Добавить</Button>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6 space-y-6">
        <h3 className="text-card-title font-semibold">Предпочтения</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-body-sm font-medium mb-2">Специальности</label>
            <ChipGroup
              options={[
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Business', label: 'Business' },
                { value: 'Medicine', label: 'Medicine' },
                { value: 'Law', label: 'Law' },
                { value: 'Economics', label: 'Economics' },
                { value: 'Data Science', label: 'Data Science' },
                { value: 'Design', label: 'Design' },
                { value: 'Natural Sciences', label: 'Natural Sciences' },
                { value: 'Humanities', label: 'Humanities' },
              ]}
              selected={profile.specialties ?? []}
              onChange={(val: string[]) => handleChange({ specialties: val })}
              multiple
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium mb-2">Регионы</label>
            <ChipGroup
              options={[
                { value: 'kazakhstan', label: '🇰🇿 Казахстан' },
                { value: 'europe', label: '🇪🇺 Европа' },
                { value: 'asia', label: '🌏 Азия' },
                { value: 'usa', label: '🇺🇸 США' },
              ]}
              selected={profile.regions ?? []}
              onChange={(val: string[]) => handleChange({ regions: val as any })}
              multiple
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium mb-2">Бюджет (в год)</label>
            <ChipGroup
              options={[
                { value: 'grant', label: '🆓 Грант/$0' },
                { value: '5k', label: '$5,000' },
                { value: '15k', label: '$15,000' },
                { value: '25k+', label: '$25,000+' },
              ]}
              selected={profile.budget ?? ''}
              onChange={(val: string) => handleChange({ budget: val as any })}
            />
          </div>
        </div>
      </Card>

      {/* Priorities */}
      <Card className="p-6 space-y-4">
        <h3 className="text-card-title font-semibold">Приоритеты</h3>
        <p className="text-body-sm text-text-secondary">Перетащите, чтобы расставить по приоритету (сверху — важнее)</p>
        <DragRanking
          items={PRIORITY_ITEMS}
          value={profile.priorities ?? ['prestige', 'career', 'city', 'cost']}
          onChange={(ordered) => handleChange({ priorities: ordered as any })}
        />
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="secondary">Назад</Button>
        <Button onClick={onNext} loading={isLoadingDiagnose}>
          {isLoadingDiagnose ? 'Анализируем...' : 'Далее — Диагностика'}
        </Button>
      </div>
    </div>
  );
}
