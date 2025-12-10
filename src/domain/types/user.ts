/**
 * User domain types for Retro Pixel Garden
 * Used for local user creation without authentication (Phase 1)
 */

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  nickname: string;
  avatar?: string;
}

export interface UpdateUserData {
  nickname?: string;
  avatar?: string;
}

// Available pixel art avatars
export const AVATAR_OPTIONS = [
  "🧑‍🌾", // Farmer
  "👨‍🌾", // Male Farmer
  "👩‍🌾", // Female Farmer
  "🧙", // Wizard
  "🧝", // Elf
  "🧚", // Fairy
  "🤠", // Cowboy
  "🥷", // Ninja
  "🧑‍🎨", // Artist
  "🧑‍🚀", // Astronaut
] as const;

export type AvatarOption = (typeof AVATAR_OPTIONS)[number];

// Default avatar
export const DEFAULT_AVATAR: AvatarOption = "🧑‍🌾";
