"use client";

import React, { useState, useRef } from "react";

export interface RankItem {
  id: string;
  label: string;
  emoji: string;
}

export interface DragRankingProps {
  items: RankItem[];
  value: string[];
  onChange: (ordered: string[]) => void;
  className?: string;
}

export function DragRanking({ items, value, onChange, className = "" }: DragRankingProps) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map value to items
  const orderedItems = value
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as RankItem[];

  const handleDragStart = (idx: number, e: React.DragEvent | React.TouchEvent) => {
    setDraggedIdx(idx);
    if ('dataTransfer' in e) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', idx.toString());
    }
  };

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    
    const newOrder = [...value];
    const item = newOrder.splice(draggedIdx, 1)[0];
    newOrder.splice(idx, 0, item);
    
    setDraggedIdx(idx);
    onChange(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIdx === null) return;
    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const itemElement = target?.closest('[data-idx]');
    if (itemElement) {
      const targetIdx = parseInt(itemElement.getAttribute('data-idx') || '-1', 10);
      if (targetIdx !== -1 && targetIdx !== draggedIdx) {
        const newOrder = [...value];
        const item = newOrder.splice(draggedIdx, 1)[0];
        newOrder.splice(targetIdx, 0, item);
        setDraggedIdx(targetIdx);
        onChange(newOrder);
      }
    }
  };

  return (
    <div ref={containerRef} className={`flex flex-col gap-2 ${className}`}>
      {orderedItems.map((item, idx) => (
        <div
          key={item.id}
          data-idx={idx}
          draggable
          onDragStart={(e) => handleDragStart(idx, e)}
          onDragOver={(e) => handleDragOver(idx, e)}
          onDragEnd={handleDragEnd}
          onTouchStart={(e) => handleDragStart(idx, e)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
          className={`flex items-center gap-3 p-3 bg-bg-surface border border-bg-border rounded-lg cursor-grab active:cursor-grabbing transition-transform ${draggedIdx === idx ? 'opacity-50 scale-95 shadow-glow' : 'shadow-sm'}`}
        >
          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-bg rounded-full text-xs font-bold text-text-secondary border border-bg-border">
            {idx + 1}
          </span>
          <span className="text-xl">{item.emoji}</span>
          <span className="font-medium text-text flex-grow">{item.label}</span>
          <span className="text-text-secondary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 9H16M8 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      ))}
    </div>
  );
}
