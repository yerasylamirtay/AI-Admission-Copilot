'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      const raw = err.message || '';
      if (raw.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Почта ещё не подтверждена — перейди по ссылке из письма, которое мы отправили при регистрации.');
      } else if (raw.toLowerCase().includes('invalid login credentials')) {
        setErrorMsg('Неверный email или пароль. Если аккаунта ещё нет — создай его ниже.');
      } else {
        setErrorMsg(raw || 'Ошибка авторизации. Проверьте введенные данные.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Не удалось войти через Google.');
    }
  };

  return (
    <div className="auth-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="auth-card relative w-full max-w-md animate-slide-up">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink text-xl font-bold p-1"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <img src="/brand/admission-logo-dark.png" alt="AI Admission Copilot" className="auth-logo-image mx-auto mb-3" />
          <h2 id="auth-title" className="text-2xl font-bold text-ink">
            Вход в аккаунт
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Сохрани свой профиль, диагностику и план в облаке
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-button bg-danger-muted border border-danger/20 text-danger text-xs font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleAuth}
          className="btn-secondary w-full py-3 text-sm mb-4 flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.3 26.7 36 24 36c-5.3 0-9.6-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C39.9 37 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
          Войти через Google
        </button>

        <div className="flex items-center my-5">
          <div className="flex-grow border-t border-surface-border"></div>
              <span className="flex-shrink mx-3 text-xs text-ink-light font-medium uppercase">Email и пароль</span>
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
            Войти в AdmitPath
          </button>
        </form>

        <div className="mt-5 border-t border-surface-border pt-4 text-center">
          <p className="text-xs text-ink-muted">Ещё нет аккаунта?</p>
          <a href="/register" className="mt-1 inline-block text-sm font-bold text-primary hover:underline">
            Создать аккаунт ↗
          </a>
        </div>
      </div>
    </div>
  );
}
