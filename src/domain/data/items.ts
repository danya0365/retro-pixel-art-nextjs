/**
 * Items Master Data for Retro Pixel Garden
 * Equipment, Consumables, Materials, Treasure Chests
 */

import type {
  AccessoryItem,
  ArmorItem,
  ChestItem,
  ConsumableItem,
  Item,
  MaterialItem,
  WeaponItem,
} from "@/src/domain/types/item";

// ============================================
// Weapons
// ============================================

export const WEAPONS: WeaponItem[] = [
  // Common Weapons
  {
    id: "weapon_wooden_sword",
    name: "ดาบไม้",
    type: "weapon",
    weaponType: "sword",
    rarity: "common",
    description: "ดาบไม้ธรรมดา เหมาะสำหรับผู้เริ่มต้น",
    icon: "🗡️",
    stackable: false,
    buyPrice: 50,
    sellPrice: 10,
    statBonus: { atk: 5 },
    requiredLevel: 1,
  },
  {
    id: "weapon_iron_sword",
    name: "ดาบเหล็ก",
    type: "weapon",
    weaponType: "sword",
    rarity: "common",
    description: "ดาบเหล็กพื้นฐาน",
    icon: "⚔️",
    stackable: false,
    buyPrice: 150,
    sellPrice: 30,
    statBonus: { atk: 12 },
    requiredLevel: 3,
  },
  {
    id: "weapon_farmer_hoe",
    name: "จอบชาวนา",
    type: "weapon",
    weaponType: "axe",
    rarity: "common",
    description: "จอบที่ใช้ในการทำฟาร์ม สามารถใช้ต่อสู้ได้",
    icon: "⛏️",
    stackable: false,
    buyPrice: 80,
    sellPrice: 15,
    statBonus: { atk: 8 },
    requiredLevel: 1,
    requiredClass: ["Farmer"],
  },

  // Uncommon Weapons
  {
    id: "weapon_steel_sword",
    name: "ดาบเหล็กกล้า",
    type: "weapon",
    weaponType: "sword",
    rarity: "uncommon",
    description: "ดาบที่ทำจากเหล็กกล้าคุณภาพสูง",
    icon: "🗡️",
    stackable: false,
    buyPrice: 400,
    sellPrice: 80,
    statBonus: { atk: 25, agi: 3 },
    requiredLevel: 5,
  },
  {
    id: "weapon_magic_staff",
    name: "ไม้เท้าเวทมนตร์",
    type: "weapon",
    weaponType: "staff",
    rarity: "uncommon",
    description: "ไม้เท้าที่เพิ่มพลังเวทมนตร์",
    icon: "🪄",
    stackable: false,
    buyPrice: 350,
    sellPrice: 70,
    statBonus: { atk: 8, wis: 20, mp: 15 },
    requiredLevel: 5,
    requiredClass: ["Mage"],
  },

  // Rare Weapons
  {
    id: "weapon_flame_sword",
    name: "ดาบเพลิง",
    type: "weapon",
    weaponType: "sword",
    rarity: "rare",
    description: "ดาบที่ลุกเป็นไฟ สร้างความเสียหายธาตุไฟ",
    icon: "🔥",
    stackable: false,
    buyPrice: 1200,
    sellPrice: 300,
    statBonus: { atk: 45, agi: 5 },
    element: "fire",
    requiredLevel: 10,
  },
  {
    id: "weapon_ice_staff",
    name: "ไม้เท้าน้ำแข็ง",
    type: "weapon",
    weaponType: "staff",
    rarity: "rare",
    description: "ไม้เท้าที่เย็นจัด เพิ่มพลังธาตุน้ำแข็ง",
    icon: "❄️",
    stackable: false,
    buyPrice: 1000,
    sellPrice: 250,
    statBonus: { atk: 15, wis: 40, mp: 30 },
    element: "ice",
    requiredLevel: 10,
    requiredClass: ["Mage"],
  },

  // Epic Weapons
  {
    id: "weapon_thunder_blade",
    name: "ดาบสายฟ้า",
    type: "weapon",
    weaponType: "sword",
    rarity: "epic",
    description: "ดาบที่อัดแน่นด้วยพลังสายฟ้า",
    icon: "⚡",
    stackable: false,
    buyPrice: 5000,
    sellPrice: 1250,
    statBonus: { atk: 80, agi: 15, def: 10 },
    element: "lightning",
    requiredLevel: 15,
  },

  // Legendary Weapons
  {
    id: "weapon_excalibur",
    name: "เอ็กซ์คาลิเบอร์",
    type: "weapon",
    weaponType: "sword",
    rarity: "legendary",
    description: "ดาบในตำนานที่มีพลังอันยิ่งใหญ่",
    icon: "✨",
    stackable: false,
    buyPrice: 50000,
    sellPrice: 12500,
    statBonus: { atk: 150, def: 30, agi: 20, wis: 20 },
    element: "light",
    requiredLevel: 20,
  },
];

