"use client";

import React from "react";

export interface BadgeProps {
  variant?: "dream" | "target" | "safety" | "info" | "success" | "warning";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "info", children, className = "" }: BadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  let variantClasses = "";
  let icon = "";

  switch (variant) {
    case "dream":
      variantClasses = "badge-dream";
      icon = "🌟";
      break;
    case "target":
      variantClasses = "badge-target";
      icon = "🎯";
      break;
    case "safety":
      variantClasses = "badge-safety";
      icon = "🛡️";
      break;
    case "success":
      variantClasses = "bg-success-muted text-success border border-success/20";
      break;
    case "warning":
      variantClasses = "bg-warning-muted text-warning border border-warning/20";
      break;
    case "info":
    default:
      variantClasses = "bg-accent-muted text-accent border border-accent/20";
      break;
  }

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
}
