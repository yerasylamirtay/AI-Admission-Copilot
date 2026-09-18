"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ interactive = false, className = "", children, ...props }: CardProps) {
  const classes = `card ${interactive ? "card-interactive" : ""} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