// ============================================
// Armor
// ============================================

export const ARMORS: ArmorItem[] = [
  // Common Armor
  {
    id: "armor_cloth",
    name: "เสื้อผ้าธรรมดา",
    type: "armor",
    armorType: "light",
    rarity: "common",
    description: "เสื้อผ้าธรรมดา ป้องกันได้เล็กน้อย",
    icon: "👕",
    stackable: false,
    buyPrice: 30,
    sellPrice: 6,
    statBonus: { def: 3 },
    requiredLevel: 1,
  },
  {
    id: "armor_leather",
    name: "ชุดหนัง",
    type: "armor",
    armorType: "light",
    rarity: "common",
    description: "ชุดหนังที่ให้การป้องกันที่ดีขึ้น",
    icon: "🥋",
    stackable: false,
    buyPrice: 100,
    sellPrice: 20,
    statBonus: { def: 8, agi: 2 },
    requiredLevel: 3,
  },

  // Uncommon Armor
  {
    id: "armor_chainmail",
    name: "เกราะโซ่",
    type: "armor",
    armorType: "heavy",
    rarity: "uncommon",
    description: "เกราะโซ่ที่ให้การป้องกันสูง",
    icon: "🛡️",
    stackable: false,
    buyPrice: 350,
    sellPrice: 70,
    statBonus: { def: 20, hp: 20 },
    requiredLevel: 5,
    requiredClass: ["Warrior"],
  },
  {
    id: "armor_mage_robe",
    name: "เสื้อคลุมจอมเวท",
    type: "armor",
    armorType: "robe",
    rarity: "uncommon",
    description: "เสื้อคลุมที่เพิ่มพลังเวทมนตร์",
    icon: "🧥",
    stackable: false,
    buyPrice: 300,
    sellPrice: 60,
    statBonus: { def: 10, wis: 15, mp: 25 },
    requiredLevel: 5,
    requiredClass: ["Mage"],
  },

  // Rare Armor
  {
    id: "armor_plate",
    name: "เกราะเหล็ก",
    type: "armor",
    armorType: "heavy",
    rarity: "rare",
    description: "เกราะเหล็กที่ให้การป้องกันสูงมาก",
    icon: "🏰",
    stackable: false,
    buyPrice: 1500,
    sellPrice: 375,
    statBonus: { def: 45, hp: 50 },
    requiredLevel: 10,
    requiredClass: ["Warrior"],
  },

  // Epic Armor
  {
    id: "armor_dragon_scale",
    name: "เกราะเกล็ดมังกร",
    type: "armor",
    armorType: "heavy",
    rarity: "epic",
    description: "เกราะที่ทำจากเกล็ดมังกร",
    icon: "🐉",
    stackable: false,
    buyPrice: 8000,
    sellPrice: 2000,
    statBonus: { def: 80, hp: 100, atk: 10 },
    element: "fire",
    requiredLevel: 15,
  },
];

// ============================================
// Accessories
// ============================================

