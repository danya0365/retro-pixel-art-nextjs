"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface RetroModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  showCloseButton?: boolean;
  actions?: React.ReactNode;
}

export function RetroModal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  width = "400px",
  showCloseButton = true,
  actions,
}: RetroModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="retro-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="retro-modal"
        style={{ width, maxWidth: "90vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="retro-modal-titlebar">
          <div className="retro-modal-titlebar-content">
            {icon && <span className="retro-modal-icon">{icon}</span>}
            <span className="retro-modal-title">{title}</span>
          </div>
          {showCloseButton && (
            <button
              className="retro-modal-close"
              onClick={onClose}
              title="Close"
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="retro-modal-content">{children}</div>

        {/* Actions */}
        {actions && <div className="retro-modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

interface RetroAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: "info" | "warning" | "error" | "question";
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const alertIcons = {
  info: "ℹ️",
  warning: "⚠️",
  error: "❌",
  question: "❓",
};

export function RetroAlert({
  isOpen,
  onClose,
  title,
  message,
  icon = "info",
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
}: RetroAlertProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <RetroModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="350px"
      showCloseButton={false}
      actions={
        <div className="flex gap-2 justify-center">
          <button className="retro-button px-6 py-1" onClick={handleConfirm}>
            {confirmText}
          </button>
          {showCancel && (
            <button className="retro-button px-6 py-1" onClick={onClose}>
              {cancelText}
            </button>
          )}
        </div>
      }
    >
      <div className="flex items-start gap-4 p-4">
        <span className="text-3xl">{alertIcons[icon]}</span>
        <p className="text-sm text-[var(--win98-button-text)] pt-1">
          {message}
        </p>
      </div>
    </RetroModal>
  );
}
