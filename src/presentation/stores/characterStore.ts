import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ============================================
// Types - Dragon Quest Tact Style
// ============================================

export interface CharacterStats {
  // Base Stats
  level: number;
  exp: number;
  expToNextLevel: number;

  // Vitals
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;

  // Combat Stats (Dragon Quest Tact accurate)
  atk: number; // ATK - Physical attack power
  def: number; // DEF - Physical damage reduction
  agi: number; // AGL - Agility/Speed - Turn order priority
  wis: number; // WIS - Wisdom - Magic damage & healing power

  // Tactical Stats
  mov: number; // MOV - Movement range (tiles per turn)
  rng: number; // Range - Attack range (tiles)
}

// Dragon Quest Tact Rank System
export type UnitRank = "S" | "A" | "B" | "C" | "D" | "E" | "F";

// Element/Attribute types
export type ElementType =
  | "none"
  | "fire"
  | "ice"
  | "wind"
  | "earth"
  | "lightning"
  | "dark"
  | "light";

// Monster family types
export type FamilyType =
  | "slime"
  | "dragon"
  | "beast"
  | "demon"
  | "undead"
  | "nature"
  | "material"
  | "hero";

export interface Equipment {
  weapon: EquipmentItem | null;
  armor: EquipmentItem | null;
  accessory: EquipmentItem | null;
}

export interface EquipmentItem {
  id: string;
  name: string;
  icon: string;
  type: "weapon" | "armor" | "accessory";
  stats: Partial<CharacterStats>;
  description: string;
}

export interface CharacterState {
  // Identity
  name: string;
  class: string; // "Farmer", "Warrior", "Mage"
  avatar: string;

  // Stats
  baseStats: CharacterStats;
  equipment: Equipment;

  // Computed (with equipment bonuses)
  totalStats: CharacterStats;

  // Skills
  skills: string[];

  // Currency
  gold: number;
}

// ============================================
// EXP Table (Dragon Quest style)
// ============================================

const EXP_TABLE: number[] = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  900, // Level 5
  1500, // Level 6
  2300, // Level 7
  3500, // Level 8
  5000, // Level 9
  7000, // Level 10
  9500, // Level 11
  12500, // Level 12
  16000, // Level 13
  20000, // Level 14
  25000, // Level 15
  31000, // Level 16
  38000, // Level 17
  46000, // Level 18
  55000, // Level 19
  65000, // Level 20
];

// ============================================
// Initial Stats by Class (Dragon Quest Tact Style)
// ============================================

const CLASS_BASE_STATS: Record<string, Partial<CharacterStats>> = {
  Farmer: {
    maxHp: 120,
    maxMp: 30,
    atk: 85,
    def: 75,
    agi: 90,
    wis: 60,
    mov: 2,
    rng: 1,
  },
  Warrior: {
    maxHp: 180,
    maxMp: 15,
    atk: 130,
    def: 110,
    agi: 65,
    wis: 40,
    mov: 2,
    rng: 1,
  },
  Mage: {
    maxHp: 85,
    maxMp: 80,
    atk: 45,
    def: 50,
    agi: 75,
    wis: 145,
    mov: 2,
    rng: 3, // Mages can attack from range
  },
};

// ============================================
// Helper Functions
// ============================================

function getExpToNextLevel(level: number): number {
  if (level >= EXP_TABLE.length) return EXP_TABLE[EXP_TABLE.length - 1] * 2;
  return EXP_TABLE[level] - EXP_TABLE[level - 1];
}

function calculateTotalStats(
  baseStats: CharacterStats,
  equipment: Equipment
): CharacterStats {
  const total = { ...baseStats };

  // Add equipment bonuses
  const items = [equipment.weapon, equipment.armor, equipment.accessory];
  for (const item of items) {
    if (item?.stats) {
      for (const [key, value] of Object.entries(item.stats)) {
        if (key in total && typeof value === "number") {
          (total as Record<string, number>)[key] += value;
        }
      }
    }
  }

  return total;
}

function getStatsGrowth(characterClass: string): Partial<CharacterStats> {
  // Stats gained per level (DQT style)
  switch (characterClass) {
    case "Warrior":
      return { maxHp: 12, maxMp: 2, atk: 8, def: 6, agi: 3, wis: 2 };
    case "Mage":
      return { maxHp: 5, maxMp: 8, atk: 2, def: 3, agi: 4, wis: 9 };
    case "Farmer":
    default:
      return { maxHp: 8, maxMp: 4, atk: 5, def: 4, agi: 5, wis: 4 };
  }
}

// ============================================
// Store Interface
// ============================================

interface CharacterStore {
  character: CharacterState;