export const ACCESSORIES: AccessoryItem[] = [
  // Common Accessories
  {
    id: "acc_wooden_ring",
    name: "แหวนไม้",
    type: "accessory",
    rarity: "common",
    description: "แหวนไม้ธรรมดา",
    icon: "💍",
    stackable: false,
    buyPrice: 25,
    sellPrice: 5,
    statBonus: { hp: 10 },
    requiredLevel: 1,
  },
  {
    id: "acc_lucky_charm",
    name: "เครื่องรางนำโชค",
    type: "accessory",
    rarity: "common",
    description: "เครื่องรางที่เพิ่มโชค",
    icon: "🍀",
    stackable: false,
    buyPrice: 50,
    sellPrice: 10,
    statBonus: { agi: 5 },
    requiredLevel: 1,
  },

  // Uncommon Accessories
  {
    id: "acc_power_ring",
    name: "แหวนพลัง",
    type: "accessory",
    rarity: "uncommon",
    description: "แหวนที่เพิ่มพลังโจมตี",
    icon: "💪",
    stackable: false,
    buyPrice: 200,
    sellPrice: 40,
    statBonus: { atk: 10 },
    requiredLevel: 5,
  },
  {
    id: "acc_mp_pendant",
    name: "จี้แห่งมานา",
    type: "accessory",
    rarity: "uncommon",
    description: "จี้ที่เพิ่ม MP สูงสุด",
    icon: "💎",
    stackable: false,
    buyPrice: 180,
    sellPrice: 36,
    statBonus: { mp: 30, wis: 5 },
    requiredLevel: 5,
  },

  // Rare Accessories
  {
    id: "acc_speed_boots",
    name: "รองเท้าความเร็ว",
    type: "accessory",
    rarity: "rare",
    description: "รองเท้าที่เพิ่มความเร็วและการเคลื่อนที่",
    icon: "👟",
    stackable: false,
    buyPrice: 800,
    sellPrice: 200,
    statBonus: { agi: 25, mov: 1 },
    requiredLevel: 10,
  },

  // Epic Accessories
  {
    id: "acc_dragon_amulet",
    name: "สร้อยคอมังกร",
    type: "accessory",
    rarity: "epic",
    description: "สร้อยคอที่มีพลังมังกร",
    icon: "🔮",
    stackable: false,
    buyPrice: 5000,
    sellPrice: 1250,
    statBonus: { hp: 50, mp: 50, atk: 20, def: 20 },
    requiredLevel: 15,
  },
];

// ============================================
// Consumables
// ============================================

export const CONSUMABLES: ConsumableItem[] = [
  {
    id: "potion_hp_small",
    name: "ยาฟื้นฟู HP เล็ก",
    type: "consumable",
    rarity: "common",
    description: "ฟื้นฟู HP 50 หน่วย",
    icon: "🧪",
    stackable: true,
    maxStack: 99,
    buyPrice: 25,
    sellPrice: 5,
    effect: { type: "heal_hp", value: 50 },
  },
  {
    id: "potion_hp_medium",
    name: "ยาฟื้นฟู HP กลาง",
    type: "consumable",
    rarity: "uncommon",
    description: "ฟื้นฟู HP 150 หน่วย",
    icon: "🧪",
    stackable: true,
    maxStack: 99,
    buyPrice: 80,
    sellPrice: 16,
    effect: { type: "heal_hp", value: 150 },
  },
  {
    id: "potion_mp_small",
    name: "ยาฟื้นฟู MP เล็ก",
    type: "consumable",
    rarity: "common",
    description: "ฟื้นฟู MP 30 หน่วย",
    icon: "💙",
    stackable: true,
    maxStack: 99,
    buyPrice: 30,
    sellPrice: 6,
    effect: { type: "heal_mp", value: 30 },
  },
];

// ============================================
// Materials (Drop from monsters)
// ============================================

export const MATERIALS: MaterialItem[] = [
  {
    id: "mat_slime_gel",
    name: "เจลสไลม์",
    type: "material",
    rarity: "common",
    description: "เจลที่ได้จากสไลม์",
    icon: "💧",
    stackable: true,
    maxStack: 999,
    buyPrice: 5,
    sellPrice: 2,
  },
  {
    id: "mat_goblin_ear",
    name: "หูก๊อบลิน",
    type: "material",
    rarity: "common",
    description: "หูของก๊อบลิน",
    icon: "👂",
    stackable: true,
    maxStack: 999,
    buyPrice: 10,
    sellPrice: 4,
  },
  {
    id: "mat_wolf_fang",
    name: "เขี้ยวหมาป่า",
    type: "material",
    rarity: "uncommon",
    description: "เขี้ยวของหมาป่า",
    icon: "🦷",
    stackable: true,
    maxStack: 999,
    buyPrice: 25,
    sellPrice: 10,
  },
  {
    id: "mat_dragon_scale",
    name: "เกล็ดมังกร",
    type: "material",
    rarity: "rare",
    description: "เกล็ดของมังกร วัตถุดิบหายาก",
    icon: "🐉",
    stackable: true,
    maxStack: 999,
    buyPrice: 500,
    sellPrice: 200,
  },
];

