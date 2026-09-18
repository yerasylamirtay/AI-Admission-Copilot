'use client';

import { useEffect, useState } from 'react';

export type AppSection = 'profile' | 'diagnose' | 'universities' | 'roadmap';

export default function Header({ section, onNavigate, onLogout }: { section: AppSection; onNavigate: (section: AppSection) => void; onLogout: () => void }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => { fetch('/api/token-budget').then(r => r.json()).then(d => setRemaining(d.remaining)).catch(() => undefined); }, []);
  return <header className="sticky top-0 z-20 border-b border-bg-border bg-bg/90 backdrop-blur-md">
    <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
      <button className="font-bold gradient-text text-xl mr-auto" onClick={() => onNavigate('profile')}>AdmitPath</button>
      {(['profile', 'diagnose', 'universities', 'roadmap'] as AppSection[]).map((item) => <button key={item} onClick={() => onNavigate(item)} className={`text-caption md:text-body-sm px-2 py-1 rounded-button ${section === item ? 'text-accent bg-accent-muted' : 'text-text-secondary hover:text-text'}`}>
        {item === 'profile' ? 'Профиль' : item === 'diagnose' ? 'Диагностика' : item === 'universities' ? 'Вузы' : 'План поступления'}
      </button>)}
      <span className="text-[11px] text-text-muted border border-bg-border rounded-full px-2 py-1">AI: осталось {remaining ?? '…'} из 60 запросов</span>
      <button onClick={onLogout} className="text-caption text-text-secondary hover:text-warning">Выход</button>
    </div>
  </header>;
}
