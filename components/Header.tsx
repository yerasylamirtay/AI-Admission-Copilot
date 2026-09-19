'use client';

import React from 'react';

interface HeaderProps {
  currentStep: number;
  userEmail?: string | null;
  onNavigate: (step: number) => void;
  onLogout: () => void;
  onGoHome?: () => void;
  isHomeView?: boolean;
}

export default function Header({
  currentStep,
  userEmail,
  onNavigate,
  onLogout,
  onGoHome,
  isHomeView,
}: HeaderProps) {
  return (
    <header className="app-header sticky top-0 z-40 border-b border-surface-border">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <span className="brand-mark shadow-purple transition-transform group-hover:-rotate-6">
              ↗
            </span>
            <div>
              <span className="text-xl font-bold text-ink tracking-tight block">
                Admit<span className="text-primary">Path</span>
              </span>
              <span className="text-[10px] text-ink-muted -mt-1 block font-medium">AI Admission Copilot</span>
            </div>
          </button>

          {/* Navigation — step numbers shifted by -1 vs the old version:
              login is a gate now, not a numbered step. */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface-muted p-1 rounded-full border border-surface-border text-xs font-semibold">
            <button
              type="button"
              onClick={onGoHome}
              className={`px-3 py-1.5 rounded-full transition-all ${
                isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
              }`}
            >
              ◈ Дашборд
            </button>
            <button
              type="button"
              onClick={() => onNavigate(1)}
              className={`px-3 py-1.5 rounded-full transition-all ${
                currentStep === 1 && !isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Профиль
            </button>
            <button
              type="button"
              onClick={() => onNavigate(2)}
              className={`px-3 py-1.5 rounded-full transition-all ${
                currentStep === 2 && !isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Диагностика
            </button>
            <button
              type="button"
              onClick={() => onNavigate(3)}
              className={`px-3 py-1.5 rounded-full transition-all ${
                currentStep === 3 && !isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Вузы
            </button>
            <button
              type="button"
              onClick={() => onNavigate(4)}
              className={`px-3 py-1.5 rounded-full transition-all ${
                currentStep === 4 && !isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Сравнение
            </button>
            <button
              type="button"
              onClick={() => onNavigate(5)}
              className={`px-3 py-1.5 rounded-full transition-all ${
                currentStep === 5 && !isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Roadmap
            </button>
          </nav>
        </div>

        {/* Header only renders when the user is authenticated (see
            OnboardingWizard's auth gate), so this is always the
            logged-in view — no "Войти" fallback needed here anymore. */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-ink truncate max-w-[180px]">
              {userEmail}
            </span>
            <span className="text-[11px] text-success font-medium">Аккаунт подключен</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-button text-danger hover:bg-danger-muted border border-transparent hover:border-danger/20 transition-all"
          >
            Выйти ↗
          </button>
        </div>
      </div>
    </header>
  );
}