// ============================================
// Treasure Chests
// ============================================

export const CHESTS: ChestItem[] = [
  {
    id: "chest_bronze",
    name: "หีบสมบัติบรอนซ์",
    type: "chest",
    rarity: "common",
    description: "หีบสมบัติธรรมดา อาจมีของดีได้",
    icon: "📦",
    stackable: true,
    maxStack: 99,
    buyPrice: 100,
    sellPrice: 20,
    possibleDrops: [
      {
        itemId: "weapon_wooden_sword",
        chance: 20,
        minQuantity: 1,
        maxQuantity: 1,
      },
      {
        itemId: "weapon_iron_sword",
        chance: 10,
        minQuantity: 1,
        maxQuantity: 1,
      },
      { itemId: "armor_cloth", chance: 20, minQuantity: 1, maxQuantity: 1 },
      { itemId: "armor_leather", chance: 10, minQuantity: 1, maxQuantity: 1 },
      { itemId: "acc_wooden_ring", chance: 15, minQuantity: 1, maxQuantity: 1 },
      { itemId: "potion_hp_small", chance: 50, minQuantity: 1, maxQuantity: 3 },
      { itemId: "mat_slime_gel", chance: 40, minQuantity: 2, maxQuantity: 5 },
    ],
  },
  {
    id: "chest_silver",
    name: "หีบสมบัติเงิน",
    type: "chest",
    rarity: "uncommon",
    description: "หีบสมบัติคุณภาพ มีโอกาสได้ของดี",
    icon: "🗃️",
    stackable: true,
    maxStack: 99,
    buyPrice: 500,
    sellPrice: 100,
    possibleDrops: [
      {
        itemId: "weapon_steel_sword",
        chance: 15,
        minQuantity: 1,
        maxQuantity: 1,
      },
      {
        itemId: "weapon_magic_staff",
        chance: 15,
        minQuantity: 1,
        maxQuantity: 1,
      },
      { itemId: "armor_chainmail", chance: 12, minQuantity: 1, maxQuantity: 1 },
      { itemId: "armor_mage_robe", chance: 12, minQuantity: 1, maxQuantity: 1 },
      { itemId: "acc_power_ring", chance: 10, minQuantity: 1, maxQuantity: 1 },
      { itemId: "acc_mp_pendant", chance: 10, minQuantity: 1, maxQuantity: 1 },
      {
        itemId: "potion_hp_medium",
        chance: 40,
        minQuantity: 1,
        maxQuantity: 3,
      },
      { itemId: "mat_wolf_fang", chance: 30, minQuantity: 1, maxQuantity: 3 },
    ],
  },
  {
    id: "chest_gold",
    name: "หีบสมบัติทอง",
    type: "chest",
    rarity: "rare",
    description: "หีบสมบัติหายาก มีโอกาสได้ของ Rare ขึ้นไป",
    icon: "📦",
    stackable: true,
    maxStack: 99,
    buyPrice: 2000,
    sellPrice: 500,
    possibleDrops: [
      {
        itemId: "weapon_flame_sword",
        chance: 10,
        minQuantity: 1,
        maxQuantity: 1,
      },
      {
        itemId: "weapon_ice_staff",
        chance: 10,
        minQuantity: 1,
        maxQuantity: 1,
      },
      { itemId: "armor_plate", chance: 8, minQuantity: 1, maxQuantity: 1 },
      { itemId: "acc_speed_boots", chance: 8, minQuantity: 1, maxQuantity: 1 },
      {
        itemId: "weapon_thunder_blade",
        chance: 3,
        minQuantity: 1,
        maxQuantity: 1,
      },
      {
        itemId: "armor_dragon_scale",
        chance: 2,
        minQuantity: 1,
        maxQuantity: 1,
      },
      {
        itemId: "acc_dragon_amulet",
        chance: 2,
        minQuantity: 1,
        maxQuantity: 1,
      },
      {
        itemId: "mat_dragon_scale",
        chance: 20,
        minQuantity: 1,
        maxQuantity: 2,
      },
    ],
  },
  {
    id: "chest_legendary",
    name: "หีบสมบัติตำนาน",
    type: "chest",
    rarity: "legendary",
    description: "หีบสมบัติในตำนาน การันตีได้ของ Epic ขึ้นไป",
    icon: "✨",
    stackable: true,
    maxStack: 99,
    buyPrice: 10000,
    sellPrice: 2500,
    possibleDrops: [
      {
        itemId: "weapon_thunder_blade",
        chance: 20,
        minQuantity: 1,
        maxQuantity: 1,
      },
      {
        itemId: "armor_dragon_scale",
        chance: 15,
        minQuantity: 1,
        maxQuantity: 1,
      },
      {
        itemId: "acc_dragon_amulet",
        chance: 15,
        minQuantity: 1,
        maxQuantity: 1,
      },
      { itemId: "weapon_excalibur", chance: 5, minQuantity: 1, maxQuantity: 1 },
      {
        itemId: "mat_dragon_scale",
        chance: 50,
        minQuantity: 3,
        maxQuantity: 5,
      },
    ],
  },
];

