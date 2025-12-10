"use client";

import { create } from "zustand";

// Hotbar item types
export interface HotbarItem {
  id: string;
  name: string;
  icon: string;
  type: "seed" | "tool" | "decoration";
  plantType?: string; // For seeds
  objectType?: string; // For decorations
}

// Default hotbar items
export const DEFAULT_HOTBAR_ITEMS: HotbarItem[] = [
  {
    id: "carrot_seed",
    name: "Carrot Seeds",
    icon: "🥕",
    type: "seed",
    plantType: "carrot",
  },
  {
    id: "tomato_seed",
    name: "Tomato Seeds",
    icon: "🍅",
    type: "seed",
    plantType: "tomato",
  },
  {
    id: "corn_seed",
    name: "Corn Seeds",
    icon: "🌽",
    type: "seed",
    plantType: "corn",
  },
  {
    id: "wheat_seed",
    name: "Wheat Seeds",
    icon: "🌾",
    type: "seed",
    plantType: "wheat",
  },
  {
    id: "pumpkin_seed",
    name: "Pumpkin Seeds",
    icon: "🎃",
    type: "seed",
    plantType: "pumpkin",
  },
  { id: "watering_can", name: "Watering Can", icon: "💧", type: "tool" },
  { id: "hoe", name: "Hoe", icon: "⛏️", type: "tool" },
  { id: "axe", name: "Axe", icon: "🪓", type: "tool" },
  { id: "hand", name: "Hand", icon: "✋", type: "tool" },
];

interface HotbarState {
  items: HotbarItem[];
  selectedSlot: number;
  setSelectedSlot: (slot: number) => void;
  getSelectedItem: () => HotbarItem | null;
}

export const useHotbarStore = create<HotbarState>((set, get) => ({
  items: DEFAULT_HOTBAR_ITEMS,
  selectedSlot: 0,

  setSelectedSlot: (slot: number) => {
    if (slot >= 0 && slot < 9) {
      set({ selectedSlot: slot });
    }
  },

  getSelectedItem: () => {
    const { items, selectedSlot } = get();
    return items[selectedSlot] || null;
  },
}));

// Helper hooks
export const useSelectedSlot = () =>
  useHotbarStore((state) => state.selectedSlot);
export const useHotbarItems = () => useHotbarStore((state) => state.items);
export const useSetSelectedSlot = () =>
  useHotbarStore((state) => state.setSelectedSlot);
