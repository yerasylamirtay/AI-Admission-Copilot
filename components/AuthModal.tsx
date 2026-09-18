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
      setErrorMsg(err.message || 'Ошибка авторизации. Проверьте введенные данные.');
    } finally {
      setLoading(false);
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
