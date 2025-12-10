"use client";

import { clsx } from "clsx";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "toolbar" | "menu";
  active?: boolean;
}

export function RetroButton({
  children,
  className,
  variant = "default",
  active = false,
  disabled,
  ...props
}: RetroButtonProps) {
  return (
    <button
      className={clsx(
        "retro-button",
        {
          "retro-button-toolbar": variant === "toolbar",
          "retro-button-menu": variant === "menu",
          "retro-button-active": active,
          "retro-button-disabled": disabled,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
