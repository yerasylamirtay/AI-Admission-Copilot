'use client';

import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

const STEP_LABELS = [
  'Вход',
  'Профиль',
  'Диагностика',
  'Вузы',
  'Сравнение',
  'Roadmap',
  'План действий'
];

export default function ProgressBar({ currentStep, totalSteps = 7, onStepClick }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round(((currentStep - 1) / (totalSteps - 1)) * 100));

  return (
    <div className="w-full bg-white border-b border-surface-border sticky top-0 z-30 shadow-soft">
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Top bar with labels and progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Шаг {currentStep} из {totalSteps}: <span className="text-ink font-bold">{STEP_LABELS[currentStep - 1] || ''}</span>
          </span>
          <span className="text-xs font-bold text-ink-muted">
            {percentage}% завершено
          </span>
        </div>

        {/* Linear progress bar */}
        <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <button
                key={step}
                type="button"
                onClick={() => onStepClick && isCompleted && onStepClick(step)}
                disabled={!isCompleted}
                title={STEP_LABELS[step - 1]}
                className={`flex items-center gap-1.5 transition-all text-xs font-medium ${
                  isCompleted
                    ? 'text-primary cursor-pointer hover:underline'
                    : isCurrent
                    ? 'text-ink font-bold'
                    : 'text-ink-light cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-primary text-white'
                      : isCurrent
                      ? 'border-2 border-primary text-primary bg-primary-light'
                      : 'bg-surface-muted text-ink-light'
                  }`}
                >
                  {isCompleted ? '✓' : step}
                </span>
                <span className="hidden md:inline">{STEP_LABELS[step - 1]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
