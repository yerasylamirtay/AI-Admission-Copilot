'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      if (data.session) {
        router.push('/');
      } else {
        setSuccess('Аккаунт создан. Проверь почту и перейди по ссылке подтверждения, чтобы войти.');
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось создать аккаунт. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'Не удалось войти через Google.');
    }
  }

  return (
    <main className="landing-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="landing-glow landing-glow-one" />
      <div className="auth-card w-full max-w-md animate-slide-up">
        <a href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-primary">
          <span className="brand-mark">↗</span> AdmitPath
        </a>
        <div className="mb-8">
          <p className="section-kicker">Новый маршрут</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-none tracking-tight text-ink">Создай аккаунт<br /><span className="text-primary">и поступай уверенно.</span></h1>
          <p className="mt-4 text-sm leading-6 text-ink-muted">Сохрани профиль, рекомендации вузов и персональный roadmap в одном месте.</p>
        </div>

        {error && <div className="mb-5 rounded-button border border-danger/20 bg-danger-muted p-3 text-xs font-medium leading-5 text-danger">{error}</div>}
        {success && <div className="mb-5 rounded-button border border-success/20 bg-success-muted p-3 text-xs font-medium leading-5 text-success">{success}</div>}

        <button type="button" onClick={handleGoogleAuth} className="btn-secondary flex w-full items-center justify-center gap-2 py-3.5 mb-4">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.3 26.7 36 24 36c-5.3 0-9.6-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C39.9 37 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
          Зарегистрироваться через Google
        </button>
        <div className="flex items-center gap-3 mb-4"><div className="flex-grow border-t border-surface-border" /><span className="text-xs text-ink-light font-medium uppercase">или email</span><div className="flex-grow border-t border-surface-border" /></div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-ink-secondary">Email</span><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="input-field" /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-ink-secondary">Пароль</span><input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Минимум 6 символов" className="input-field" /></label>
          <button disabled={loading} type="submit" className="btn-primary flex w-full items-center justify-center gap-2 py-3.5">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}Создать аккаунт ↗</button>
        </form>
        <div className="mt-7 border-t border-surface-border pt-5 text-center text-sm"><span className="text-ink-muted">Уже есть аккаунт?</span> <a href="/" className="font-bold text-primary hover:underline">Войти</a></div>
      </div>
    </main>
  );
}