// ============================================
// Seeds (Farming)
// ============================================

export const SEEDS: Item[] = [
  {
    id: "seed_carrot",
    name: "เมล็ดแครอท",
    type: "seed",
    rarity: "common",
    description: "เมล็ดพันธุ์แครอท ใช้เวลาปลูก 3 วัน",
    icon: "🥕",
    stackable: true,
    buyPrice: 10,
    sellPrice: 2,
  },
  {
    id: "seed_tomato",
    name: "เมล็ดมะเขือเทศ",
    type: "seed",
    rarity: "common",
    description: "เมล็ดพันธุ์มะเขือเทศ ใช้เวลาปลูก 5 วัน",
    icon: "🍅",
    stackable: true,
    buyPrice: 15,
    sellPrice: 3,
  },
  {
    id: "seed_corn",
    name: "เมล็ดข้าวโพด",
    type: "seed",
    rarity: "common",
    description: "เมล็ดพันธุ์ข้าวโพด ใช้เวลาปลูก 7 วัน",
    icon: "🌽",
    stackable: true,
    buyPrice: 20,
    sellPrice: 4,
  },
  {
    id: "seed_potato",
    name: "เมล็ดมันฝรั่ง",
    type: "seed",
    rarity: "common",
    description: "เมล็ดพันธุ์มันฝรั่ง ใช้เวลาปลูก 4 วัน",
    icon: "🥔",
    stackable: true,
    buyPrice: 12,
    sellPrice: 2,
  },
  {
    id: "seed_strawberry",
    name: "เมล็ดสตรอเบอร์รี่",
    type: "seed",
    rarity: "uncommon",
    description: "เมล็ดพันธุ์สตรอเบอร์รี่ ใช้เวลาปลูก 6 วัน",
    icon: "🍓",
    stackable: true,
    buyPrice: 25,
    sellPrice: 5,
  },
  {
    id: "seed_pumpkin",
    name: "เมล็ดฟักทอง",
    type: "seed",
    rarity: "uncommon",
    description: "เมล็ดพันธุ์ฟักทอง ใช้เวลาปลูก 10 วัน",
    icon: "🎃",
    stackable: true,
    buyPrice: 30,
    sellPrice: 6,
  },
  {
    id: "fertilizer_basic",
    name: "ปุ๋ยธรรมดา",
    type: "seed",
    rarity: "common",
    description: "เร่งการเติบโตของพืช 20%",
    icon: "💩",
    stackable: true,
    buyPrice: 50,
    sellPrice: 10,
  },
  {
    id: "fertilizer_super",
    name: "ปุ๋ยซุปเปอร์",
    type: "seed",
    rarity: "rare",
    description: "เร่งการเติบโตของพืช 50%",
    icon: "✨",
    stackable: true,
    buyPrice: 150,
    sellPrice: 30,
  },
];

