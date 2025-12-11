// ============================================
// Monster Database - Dragon Quest Tact Style
// ============================================

import type {
  ElementType,
  FamilyType,
  UnitRank,
} from "@/src/presentation/stores/characterStore";

export interface MonsterSkill {
  id: string;
  name: string;
  icon: string;
  mpCost: number;
  damage: number; // multiplier
  range: number;
  element: ElementType;
  description: string;
}

export interface Monster {
  id: string;
  name: string;
  icon: string;
  rank: UnitRank;
  family: FamilyType;
  element: ElementType;

  // Base stats (at level 1)
  baseStats: {
    hp: number;
    mp: number;
    atk: number;
    def: number;
    agi: number;
    wis: number;
    mov: number;
    rng: number;
  };

  // Skills
  skills: MonsterSkill[];

  // Rewards
  expReward: number;
  goldReward: number;
  dropItems: { itemId: string; chance: number }[];
}

export interface StageMonster {
  monsterId: string;
  level: number;
  position: { x: number; y: number };
}

export interface BattleStage {
  id: number;
  name: string;
  description: string;
  monsters: StageMonster[];
  rewards: {
    exp: number;
    gold: number;
    items: { itemId: string; chance: number }[];
  };
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0-3 stars based on performance
}

// ============================================
// Monster Skills Database
// ============================================

const SKILLS: Record<string, MonsterSkill> = {
  tackle: {
    id: "tackle",
    name: "พุ่งชน",
    icon: "💥",
    mpCost: 0,
    damage: 1.0,
    range: 1,
    element: "none",
    description: "โจมตีกายภาพพื้นฐาน",
  },
  fire_breath: {
    id: "fire_breath",
    name: "ลมหายใจไฟ",
    icon: "🔥",
    mpCost: 8,
    damage: 1.5,
    range: 2,
    element: "fire",
    description: "พ่นไฟใส่ศัตรู",
  },
  ice_slash: {
    id: "ice_slash",
    name: "เฉือนน้ำแข็ง",
    icon: "❄️",
    mpCost: 6,
    damage: 1.3,
    range: 1,
    element: "ice",
    description: "โจมตีด้วยพลังน้ำแข็ง",
  },
  heal: {
    id: "heal",
    name: "รักษา",
    icon: "💚",
    mpCost: 5,
    damage: -0.5, // negative = heal
    range: 2,
    element: "light",
    description: "ฟื้นฟู HP",
  },
  thunder: {
    id: "thunder",
    name: "สายฟ้า",
    icon: "⚡",
    mpCost: 10,
    damage: 1.8,
    range: 3,
    element: "lightning",
    description: "โจมตีด้วยสายฟ้า",
  },
  poison_bite: {
    id: "poison_bite",
    name: "กัดพิษ",
    icon: "🐍",
    mpCost: 4,
    damage: 1.1,
    range: 1,
    element: "dark",
    description: "กัดและปล่อยพิษ",
  },
  wind_slash: {
    id: "wind_slash",
    name: "เฉือนลม",
    icon: "🌪️",
    mpCost: 5,
    damage: 1.2,
    range: 2,
    element: "wind",
    description: "โจมตีด้วยคมลม",
  },
  rock_throw: {
    id: "rock_throw",
    name: "ขว้างหิน",
    icon: "🪨",
    mpCost: 3,
    damage: 1.1,
    range: 2,
    element: "earth",
    description: "ขว้างหินใส่ศัตรู",
  },
};

// ============================================
// Monster Database
// ============================================

