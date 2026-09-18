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

  const handleFinish = () => {
    if (parsedProfile) {
      onProfileComplete(parsedProfile);
    } else {
      // Create fallback profile if user finishes early
      const fallback: Profile = {
        grade: profile.grade || 11,
        interests: profile.interests || ['Computer Science', 'Business'],
        gpa: profile.gpa || 4.5,
        gpaScale: profile.gpaScale || '5.0',
        languages: profile.languages || ['Русский', 'Английский (B2)'],
        exams: profile.exams || {
          ielts: { score: 6.5, date: '2024-05', taken: true },
          sat: { score: null, date: null, taken: false },
          ent: { score: 110, date: '2024-06', taken: true }
        },
        countries: profile.countries || ['Казахстан', 'Европа', 'США'],
        budget: profile.budget || 'grant',
        timeline: '2025',
        constraints: 'Приоритет грант или стипендия'
      };
      onProfileComplete(fallback);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
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
              className="btn-primary py-2 px-4 text-xs"
            >
              Перейти к диагностике →
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
            className="btn-primary py-2.5 px-5 text-xs w-full sm:w-auto"
          >
            Далее — Диагностика →
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
            className="text-xs text-ink-muted hover:text-primary underline"
          >
            Заполнить с готовым пресетом →
          </button>
        )}
      </div>
    </div>
  );
}