// ============================================
// Food & Drinks
// ============================================

export const FOODS: Item[] = [
  {
    id: "food_bread",
    name: "ขนมปัง",
    type: "food",
    rarity: "common",
    description: "ขนมปังสดใหม่ ฟื้นฟู HP 20",
    icon: "🍞",
    stackable: true,
    buyPrice: 15,
    sellPrice: 3,
  },
  {
    id: "food_cheese",
    name: "ชีส",
    type: "food",
    rarity: "common",
    description: "ชีสหอมๆ ฟื้นฟู HP 30",
    icon: "🧀",
    stackable: true,
    buyPrice: 25,
    sellPrice: 5,
  },
  {
    id: "food_meat",
    name: "เนื้อย่าง",
    type: "food",
    rarity: "uncommon",
    description: "เนื้อย่างหอมกรุ่น ฟื้นฟู HP 60",
    icon: "🥩",
    stackable: true,
    buyPrice: 50,
    sellPrice: 10,
  },
  {
    id: "food_fish",
    name: "ปลาย่าง",
    type: "food",
    rarity: "common",
    description: "ปลาย่างสดใหม่ ฟื้นฟู HP 40",
    icon: "🐟",
    stackable: true,
    buyPrice: 40,
    sellPrice: 8,
  },
  {
    id: "food_salad",
    name: "สลัดผัก",
    type: "food",
    rarity: "common",
    description: "สลัดผักสด ฟื้นฟู HP 25 และ MP 10",
    icon: "🥗",
    stackable: true,
    buyPrice: 30,
    sellPrice: 6,
  },
  {
    id: "drink_water",
    name: "น้ำเปล่า",
    type: "food",
    rarity: "common",
    description: "น้ำดื่มสะอาด ฟื้นฟู MP 10",
    icon: "💧",
    stackable: true,
    buyPrice: 5,
    sellPrice: 1,
  },
  {
    id: "drink_juice",
    name: "น้ำผลไม้",
    type: "food",
    rarity: "common",
    description: "น้ำผลไม้สด ฟื้นฟู MP 25",
    icon: "🧃",
    stackable: true,
    buyPrice: 20,
    sellPrice: 4,
  },
  {
    id: "drink_milk",
    name: "นม",
    type: "food",
    rarity: "common",
    description: "นมสดจากฟาร์ม ฟื้นฟู HP 15 และ MP 15",
    icon: "🥛",
    stackable: true,
    buyPrice: 15,
    sellPrice: 3,
  },
];

// ============================================
// Tools
// ============================================

export const TOOLS: Item[] = [
  {
    id: "tool_axe",
    name: "ขวาน",
    type: "tool",
    rarity: "common",
    description: "ขวานสำหรับตัดไม้",
    icon: "🪓",
    stackable: false,
    buyPrice: 100,
    sellPrice: 20,
  },
  {
    id: "tool_pickaxe",
    name: "จอบ",
    type: "tool",
    rarity: "common",
    description: "จอบสำหรับขุดแร่",
    icon: "⛏️",
    stackable: false,
    buyPrice: 120,
    sellPrice: 24,
  },
  {
    id: "tool_fishing_rod",
    name: "เบ็ดตกปลา",
    type: "tool",
    rarity: "common",
    description: "เบ็ดสำหรับตกปลา",
    icon: "🎣",
    stackable: false,
    buyPrice: 80,
    sellPrice: 16,
  },
  {
    id: "tool_watering_can",
    name: "บัวรดน้ำ",
    type: "tool",
    rarity: "common",
    description: "บัวสำหรับรดน้ำต้นไม้",
    icon: "🚿",
    stackable: false,
    buyPrice: 60,
    sellPrice: 12,
  },
  {
    id: "tool_hoe",
    name: "จอบขุดดิน",
    type: "tool",
    rarity: "common",
    description: "จอบสำหรับขุดดินทำฟาร์ม",
    icon: "🔨",
    stackable: false,
    buyPrice: 70,
    sellPrice: 14,
  },
];

