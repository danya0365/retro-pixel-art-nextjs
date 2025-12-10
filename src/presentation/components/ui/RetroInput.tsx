"use client";

import { clsx } from "clsx";
import { type InputHTMLAttributes, forwardRef } from "react";

interface RetroInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const RetroInput = forwardRef<HTMLInputElement, RetroInputProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="retro-input-wrapper">
        {label && (
          <label htmlFor={id} className="retro-input-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx("retro-input", className)}
          {...props}
        />
      </div>
    );
  }
);

RetroInput.displayName = "RetroInput";
