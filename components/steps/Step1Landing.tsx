'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Step1LandingProps { onStart: () => void; onLoginSuccess: (user: any) => void; }

export default function Step1Landing({ onStart, onLoginSuccess }: Step1LandingProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleEmailAuth(event: React.FormEvent) {
    event.preventDefault(); setErrorMsg(null); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) onLoginSuccess(data.user);
    } catch (error: any) { setErrorMsg(error.message || 'Не удалось войти. Проверь email и пароль.'); }
    finally { setLoading(false); }
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault(); setRegisterMessage(null); setRegisterLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email: registerEmail, password: registerPassword });
      if (error) throw error;
      if (data.session && data.user) onLoginSuccess(data.user);
      else setRegisterMessage('Аккаунт создан. Проверь почту и подтверди email, чтобы продолжить.');
    } catch (error: any) { setRegisterMessage(error.message || 'Не удалось создать аккаунт.'); }
    finally { setRegisterLoading(false); }
  }

  return (
    <div id="top" className="welcome-page">
      <nav className="landing-nav"><a href="#top" className="landing-brand"><span className="brand-mark">↗</span><span>AI Admission <b>Copilot</b></span></a><div className="landing-nav-links"><a href="#about">О нас</a><a href="#about">О проекте</a><a href="#faq">FAQ</a></div><div className="landing-nav-actions"><button className="nav-roadmap" onClick={() => setShowRegisterModal(true)}>Get your roadmap ↗</button></div></nav>
      <section className="welcome-hero">
        <div className="welcome-copy">
          <div className="welcome-logo"><img src="/brand/admission-logo-dark.png" alt="AI Admission Copilot" /></div>
          <p className="welcome-kicker">AI ADMISSION COPILOT</p>
          <h1>Добро пожаловать<br /><span>в свой следующий шаг.</span></h1>
          <p className="welcome-description">Персональный путь к университету мечты — от первого интереса до понятного плана поступления.</p>
          <div className="welcome-actions"><button onClick={() => setShowRegisterModal(true)} className="welcome-primary">Get your roadmap <span>↗</span></button><button onClick={() => setShowAuthModal(true)} className="welcome-secondary">Войти в аккаунт</button></div>
          <p className="welcome-note"><span /> Без лишних анкет. Только то, что помогает поступить.</p>
        </div>
        <div className="showcase-frame"><img src="/brand/iphone-showcase.png" alt="AI Admission Copilot на телефоне" /><div className="showcase-glow" /></div>
      </section>

      <section className="welcome-bottom"><div><strong>Один профиль</strong><span>вместо десятков вкладок</span></div><div><strong>Понятный маршрут</strong><span>с объяснением каждого выбора</span></div><div><strong>Следующий шаг</strong><span>всегда перед глазами</span></div></section>
      <section className="landing-about" id="about"><div className="landing-about-copy"><p className="welcome-kicker">О НАС</p><h2>Помогаем выбрать<br /><span>свой следующий шаг.</span></h2><p>AI Admission Copilot создан для абитуриентов, которым нужен не бесконечный список вузов, а спокойный и понятный путь к поступлению.</p></div><div className="about-project-card"><div className="about-project-number">01</div><div><p>О ПРОЕКТЕ</p><h3>Профиль → рекомендации → roadmap</h3><span>Мы соединяем интересы, оценки, экзамены, бюджет и цели в один персональный маршрут.</span></div></div></section>
      <section className="landing-faq" id="faq"><div><p className="welcome-kicker">ЧАСТЫЕ ВОПРОСЫ</p><h2>Всё понятно<br />с первого шага.</h2></div><div className="faq-list"><details open><summary>Что я получу после регистрации?</summary><p>Персональный профиль, рекомендации университетов, сравнение вариантов и roadmap с ближайшим действием.</p></details><details><summary>AI учитывает мои баллы SAT, IELTS и ЕНТ?</summary><p>Да. Баллы экзаменов, интересы, страна, бюджет и ограничения влияют на подбор из базы университетов.</p></details><details><summary>Данные о вузах точные?</summary><p>Демонстрационные данные помогают пройти сценарий. Перед подачей проверяй требования и дедлайны на официальном сайте вуза.</p></details></div></section>

      {showAuthModal && <div className="auth-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"><div className="auth-card relative w-full max-w-md animate-slide-up"><button onClick={() => setShowAuthModal(false)} className="absolute right-5 top-4 text-xl text-ink-muted hover:text-ink">×</button><div className="mb-6 text-center"><img src="/brand/admission-logo-dark.png" alt="AI Admission Copilot" className="auth-logo-image mx-auto mb-3" /><h2 className="text-2xl font-bold">Вход в аккаунт</h2><p className="mt-1 text-xs text-ink-muted">Сохрани свой персональный путь</p></div>{errorMsg && <div className="mb-4 rounded-button border border-danger/20 bg-danger-muted p-3 text-xs text-danger">{errorMsg}</div>}<form onSubmit={handleEmailAuth} className="space-y-3"><input type="email" required placeholder="name@example.com" className="input-field text-sm" value={email} onChange={e => setEmail(e.target.value)} /><input type="password" required placeholder="Введите пароль" className="input-field text-sm" value={password} onChange={e => setPassword(e.target.value)} /><button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}Войти в AdmitPath</button></form><div className="mt-5 border-t border-surface-border pt-4 text-center"><p className="text-xs text-ink-muted">Ещё нет аккаунта?</p><button onClick={() => { setShowAuthModal(false); setShowRegisterModal(true); }} className="mt-1 text-sm font-bold text-primary hover:underline">Создать аккаунт ↗</button></div></div></div>}
      {showRegisterModal && <div className="auth-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"><div className="auth-card relative w-full max-w-md animate-slide-up"><button onClick={() => setShowRegisterModal(false)} className="absolute right-5 top-4 text-xl text-ink-muted hover:text-ink">×</button><div className="mb-6 text-center"><img src="/brand/admission-logo-dark.png" alt="AI Admission Copilot" className="auth-logo-image mx-auto mb-3" /><p className="welcome-kicker">YOUR NEXT STEP</p><h2 className="text-2xl font-bold">Создай свой roadmap</h2><p className="mt-1 text-xs text-ink-muted">Регистрация займёт меньше минуты</p></div>{registerMessage && <div className="mb-4 rounded-button border border-success/20 bg-success-muted p-3 text-xs text-success">{registerMessage}</div>}<form onSubmit={handleRegister} className="space-y-3"><input type="email" required placeholder="name@example.com" className="input-field text-sm" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} /><input type="password" required minLength={6} placeholder="Придумай пароль от 6 символов" className="input-field text-sm" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} /><button type="submit" disabled={registerLoading} className="welcome-primary w-full">{registerLoading ? 'Создаём аккаунт…' : 'Создать roadmap ↗'}</button></form><p className="mt-5 text-center text-xs text-ink-muted">Уже есть аккаунт? <button onClick={() => { setShowRegisterModal(false); setShowAuthModal(true); }} className="font-bold text-primary">Войти</button></p></div></div>}
    </div>
  );
}
