'use client';

import React from 'react';

export type AppSection = 'home' | 'profile' | 'diagnose' | 'universities' | 'compare' | 'roadmap' | 'next';

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
    <header className="bg-white border-b border-surface-border sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <span className="w-9 h-9 rounded-button bg-primary text-white font-extrabold flex items-center justify-center text-lg shadow-purple group-hover:bg-primary-hover transition-all">
              A
            </span>
            <div>
              <span className="text-xl font-bold text-ink tracking-tight block">
                Admit<span className="text-primary">Path</span>
              </span>
              <span className="text-[10px] text-ink-muted -mt-1 block font-medium">AI Admission Copilot</span>
            </div>
          </button>

          {/* Navigation links if user is authenticated / completed steps */}
          {userEmail && (
            <nav className="hidden lg:flex items-center gap-1 bg-surface-muted p-1 rounded-full border border-surface-border text-xs font-semibold">
              <button
                onClick={onGoHome}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
                }`}
              >
                🏠 Дашборд
              </button>
              <button
                onClick={() => onNavigate(2)}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  currentStep === 2 && !isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Профиль
              </button>
              <button
                onClick={() => onNavigate(3)}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  currentStep === 3 && !isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Диагностика
              </button>
              <button
                onClick={() => onNavigate(4)}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  currentStep === 4 && !isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Вузы
              </button>
              <button
                onClick={() => onNavigate(6)}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  currentStep === 6 && !isHomeView ? 'bg-white text-primary shadow-soft' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Roadmap
              </button>
            </nav>
          )}
        </div>

        {/* User profile & controls */}
        <div className="flex items-center gap-3">
          {userEmail ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-ink truncate max-w-[180px]">
                  {userEmail}
                </span>
                <span className="text-[11px] text-success font-medium">Аккаунт подключен</span>
              </div>
              <button
                onClick={onLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-button text-danger hover:bg-danger-muted border border-transparent hover:border-danger/20 transition-all"
              >
                Выйти
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate(1)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Войти в аккаунт
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
