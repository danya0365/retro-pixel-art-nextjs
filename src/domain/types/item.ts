/**
 * Item & Equipment Types for Retro Pixel Garden
 * Server as Single Source of Truth
 */

import type { ElementType } from "@/src/presentation/stores/characterStore";

// ============================================
// Item Types
// ============================================

export type ItemType =
  | "weapon"
  | "armor"
  | "accessory"
  | "consumable"
  | "material"
  | "chest" // Treasure chest
  | "seed" // Farming seeds
  | "food" // Food items
  | "tool" // Tools
  | "furniture" // Furniture
  | "pet"; // Pets

export type RarityType = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type WeaponType = "sword" | "axe" | "staff" | "bow" | "dagger";
export type ArmorType = "heavy" | "light" | "robe";

// ============================================
// Stat Bonus
// ============================================

export interface StatBonus {
  hp?: number;
  mp?: number;
  atk?: number;
  def?: number;
  agi?: number;
  wis?: number;
  mov?: number;
  rng?: number;
}

// ============================================
// Base Item Interface
// ============================================

export interface BaseItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: RarityType;
  description: string;
  icon: string;
  stackable: boolean;
  maxStack?: number;
  buyPrice: number;
  sellPrice: number;
}

// ============================================
// Equipment Items
// ============================================

export interface WeaponItem extends BaseItem {
  type: "weapon";
  weaponType: WeaponType;
  statBonus: StatBonus;
  element?: ElementType;
  requiredLevel?: number;
  requiredClass?: string[];
}

export interface ArmorItem extends BaseItem {
  type: "armor";
  armorType: ArmorType;
  statBonus: StatBonus;
  element?: ElementType;
  requiredLevel?: number;
  requiredClass?: string[];
}

export interface AccessoryItem extends BaseItem {
  type: "accessory";
  statBonus: StatBonus;
  element?: ElementType;
  requiredLevel?: number;
}

// ============================================
// Consumable & Material Items
// ============================================

export interface ConsumableItem extends BaseItem {
  type: "consumable";
  effect: {
    type: "heal_hp" | "heal_mp" | "buff_atk" | "buff_def";
    value: number;
    duration?: number; // turns (for buffs)
  };
}

export interface MaterialItem extends BaseItem {
  type: "material";
}

// ============================================
// Seed Item (Farming)
// ============================================

export interface SeedItem extends BaseItem {
  type: "seed";
  growthDays?: number;
}

// ============================================
// Food Item
// ============================================

export interface FoodItem extends BaseItem {
  type: "food";
  effect?: {
    hp?: number;
    mp?: number;
  };
}

// ============================================
// Tool Item
// ============================================

export interface ToolItem extends BaseItem {
  type: "tool";
  toolType?: "axe" | "pickaxe" | "fishing_rod" | "watering_can" | "hoe";
}

// ============================================
// Furniture Item
// ============================================

export interface FurnitureItem extends BaseItem {
  type: "furniture";
}

// ============================================
// Pet Item
// ============================================

export interface PetItem extends BaseItem {
  type: "pet";
}

// ============================================
// Treasure Chest
// ============================================

export interface ChestItem extends BaseItem {
  type: "chest";
  possibleDrops: {
    itemId: string;
    chance: number; // 0-100
    minQuantity: number;
    maxQuantity: number;
  }[];
}

// ============================================
// Union Type for All Items
// ============================================

export type Item =
  | WeaponItem
  | ArmorItem
  | AccessoryItem
  | ConsumableItem
  | MaterialItem
  | ChestItem
  | SeedItem
  | FoodItem
  | ToolItem
  | FurnitureItem
  | PetItem;

// ============================================
// Inventory Item (with quantity)
// ============================================

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

// ============================================
// Equipment Slots
// ============================================

export interface Equipment {
  weapon: string | null; // Item ID
  armor: string | null;
  accessory: string | null;
}

// ============================================
// Rarity Colors
// ============================================

export const RARITY_COLORS: Record<RarityType, string> = {
  common: "text-gray-600",
  uncommon: "text-green-600",
  rare: "text-blue-600",
  epic: "text-purple-600",
  legendary: "text-yellow-600",
};

export const RARITY_BG_COLORS: Record<RarityType, string> = {
  common: "bg-gray-100 border-gray-300",
  uncommon: "bg-green-50 border-green-300",
  rare: "bg-blue-50 border-blue-300",
  epic: "bg-purple-50 border-purple-300",
  legendary: "bg-yellow-50 border-yellow-400",
};
