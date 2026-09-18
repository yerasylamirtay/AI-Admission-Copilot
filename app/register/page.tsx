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