// ============================================
// Furniture
// ============================================

export const FURNITURE: Item[] = [
  {
    id: "furniture_chair",
    name: "เก้าอี้ไม้",
    type: "furniture",
    rarity: "common",
    description: "เก้าอี้ไม้นั่งสบาย",
    icon: "🪑",
    stackable: false,
    buyPrice: 150,
    sellPrice: 30,
  },
  {
    id: "furniture_table",
    name: "โต๊ะไม้",
    type: "furniture",
    rarity: "common",
    description: "โต๊ะไม้สำหรับวางของ",
    icon: "🪵",
    stackable: false,
    buyPrice: 200,
    sellPrice: 40,
  },
  {
    id: "furniture_bed",
    name: "เตียงนอน",
    type: "furniture",
    rarity: "uncommon",
    description: "เตียงนอนนุ่มสบาย",
    icon: "🛏️",
    stackable: false,
    buyPrice: 500,
    sellPrice: 100,
  },
  {
    id: "furniture_lamp",
    name: "โคมไฟ",
    type: "furniture",
    rarity: "common",
    description: "โคมไฟให้แสงสว่าง",
    icon: "💡",
    stackable: false,
    buyPrice: 80,
    sellPrice: 16,
  },
  {
    id: "furniture_bookshelf",
    name: "ชั้นหนังสือ",
    type: "furniture",
    rarity: "uncommon",
    description: "ชั้นเก็บหนังสือสุดเท่",
    icon: "📚",
    stackable: false,
    buyPrice: 300,
    sellPrice: 60,
  },
];

// ============================================
// Pets
// ============================================

export const PETS: Item[] = [
  {
    id: "pet_cat",
    name: "แมว",
    type: "pet",
    rarity: "rare",
    description: "แมวน่ารัก เพื่อนคู่ใจ",
    icon: "🐱",
    stackable: false,
    buyPrice: 500,
    sellPrice: 100,
  },
  {
    id: "pet_dog",
    name: "หมา",
    type: "pet",
    rarity: "rare",
    description: "หมาซื่อสัตย์ คอยปกป้องคุณ",
    icon: "🐕",
    stackable: false,
    buyPrice: 500,
    sellPrice: 100,
  },
  {
    id: "pet_rabbit",
    name: "กระต่าย",
    type: "pet",
    rarity: "uncommon",
    description: "กระต่ายน้อยน่ารัก",
    icon: "🐰",
    stackable: false,
    buyPrice: 300,
    sellPrice: 60,
  },
  {
    id: "pet_bird",
    name: "นก",
    type: "pet",
    rarity: "uncommon",
    description: "นกร้องเพลงไพเราะ",
    icon: "🐦",
    stackable: false,
    buyPrice: 200,
    sellPrice: 40,
  },
  {
    id: "pet_fish",
    name: "ปลาทอง",
    type: "pet",
    rarity: "common",
    description: "ปลาทองสีสันสดใส",
    icon: "🐠",
    stackable: false,
    buyPrice: 100,
    sellPrice: 20,
  },
];

// ============================================
// All Items Map (for quick lookup)
// ============================================

export const ALL_ITEMS: Item[] = [
  ...WEAPONS,
  ...ARMORS,
  ...ACCESSORIES,
  ...CONSUMABLES,
  ...MATERIALS,
  ...CHESTS,
  ...SEEDS,
  ...FOODS,
  ...TOOLS,
  ...FURNITURE,
  ...PETS,
];

export const ITEMS_MAP: Record<string, Item> = ALL_ITEMS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {} as Record<string, Item>);

// ============================================
// Helper Functions
// ============================================

export function getItemById(itemId: string): Item | undefined {
  return ITEMS_MAP[itemId];
}

export function isEquipment(
  item: Item
): item is WeaponItem | ArmorItem | AccessoryItem {
  return (
    item.type === "weapon" || item.type === "armor" || item.type === "accessory"
  );
}

export function getEquipmentSlot(
  item: Item
): "weapon" | "armor" | "accessory" | null {
  if (item.type === "weapon") return "weapon";
  if (item.type === "armor") return "armor";
  if (item.type === "accessory") return "accessory";
  return null;
}