  // Actions
  initializeCharacter: (
    name: string,
    characterClass?: string,
    avatar?: string
  ) => void;
  gainExp: (amount: number) => { leveledUp: boolean; newLevel: number };
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  useMp: (amount: number) => boolean;
  restoreMp: (amount: number) => void;
  fullRestore: () => void;
  equipItem: (item: EquipmentItem) => void;
  unequipItem: (slot: keyof Equipment) => EquipmentItem | null;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  learnSkill: (skillId: string) => void;
  // ✅ Sync stats from server (Single Source of Truth)
  syncStatsFromServer: (
    stats: Partial<CharacterStats> & { gold?: number }
  ) => void;
}

// ============================================
// Default Character
// ============================================

const DEFAULT_CHARACTER: CharacterState = {
  name: "Adventurer",
  class: "Farmer",
  avatar: "👨‍🌾",
  baseStats: {
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    hp: 120,
    maxHp: 120,
    mp: 30,
    maxMp: 30,
    atk: 85,
    def: 75,
    agi: 90,
    wis: 60,
    mov: 2,
    rng: 1,
  },
  equipment: {
    weapon: null,
    armor: null,
    accessory: null,
  },
  totalStats: {
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    hp: 120,
    maxHp: 120,
    mp: 30,
    maxMp: 30,
    atk: 85,
    def: 75,
    agi: 90,
    wis: 60,
    mov: 2,
    rng: 1,
  },
  skills: ["basic_attack"],
  gold: 100,
};

