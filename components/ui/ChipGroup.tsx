"use client";

import React from "react";

export interface ChipOption {
  value: string;
  label: string;
}

export interface ChipGroupProps {
  options: ChipOption[];
  selected: string | string[];
  onChange: (selected: any) => void;
  multiple?: boolean;
  className?: string;
}

export function ChipGroup({
  options,
  selected,
  onChange,
  multiple = false,
  className = "",
}: ChipGroupProps) {
  const isSelected = (val: string) => {
    if (multiple && Array.isArray(selected)) {
      return selected.includes(val);
    }
    return selected === val;
  };

  const handleToggle = (val: string) => {
    if (multiple && Array.isArray(selected)) {
      if (selected.includes(val)) {
        onChange(selected.filter((item) => item !== val));
      } else {
        onChange([...selected, val]);
      }
    } else {
      onChange(val);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleToggle(opt.value)}
          className={`chip ${isSelected(opt.value) ? "chip-active" : ""}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
