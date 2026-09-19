'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Profile } from '@/lib/types';

interface Step2ProfileChatProps {
  profile: Partial<Profile>;
  onProfileComplete: (profile: Profile) => void;
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Step2ProfileChat({
  profile,
  onProfileComplete,
  onBack,
}: Step2ProfileChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я твой персональный AI-консультант по поступлению в университеты. 👋\n\nДавай за пару минут сформируем твой профиль. Скажи, в каком ты сейчас классе (или уже закончил школу) и какие сферы или специальности тебя больше всего привлекают?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<Profile | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const userMessagesCount = messages.filter(m => m.role === 'user').length;
  const maxMessages = 12;

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading || userMessagesCount >= maxMessages) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/profile-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);

        // Check if reply contains <!--PROFILE_JSON-->...<!--END-->
        const jsonMatch = data.reply.match(/<!--PROFILE_JSON-->([\s\S]*?)<!--END-->/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const extracted = JSON.parse(jsonMatch[1].trim()) as Profile;
            setParsedProfile(extracted);
          } catch (jsonErr) {
            console.warn('Failed to parse profile json from AI response:', jsonErr);
          }
        }
      }
    } catch (err) {
      console.error('Profile chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    // Fast path: the chat already produced a parsed profile naturally
    // (the AI included the <!--PROFILE_JSON--> marker on its own).
    if (parsedProfile) {
      onProfileComplete(parsedProfile);
      return;
    }

    // Reliable path: explicitly ask the AI to extract structured data from
    // the WHOLE real conversation transcript, instead of guessing. This is
    // what actually fixes "always the same numbers" — we no longer depend
    // on the chat happening to end with the JSON marker on the right turn.
    setFinishing(true);
    setFinishError(null);
    try {
      const res = await fetch('/api/profile-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      if (data.profile) {
        onProfileComplete(data.profile as Profile);
        return;
      }
      throw new Error(data.error || 'Пустой ответ извлечения');
    } catch (err: any) {
      console.error('profile-extract failed, using minimal fallback:', err.message);
      setFinishError('Не удалось получить точные данные от ИИ — используем только то, что удалось понять из диалога, остальное будет уточнено позже.');
      // Last-resort fallback: minimal, honestly mostly-null profile, NOT a
      // realistic-looking fake student. This is intentionally sparse so it
      // never silently masquerades as real user data.
      const minimalFallback: Profile = {
        grade: profile.grade ?? null as any,
        interests: profile.interests || [],
        gpa: profile.gpa ?? null as any,
        gpaScale: profile.gpaScale || null as any,
        languages: profile.languages || [],
        exams: profile.exams || {
          ielts: { score: null, date: null, taken: false },
          sat: { score: null, date: null, taken: false },
          ent: { score: null, date: null, taken: false },
        },
        countries: profile.countries || [],
        budget: profile.budget || null as any,
        timeline: profile.timeline || null as any,
        constraints: profile.constraints || null as any,
      };
      onProfileComplete(minimalFallback);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="profile-workspace max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="profile-hero-card">
        <div className="profile-avatar">{profile.grade ? String(profile.grade) : 'AI'}</div>
        <div className="profile-hero-copy"><span>PERSONAL PROFILE</span><h1>Соберём твой маршрут поступления</h1><p>Ответь на несколько коротких вопросов — AI превратит твои цели и баллы в понятный план.</p></div>
        <div className="profile-completion"><strong>{parsedProfile ? '100%' : `${Math.min(90, userMessagesCount * 12)}%`}</strong><span>готово</span><div><i style={{ width: `${parsedProfile ? 100 : Math.min(90, userMessagesCount * 12)}%` }} /></div></div>
      </div>
      <div className="profile-facts"><div><span>Класс / возраст</span><strong>{profile.grade || 'Добавим в диалоге'}</strong></div><div><span>Интересы</span><strong>{profile.interests?.length ? profile.interests.slice(0, 2).join(' · ') : 'Пока не указаны'}</strong></div><div><span>Экзамены</span><strong>{profile.exams ? 'Данные сохранятся здесь' : 'SAT · IELTS · ЕНТ'}</strong></div></div>
      {/* Step header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-border">
        <div>
          <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
            <span>💬</span> AI-интервью профиля
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            ИИ сам извлекает твои оценки, тесты и предпочтения
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-muted text-ink-secondary border border-surface-border">
            Диалог: {userMessagesCount}/{maxMessages}
          </span>
          {parsedProfile && (
            <button
              onClick={handleFinish}
              disabled={finishing}
              className="btn-primary py-2 px-4 text-xs disabled:opacity-60"
            >
              {finishing ? 'Обрабатываем…' : 'Перейти к диагностике →'}
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="card p-4 sm:p-6 mb-4 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4 bg-surface-secondary/50">
        {messages.map((m, idx) => {
          const isAssistant = m.role === 'assistant';
          // Clean out raw JSON tags from UI view
          const displayContent = m.content.replace(/<!--PROFILE_JSON-->[\s\S]*?<!--END-->/g, '').trim();

          return (
            <div
              key={idx}
              className={`flex gap-3 animate-fade-in ${
                isAssistant ? 'justify-start' : 'justify-end'
              }`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-purple">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-card p-4 text-sm leading-relaxed ${
                  isAssistant
                    ? 'bg-white border border-surface-border text-ink shadow-soft'
                    : 'bg-primary text-white shadow-purple'
                }`}
              >
                <div className="whitespace-pre-wrap">{displayContent}</div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 animate-fade-in items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              AI
            </div>
            <div className="bg-white border border-surface-border rounded-card p-4 shadow-soft flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Profile Detected Card if available */}
      {parsedProfile && (
        <div className="mb-4 p-4 rounded-card bg-primary-light border border-primary/30 text-ink animate-slide-up flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              ✓ Профиль успешно сформирован
            </span>
            <p className="text-xs text-ink-secondary">
              Класс: <strong>{parsedProfile.grade}</strong> · GPA: <strong>{parsedProfile.gpa}</strong> · Направления: <strong>{(parsedProfile.interests || []).join(', ')}</strong>
            </p>
          </div>
          <button
            onClick={handleFinish}
            disabled={finishing}
            className="btn-primary py-2.5 px-5 text-xs w-full sm:w-auto disabled:opacity-60"
          >
            {finishing ? 'Обрабатываем…' : 'Далее — Диагностика →'}
          </button>
        </div>
      )}

      {/* Input controls */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            userMessagesCount >= maxMessages
              ? 'Достигнут лимит вопросов. Нажмите "Перейти к диагностике"'
              : 'Напишите ваш ответ консультанту...'
          }
          disabled={loading || userMessagesCount >= maxMessages}
          className="input-field flex-1 text-sm py-3"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading || userMessagesCount >= maxMessages}
          className="btn-primary px-6 py-3 text-sm flex-shrink-0"
        >
          Отправить
        </button>
      </form>

      {/* Quick Suggestion Prompts */}
      {messages.length === 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-ink-muted self-center">Быстрые варианты:</span>
          {[
            '11 класс, интересует IT и Data Science, GPA 4.8',
            '10 класс, хочу на бизнес/экономику, английский B2',
            '11 класс, медицина или биоинженерия, нужен грант'
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="chip text-xs bg-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-surface-border">
        <button
          onClick={onBack}
          className="btn-secondary py-2 px-4 text-xs"
        >
          ← Назад
        </button>
        {!parsedProfile && (
          <button
            onClick={handleFinish}
            disabled={finishing}
            className="text-xs text-ink-muted hover:text-primary underline disabled:opacity-60"
          >
            {finishing ? 'Извлекаем профиль из диалога…' : 'Завершить и извлечь профиль из диалога →'}
          </button>
        )}
      </div>

      {finishError && (
        <p className="mt-3 text-xs text-warning bg-warning-muted border border-warning/30 rounded-button p-2.5">
          ⚠ {finishError}
        </p>
      )}
    </div>
  );
}
