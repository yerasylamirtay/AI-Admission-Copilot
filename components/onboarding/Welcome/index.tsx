'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Welcome({ hasProfile, onContinue, onStart }: { hasProfile: boolean; onContinue: () => void; onStart: (name: string, emoji: string) => void }) {
  const [name, setName] = useState(''); const [emoji, setEmoji] = useState('🧑‍🎓'); const [login, setLogin] = useState(false);
  useEffect(() => { const user = localStorage.getItem('activeUser'); if (user) { const parsed = JSON.parse(user); setName(parsed.name ?? ''); setEmoji(parsed.emoji ?? '🧑‍🎓'); } }, []);
  return <div className="max-w-4xl mx-auto min-h-[85vh] flex items-center justify-center px-4 py-12"><div className="w-full space-y-8">
    <div className="text-center"><h1 className="text-5xl font-bold gradient-text">AdmitPath</h1><p className="text-xl text-text-secondary mt-3">Персональный маршрут поступления в университет</p></div>
    <Card className="max-w-lg mx-auto p-7 space-y-5"><h2 className="text-heading-sm">У вас уже есть профиль?</h2>{hasProfile && <p className="text-body-sm text-text-secondary">{name || 'Ваш профиль'} {emoji} сохранён на этом устройстве.</p>}<div className="flex flex-wrap gap-3"><Button onClick={hasProfile ? onContinue : () => setLogin(true)}>{hasProfile ? 'Продолжить' : 'Войти'}</Button><Button variant="secondary" onClick={() => { localStorage.removeItem('admitpath_state'); setLogin(true); }}>Начать заново</Button></div></Card>
    {(login || !hasProfile) && <Card className="max-w-lg mx-auto p-7 space-y-4"><h2 className="text-heading-sm">Локальный профиль</h2><p className="text-caption text-text-secondary">Пароль не нужен: данные хранятся только в localStorage браузера.</p><input className="input-field" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} /><div className="flex gap-2 text-2xl">{['🧑‍🎓','👩‍💻','🧑‍🔬','🎨','🚀'].map(item => <button type="button" key={item} onClick={() => setEmoji(item)} className={`p-2 rounded-button ${emoji === item ? 'bg-accent-muted ring-1 ring-accent' : 'bg-bg'}`}>{item}</button>)}</div><Button disabled={!name.trim()} onClick={() => { localStorage.setItem('activeUser', JSON.stringify({ name: name.trim(), emoji })); onStart(name.trim(), emoji); }}>Сохранить профиль</Button></Card>}
  </div></div>;
}
