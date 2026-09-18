'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Step1LandingProps {
  onStart: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function Step1Landing({ onStart, onLoginSuccess }: Step1LandingProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка авторизации. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка входа через Google');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider animate-fade-in">
          🚀 AI-копилот поступления в топ-вузы
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight leading-tight">
          Персональный маршрут поступления <br className="hidden sm:inline" />
          <span className="text-primary">без стресса и хаоса</span>
        </h1>

        <p className="text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
          За 10 минут получи список вузов, где у тебя <strong className="text-ink">реальные шансы</strong> на грант и поступление, а также адаптивный пошаговый план действий.
        </p>

        {/* Big CTA button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary text-base px-8 py-4 shadow-purple w-full sm:w-auto text-center"
          >
            Начать бесплатно →
          </button>
        </div>
      </div>

      {/* 3 Core Value Propositions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="card text-center p-8 hover:shadow-card-hover transition-all">
          <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-2xl mx-auto mb-5">
            🎯
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">AI-диагностика профиля</h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            Умный диалог с ИИ собирает твои интересы, оценки и тесты за пару минут без нудных анкет.
          </p>
        </div>

        <div className="card text-center p-8 hover:shadow-card-hover transition-all">
          <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-2xl mx-auto mb-5">
            🏛️
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">Подбор из 120+ вузов</h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            Разделение на Dream, Target и Safety с точным AI-объяснением твоих шансов и условий гранта.
          </p>
        </div>

        <div className="card text-center p-8 hover:shadow-card-hover transition-all">
          <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-2xl mx-auto mb-5">
            📋
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">Адаптивный Roadmap</h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            Пошаговые чек-листы, шаблоны писем учителям, структуры эссе и контроль дедлайнов.
          </p>
        </div>
      </div>

      {/* Auth Modal (shown after clicking "Начать") */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-card p-6 sm:p-8 max-w-md w-full shadow-card border border-surface-border relative animate-slide-up">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink text-xl font-bold p-1"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="w-10 h-10 rounded-button bg-primary text-white font-extrabold inline-flex items-center justify-center text-lg mb-2 shadow-purple">
                A
              </span>
              <h2 className="text-2xl font-bold text-ink">
                {isSignUp ? 'Создать аккаунт' : 'Вход в AdmitPath'}
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Сохрани свой прогресс поступления в облаке
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-button bg-danger-muted border border-danger/20 text-danger text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Google OAuth button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-button border border-surface-border hover:bg-surface-muted text-ink font-semibold text-sm transition-all mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Войти через Google
            </button>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-surface-border"></div>
              <span className="flex-shrink mx-3 text-xs text-ink-light font-medium uppercase">или через Email</span>
              <div className="flex-grow border-t border-surface-border"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="input-field text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Пароль</label>
                <input
                  type="password"
                  required
                  placeholder="Минимум 6 символов"
                  className="input-field text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm mt-2 flex items-center justify-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isSignUp ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