// ============================================
// Zustand Store
// ============================================

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      character: DEFAULT_CHARACTER,

      initializeCharacter: (name, characterClass = "Farmer", avatar = "👨‍🌾") => {
        const classStats =
          CLASS_BASE_STATS[characterClass] || CLASS_BASE_STATS.Farmer;
        const baseStats: CharacterStats = {
          level: 1,
          exp: 0,
          expToNextLevel: getExpToNextLevel(1),
          hp: classStats.maxHp || 120,
          maxHp: classStats.maxHp || 120,
          mp: classStats.maxMp || 30,
          maxMp: classStats.maxMp || 30,
          atk: classStats.atk || 85,
          def: classStats.def || 75,
          agi: classStats.agi || 90,
          wis: classStats.wis || 60,
          mov: classStats.mov || 2,
          rng: classStats.rng || 1,
        };

        const equipment: Equipment = {
          weapon: null,
          armor: null,
          accessory: null,
        };

        set({
          character: {
            name,
            class: characterClass,
            avatar,
            baseStats,
            equipment,
            totalStats: calculateTotalStats(baseStats, equipment),
            skills: ["basic_attack"],
            gold: 100,
          },
        });
      },

      gainExp: (amount) => {
        const { character } = get();
        let newExp = character.baseStats.exp + amount;
        let level = character.baseStats.level;
        let leveledUp = false;

        // Check for level up
        while (newExp >= character.baseStats.expToNextLevel && level < 20) {
          newExp -= character.baseStats.expToNextLevel;
          level++;
          leveledUp = true;
        }

        if (leveledUp) {
          // Apply stat growth
          const growth = getStatsGrowth(character.class);
          const newBaseStats = { ...character.baseStats };
          newBaseStats.level = level;
          newBaseStats.exp = newExp;
          newBaseStats.expToNextLevel = getExpToNextLevel(level);

          // Add growth stats (DQT style)
          newBaseStats.maxHp += growth.maxHp || 0;
          newBaseStats.maxMp += growth.maxMp || 0;
          newBaseStats.atk += growth.atk || 0;
          newBaseStats.def += growth.def || 0;
          newBaseStats.agi += growth.agi || 0;
          newBaseStats.wis += growth.wis || 0;

          // Full heal on level up
          newBaseStats.hp = newBaseStats.maxHp;
          newBaseStats.mp = newBaseStats.maxMp;

          set({
            character: {
              ...character,
              baseStats: newBaseStats,
              totalStats: calculateTotalStats(
                newBaseStats,
                character.equipment
              ),
            },
          });
        } else {
          set({
            character: {
              ...character,
              baseStats: {
                ...character.baseStats,
                exp: newExp,
              },
              totalStats: {
                ...character.totalStats,
                exp: newExp,
              },
            },
          });
        }

        return { leveledUp, newLevel: level };
      },

      takeDamage: (amount) => {
        const { character } = get();
        const newHp = Math.max(0, character.baseStats.hp - amount);

        set({
          character: {
            ...character,
            baseStats: { ...character.baseStats, hp: newHp },
            totalStats: { ...character.totalStats, hp: newHp },
          },
        });
      },

      heal: (amount) => {
        const { character } = get();
        const newHp = Math.min(
          character.totalStats.maxHp,
          character.baseStats.hp + amount
        );

        set({
          character: {
            ...character,
            baseStats: { ...character.baseStats, hp: newHp },
            totalStats: { ...character.totalStats, hp: newHp },
          },
        });
      },

      useMp: (amount) => {
        const { character } = get();
        if (character.baseStats.mp < amount) return false;

        const newMp = character.baseStats.mp - amount;
        set({
          character: {
            ...character,
            baseStats: { ...character.baseStats, mp: newMp },
            totalStats: { ...character.totalStats, mp: newMp },
          },
        });
        return true;
      },

      restoreMp: (amount) => {
        const { character } = get();
        const newMp = Math.min(
          character.totalStats.maxMp,
          character.baseStats.mp + amount
        );

        set({
          character: {
            ...character,
            baseStats: { ...character.baseStats, mp: newMp },
            totalStats: { ...character.totalStats, mp: newMp },
          },
        });
      },

      fullRestore: () => {
        const { character } = get();
        set({
          character: {
            ...character,
            baseStats: {
              ...character.baseStats,
              hp: character.totalStats.maxHp,
              mp: character.totalStats.maxMp,
            },
            totalStats: {
              ...character.totalStats,
              hp: character.totalStats.maxHp,
              mp: character.totalStats.maxMp,
            },
          },
        });
      },

      equipItem: (item) => {
        const { character } = get();
        const slot = item.type;
        const newEquipment = { ...character.equipment, [slot]: item };

        set({
          character: {
            ...character,
            equipment: newEquipment,
            totalStats: calculateTotalStats(character.baseStats, newEquipment),
          },
        });
      },

      unequipItem: (slot) => {
        const { character } = get();
        const item = character.equipment[slot];
        const newEquipment = { ...character.equipment, [slot]: null };

        set({
          character: {
            ...character,
            equipment: newEquipment,
            totalStats: calculateTotalStats(character.baseStats, newEquipment),
          },
        });

        return item;
      },

      addGold: (amount) => {
        const { character } = get();
        set({
          character: {
            ...character,
            gold: character.gold + amount,
          },
        });
      },

      spendGold: (amount) => {
        const { character } = get();
        if (character.gold < amount) return false;

        set({
          character: {
            ...character,
            gold: character.gold - amount,
          },
        });
        return true;
      },

      learnSkill: (skillId) => {
        const { character } = get();
        if (character.skills.includes(skillId)) return;

        set({
          character: {
            ...character,
            skills: [...character.skills, skillId],
          },
        });
      },

      // ✅ Sync stats from server (Single Source of Truth)
      syncStatsFromServer: (stats) => {
        const { character } = get();
        const newBaseStats = { ...character.baseStats };
        const newGold = stats.gold ?? character.gold;

        // Update stats from server
        if (stats.level !== undefined) newBaseStats.level = stats.level;
        if (stats.exp !== undefined) newBaseStats.exp = stats.exp;
        if (stats.expToNextLevel !== undefined)
          newBaseStats.expToNextLevel = stats.expToNextLevel;
        if (stats.hp !== undefined) newBaseStats.hp = stats.hp;
        if (stats.maxHp !== undefined) newBaseStats.maxHp = stats.maxHp;
        if (stats.mp !== undefined) newBaseStats.mp = stats.mp;
        if (stats.maxMp !== undefined) newBaseStats.maxMp = stats.maxMp;
        if (stats.atk !== undefined) newBaseStats.atk = stats.atk;
        if (stats.def !== undefined) newBaseStats.def = stats.def;
        if (stats.agi !== undefined) newBaseStats.agi = stats.agi;
        if (stats.wis !== undefined) newBaseStats.wis = stats.wis;
        if (stats.mov !== undefined) newBaseStats.mov = stats.mov;
        if (stats.rng !== undefined) newBaseStats.rng = stats.rng;

        set({
          character: {
            ...character,
            baseStats: newBaseStats,
            totalStats: calculateTotalStats(newBaseStats, character.equipment),
            gold: newGold,
          },
        });

        console.log("💾 Character stats synced from server:", {
          level: newBaseStats.level,
          exp: newBaseStats.exp,
          gold: newGold,
        });
      },
    }),
    {
      name: "character-storage",
      storage: createJSONStorage(() => localforage as unknown as Storage),
    }
  )
);

// ============================================
// Selectors
// ============================================

export const useCharacter = () => useCharacterStore((state) => state.character);
export const useCharacterStats = () =>
  useCharacterStore((state) => state.character.totalStats);
export const useCharacterGold = () =>
  useCharacterStore((state) => state.character.gold);