export const MONSTERS: Record<string, Monster> = {
  // ===== F Rank (Weakest) =====
  slime: {
    id: "slime",
    name: "สไลม์",
    icon: "🟢",
    rank: "F",
    family: "slime",
    element: "none",
    baseStats: {
      hp: 30,
      mp: 5,
      atk: 15,
      def: 10,
      agi: 20,
      wis: 5,
      mov: 2,
      rng: 1,
    },
    skills: [SKILLS.tackle],
    expReward: 10,
    goldReward: 5,
    dropItems: [{ itemId: "slime_drop", chance: 0.5 }],
  },
  bubble_slime: {
    id: "bubble_slime",
    name: "บับเบิลสไลม์",
    icon: "🫧",
    rank: "F",
    family: "slime",
    element: "ice",
    baseStats: {
      hp: 25,
      mp: 10,
      atk: 12,
      def: 8,
      agi: 25,
      wis: 15,
      mov: 2,
      rng: 1,
    },
    skills: [SKILLS.tackle, SKILLS.ice_slash],
    expReward: 12,
    goldReward: 6,
    dropItems: [{ itemId: "slime_drop", chance: 0.4 }],
  },

  // ===== E Rank =====
  dracky: {
    id: "dracky",
    name: "แดร็กกี้",
    icon: "🦇",
    rank: "E",
    family: "demon",
    element: "dark",
    baseStats: {
      hp: 35,
      mp: 15,
      atk: 20,
      def: 12,
      agi: 35,
      wis: 20,
      mov: 3,
      rng: 1,
    },
    skills: [SKILLS.tackle, SKILLS.poison_bite],
    expReward: 18,
    goldReward: 10,
    dropItems: [{ itemId: "bat_wing", chance: 0.3 }],
  },
  chimaera: {
    id: "chimaera",
    name: "คิเมร่า",
    icon: "🐦",
    rank: "E",
    family: "beast",
    element: "wind",
    baseStats: {
      hp: 40,
      mp: 12,
      atk: 25,
      def: 15,
      agi: 30,
      wis: 15,
      mov: 3,
      rng: 1,
    },
    skills: [SKILLS.tackle, SKILLS.wind_slash],
    expReward: 20,
    goldReward: 12,
    dropItems: [{ itemId: "feather", chance: 0.35 }],
  },

  // ===== D Rank =====
  golem: {
    id: "golem",
    name: "โกเลม",
    icon: "🪨",
    rank: "D",
    family: "material",
    element: "earth",
    baseStats: {
      hp: 80,
      mp: 5,
      atk: 40,
      def: 50,
      agi: 10,
      wis: 5,
      mov: 1,
      rng: 1,
    },
    skills: [SKILLS.tackle, SKILLS.rock_throw],
    expReward: 35,
    goldReward: 25,
    dropItems: [{ itemId: "stone", chance: 0.6 }],
  },
  skeleton: {
    id: "skeleton",
    name: "สเกเลตัน",
    icon: "💀",
    rank: "D",
    family: "undead",
    element: "dark",
    baseStats: {
      hp: 50,
      mp: 10,
      atk: 35,
      def: 25,
      agi: 25,
      wis: 10,
      mov: 2,
      rng: 1,
    },
    skills: [SKILLS.tackle, SKILLS.ice_slash],
    expReward: 30,
    goldReward: 20,
    dropItems: [{ itemId: "bone", chance: 0.4 }],
  },

  // ===== C Rank =====
  dragon_kid: {
    id: "dragon_kid",
    name: "มังกรน้อย",
    icon: "🐲",
    rank: "C",
    family: "dragon",
    element: "fire",
    baseStats: {
      hp: 70,
      mp: 25,
      atk: 50,
      def: 35,
      agi: 35,
      wis: 30,
      mov: 2,
      rng: 1,
    },
    skills: [SKILLS.tackle, SKILLS.fire_breath],
    expReward: 50,
    goldReward: 40,
    dropItems: [{ itemId: "dragon_scale", chance: 0.2 }],
  },
  healslime: {
    id: "healslime",
    name: "ฮีลสไลม์",
    icon: "💚",
    rank: "C",
    family: "slime",
    element: "light",
    baseStats: {
      hp: 45,
      mp: 50,
      atk: 20,
      def: 25,
      agi: 30,
      wis: 60,
      mov: 2,
      rng: 2,
    },
    skills: [SKILLS.tackle, SKILLS.heal],
    expReward: 45,
    goldReward: 35,
    dropItems: [{ itemId: "herb", chance: 0.5 }],
  },

  // ===== B Rank =====
  killing_machine: {
    id: "killing_machine",
    name: "เครื่องจักรสังหาร",
    icon: "🤖",
    rank: "B",
    family: "material",
    element: "none",
    baseStats: {
      hp: 100,
      mp: 20,
      atk: 75,
      def: 60,
      agi: 45,
      wis: 25,
      mov: 2,
      rng: 2,
    },
    skills: [SKILLS.tackle, SKILLS.thunder],
    expReward: 80,
    goldReward: 60,
    dropItems: [{ itemId: "iron", chance: 0.4 }],
  },
  great_dragon: {
    id: "great_dragon",
    name: "เกรทดราก้อน",
    icon: "🐉",
    rank: "B",
    family: "dragon",
    element: "fire",
    baseStats: {
      hp: 120,
      mp: 40,
      atk: 85,
      def: 55,
      agi: 40,
      wis: 50,
      mov: 2,
      rng: 1,
    },
    skills: [SKILLS.tackle, SKILLS.fire_breath, SKILLS.wind_slash],
    expReward: 100,
    goldReward: 80,
    dropItems: [{ itemId: "dragon_scale", chance: 0.35 }],
  },

  // ===== A Rank =====
  metal_slime: {
    id: "metal_slime",
    name: "เมทัลสไลม์",
    icon: "🔘",
    rank: "A",
    family: "slime",
    element: "none",
    baseStats: {
      hp: 8,
      mp: 50,
      atk: 30,
      def: 999, // Very high defense!
      agi: 200, // Very fast, hard to hit
      wis: 50,
      mov: 3,
      rng: 1,
    },
    skills: [SKILLS.tackle],
    expReward: 500, // Massive EXP!
    goldReward: 200,
    dropItems: [{ itemId: "metal_drop", chance: 0.1 }],
  },

  // ===== S Rank (Boss) =====
  dragonlord: {
    id: "dragonlord",
    name: "ราชามังกร",
    icon: "👑",
    rank: "S",
    family: "dragon",
    element: "dark",
    baseStats: {
      hp: 300,
      mp: 100,
      atk: 150,
      def: 100,
      agi: 80,
      wis: 120,
      mov: 2,
      rng: 2,
    },
    skills: [
      SKILLS.tackle,
      SKILLS.fire_breath,
      SKILLS.thunder,
      SKILLS.ice_slash,
    ],
    expReward: 1000,
    goldReward: 500,
    dropItems: [{ itemId: "dragon_orb", chance: 0.05 }],
  },
};

