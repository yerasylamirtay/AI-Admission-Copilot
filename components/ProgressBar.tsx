"use client";

import React from "react";

export interface ProgressBarProps {
  currentStep: number;
  steps: { label: string }[];
  className?: string;
}

export function ProgressBar({ currentStep, steps, className = "" }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isFuture = idx > currentStep;

          let bgClass = "bg-[#232838]";
          let textClass = "text-text-secondary";
          let borderClass = "";
          let shadowClass = "";

          if (isCompleted) {
            bgClass = "bg-success";
            textClass = "text-white";
          } else if (isCurrent) {
            bgClass = "bg-accent";
            textClass = "text-white";
            shadowClass = "shadow-glow";
          }

          return (
            <React.Fragment key={idx}>
              <div className="relative flex flex-col items-center group">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${bgClass} ${textClass} ${borderClass} ${shadowClass}`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="absolute top-10 hidden md:block w-max text-center">
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isCurrent ? "text-accent" : isCompleted ? "text-success" : "text-text-secondary"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="flex-auto h-1 mx-2 rounded-full overflow-hidden bg-[#232838]">
                  <div
                    className={`h-full transition-all duration-500 ease-in-out ${isCompleted ? "bg-success" : "bg-transparent"}`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Mobile step label */}
      <div className="mt-4 text-center md:hidden">
        <span className="text-sm font-semibold text-accent">
          {steps[currentStep]?.label}
        </span>
      </div>
    </div>
  );
}
