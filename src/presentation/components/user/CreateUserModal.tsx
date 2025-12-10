"use client";

import type { AvatarOption } from "@/src/domain/types/user";
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from "@/src/domain/types/user";
import { useUserStore } from "@/src/presentation/stores/userStore";
import { useState } from "react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const createUser = useUserStore((state) => state.createUser);
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] =
    useState<AvatarOption>(DEFAULT_AVATAR);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setError("Please enter a nickname");
      return;
    }
    if (trimmedNickname.length < 2) {
      setError("Nickname must be at least 2 characters");
      return;
    }
    if (trimmedNickname.length > 20) {
      setError("Nickname must be less than 20 characters");
      return;
    }

    // Create user
    createUser({
      nickname: trimmedNickname,
      avatar: selectedAvatar,
    });

    // Reset form
    setNickname("");
    setSelectedAvatar(DEFAULT_AVATAR);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="retro-window w-full max-w-md mx-4">
        {/* Title Bar */}
        <div className="retro-window-titlebar">
          <span className="retro-window-title">🌻 Create Your Character</span>
        </div>

        {/* Content */}
        <div className="retro-window-content">
          <form onSubmit={handleSubmit}>
            {/* Welcome Message */}
            <div className="retro-inset p-3 mb-4 bg-white dark:bg-[#1a1a1a]">
              <p className="text-xs text-[var(--win98-button-text)]">
                Welcome to Retro Pixel Garden! Create your character to start
                building your dream garden.
              </p>
            </div>

            {/* Avatar Selection */}
            <div className="mb-4">
              <label className="block text-xs font-bold mb-2 text-[var(--win98-button-text)]">
                Choose Your Avatar:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`
                      text-2xl p-2 rounded
                      ${
                        selectedAvatar === avatar
                          ? "retro-inset bg-[var(--win98-menu-highlight)]"
                          : "retro-outset hover:bg-[var(--win98-button-highlight)]"
                      }
                    `}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Avatar Preview */}
            <div className="text-center mb-4">
              <div className="text-5xl mb-1">{selectedAvatar}</div>
              <span className="text-xs text-[var(--win98-button-text)]">
                Your Character
              </span>
            </div>

            {/* Nickname Input */}
            <div className="mb-4">
              <label
                htmlFor="nickname"
                className="block text-xs font-bold mb-2 text-[var(--win98-button-text)]"
              >
                Enter Nickname:
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your nickname..."
                className="retro-input w-full"
                maxLength={20}
                autoFocus
              />
              <div className="text-xs text-[var(--win98-button-shadow)] mt-1">
                {nickname.length}/20 characters
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="retro-inset p-2 mb-4 bg-red-100 dark:bg-red-900/30">
                <p className="text-xs text-red-600 dark:text-red-400">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <button type="submit" className="retro-button px-6 py-2">
                🎮 Start Game
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