// ============================================
// Stage Generator - Infinite Levels
// ============================================

export function generateStage(stageNumber: number): BattleStage {
  // Calculate difficulty scaling
  const difficulty = Math.floor(stageNumber / 5); // Every 5 levels = harder tier

  // Determine monster ranks for this stage
  let availableRanks: UnitRank[];
  if (stageNumber <= 5) {
    availableRanks = ["F"];
  } else if (stageNumber <= 10) {
    availableRanks = ["F", "E"];
  } else if (stageNumber <= 20) {
    availableRanks = ["E", "D"];
  } else if (stageNumber <= 35) {
    availableRanks = ["D", "C"];
  } else if (stageNumber <= 50) {
    availableRanks = ["C", "B"];
  } else if (stageNumber <= 75) {
    availableRanks = ["B", "A"];
  } else {
    availableRanks = ["A", "S"];
  }

  // Get monsters of appropriate rank
  const availableMonsters = Object.values(MONSTERS).filter((m) =>
    availableRanks.includes(m.rank)
  );

  // Generate 1-4 monsters for the stage
  const monsterCount = Math.min(1 + Math.floor(stageNumber / 10), 4);
  const stageMonsters: StageMonster[] = [];

  for (let i = 0; i < monsterCount; i++) {
    const monster =
      availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    const level = Math.max(1, stageNumber + Math.floor(Math.random() * 3) - 1);

    // Position monsters on grid
    stageMonsters.push({
      monsterId: monster.id,
      level,
      position: {
        x: 4 + (i % 2) * 2,
        y: 3 + Math.floor(i / 2) * 2,
      },
    });
  }

  // Calculate rewards (scales with stage number)
  const baseExp = 20 + stageNumber * 15;
  const baseGold = 10 + stageNumber * 8;

  return {
    id: stageNumber,
    name: `ด่าน ${stageNumber}`,
    description: getStageName(stageNumber),
    monsters: stageMonsters,
    rewards: {
      exp: baseExp * (1 + difficulty * 0.2),
      gold: baseGold * (1 + difficulty * 0.15),
      items: [],
    },
    unlocked: true,
    completed: false,
    stars: 0,
  };
}

function getStageName(stage: number): string {
  if (stage <= 5) return "🌲 ป่าเริ่มต้น";
  if (stage <= 10) return "🏔️ เนินเขา";
  if (stage <= 20) return "🦴 ถ้ำกระดูก";
  if (stage <= 35) return "🌋 ภูเขาไฟ";
  if (stage <= 50) return "🏰 ปราสาทร้าง";
  if (stage <= 75) return "⚔️ สนามรบ";
  return "👑 บัลลังก์มังกร";
}

// Get rank color
export function getRankColor(rank: UnitRank): string {
  switch (rank) {
    case "S":
      return "text-yellow-500 bg-yellow-100";
    case "A":
      return "text-purple-500 bg-purple-100";
    case "B":
      return "text-blue-500 bg-blue-100";
    case "C":
      return "text-green-500 bg-green-100";
    case "D":
      return "text-gray-500 bg-gray-100";
    case "E":
      return "text-orange-500 bg-orange-100";
    case "F":
      return "text-red-400 bg-red-100";
    default:
      return "text-gray-400 bg-gray-50";
  }
}

// Get element icon
export function getElementIcon(element: ElementType): string {
  switch (element) {
    case "fire":
      return "🔥";
    case "ice":
      return "❄️";
    case "wind":
      return "🌪️";
    case "earth":
      return "🪨";
    case "lightning":
      return "⚡";
    case "dark":
      return "🌑";
    case "light":
      return "✨";
    default:
      return "⚪";
  }
}
