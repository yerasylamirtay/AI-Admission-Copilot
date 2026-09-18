"use client";

import React from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: "text" | "card" | "circle";
}

export function Skeleton({
  width,
  height,
  className = "",
  variant = "text",
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded",
    card: "rounded-card",
    circle: "rounded-full",
  };

  return (
    <div
      className={`skeleton ${variantClasses[variant]} ${className}`}
      style={{
        width: width ?? (variant === "text" ? "100%" : undefined),
        height: height ?? (variant === "text" ? "1.25rem" : undefined),
      }}
    />
  );
}
