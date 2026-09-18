"use client";

import React, { useId } from "react";

export interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  formatValue?: (val: number) => string | number;
  className?: string;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  showValue = true,
  formatValue = (v) => v,
  className = "",
}: SliderProps) {
  const id = useId();
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <label htmlFor={id} className="text-sm font-medium text-text">{label}</label>}
          {showValue && <span className="text-sm font-semibold text-accent">{formatValue(value)}</span>}
        </div>
      )}
      <div className="relative w-full h-2 bg-bg-border rounded-full">
        <div
          className="absolute h-full bg-accent rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -mt-2 w-4 h-4 bg-white rounded-full shadow border-2 border-accent pointer-events-none transition-transform"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
