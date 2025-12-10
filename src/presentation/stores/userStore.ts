"use client";

import type {
  CreateUserData,
  UpdateUserData,
  User,
} from "@/src/domain/types/user";
import { DEFAULT_AVATAR } from "@/src/domain/types/user";
import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Configure localforage
localforage.config({
  name: "retro-pixel-garden",
  storeName: "user_store",
  description: "Local storage for Retro Pixel Garden user data",
});

// Custom storage adapter for zustand persist with localforage
const localforageStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await localforage.getItem<string>(name);
    return value;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `user_${timestamp}_${randomPart}`;
}

interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  createUser: (data: CreateUserData) => void;
  updateUser: (data: UpdateUserData) => void;
  deleteUser: () => void;
  setHydrated: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isHydrated: false,

      // Create a new user
      createUser: (data: CreateUserData) => {
        const now = new Date().toISOString();
        const newUser: User = {
          id: generateUserId(),
          nickname: data.nickname.trim(),
          avatar: data.avatar || DEFAULT_AVATAR,
          createdAt: now,
          updatedAt: now,
        };
        set({ user: newUser });
      },

      // Update existing user
      updateUser: (data: UpdateUserData) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser: User = {
          ...currentUser,
          ...(data.nickname && { nickname: data.nickname.trim() }),
          ...(data.avatar && { avatar: data.avatar }),
          updatedAt: new Date().toISOString(),
        };
        set({ user: updatedUser });
      },

      // Delete user (reset to initial state)
      deleteUser: () => {
        set({ user: null });
      },

      // Mark store as hydrated (data loaded from storage)
      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: "retro-pixel-garden-user",
      storage: createJSONStorage(() => localforageStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useUserStore((state) => state.user);
export const useIsHydrated = () => useUserStore((state) => state.isHydrated);
export const useUserActions = () =>
  useUserStore((state) => ({
    createUser: state.createUser,
    updateUser: state.updateUser,
    deleteUser: state.deleteUser,
  }));
