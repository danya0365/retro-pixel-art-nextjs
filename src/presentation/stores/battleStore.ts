import { MONSTERS, type BattleStage } from "@/src/domain/data/monsters";
import { create } from "zustand";

/**
 * Battle Log Entry
 */
export interface BattleLogEntry {
  id: string;
  timestamp: number;
  turn: number;
  type:
    | "init"
    | "move"
    | "attack"
    | "skill"
    | "damage"
    | "heal"
    | "death"
    | "turn_start"
    | "turn_end"
    | "victory"
    | "defeat"
    | "info";
  message: string;
  unitId?: string;
  unitName?: string;
  targetId?: string;
  targetName?: string;
  value?: number;
  isAlly?: boolean;
}

/**
 * Grid Position
 */
export interface GridPosition {
  x: number;
  y: number;
}

/**
 * Battle Unit State
 */
export interface BattleUnit {
  id: string;
  name: string;
  icon: string;
  position: GridPosition;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  stats: {
    atk: number;
    def: number;
    agi: number;
    wis: number;
    mov: number;
    rng: number;
  };
  isAlly: boolean;
  hasActed: boolean;
  element?: string;
  rank?: string;
}

/**
 * Battle Phase
 */
export type BattlePhase = "placement" | "battle" | "victory" | "defeat";

/**
 * Battle State
 */
interface BattleState {
  // Battle Info
  battleId: string | null;
  stage: BattleStage | null;
  gridWidth: number;
  gridHeight: number;

  // Units
  allyUnits: BattleUnit[];
  enemyUnits: BattleUnit[];

  // Turn Management
  turn: number;
  phase: BattlePhase;
  currentUnitId: string | null;
  turnOrder: BattleUnit[];

  // Range State
  movementRange: GridPosition[];
  attackRange: GridPosition[];
  originalPosition: GridPosition | null;

  // Battle Logs
  battleLogs: BattleLogEntry[];

  // Results
  rewards: {
    exp: number;
    gold: number;
  } | null;
}

/**
 * Battle Actions
 */
interface BattleActions {
  // Initialize
  initBattle: (stage: BattleStage, playerUnit: BattleUnit) => void;

  // Unit Actions
  moveUnit: (unitId: string, x: number, y: number) => void;
  attackUnit: (attackerId: string, targetId: string) => void;

  // Turn Management
  endTurn: () => void;

  // Range Management
  calculateRanges: () => void;

  // Computed Getters
  getCurrentUnit: () => BattleUnit | null;
  getUnitAtPosition: (x: number, y: number) => BattleUnit | undefined;
  isTileInMovementRange: (x: number, y: number) => boolean;
  isTileInAttackRange: (x: number, y: number) => boolean;

  // Game Actions
  handleTileClick: (x: number, y: number) => void;
  playEnemyTurn: () => void;

  // Battle Flow
  checkVictory: () => boolean;
  checkDefeat: () => boolean;
  endBattle: (victory: boolean) => void;
  resetBattle: () => void;

  // Logs
  addBattleLog: (
    log: Omit<BattleLogEntry, "id" | "timestamp" | "turn">
  ) => void;
  clearBattleLogs: () => void;
}

type BattleStore = BattleState & BattleActions;

const initialState: BattleState = {
  battleId: null,
  stage: null,
  gridWidth: 8,
  gridHeight: 6,
  allyUnits: [],
  enemyUnits: [],
  turn: 1,
  phase: "battle",
  currentUnitId: null,
  turnOrder: [],
  movementRange: [],
  attackRange: [],
  originalPosition: null,
  battleLogs: [],
  rewards: null,
};

export const useBattleStore = create<BattleStore>((set, get) => ({
  ...initialState,

  /**
   * Add Battle Log
   */
  addBattleLog: (log) => {
    set((state) => {
      const newLog: BattleLogEntry = {
        ...log,
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        turn: state.turn,
      };

      const newLogs = [...state.battleLogs, newLog];

      // Keep only the last 50 entries
      if (newLogs.length > 50) {
        newLogs.splice(0, newLogs.length - 50);
      }

      return { battleLogs: newLogs };
    });
  },

  /**
   * Clear Battle Logs
   */
  clearBattleLogs: () => {
    set({ battleLogs: [] });
  },

  /**
   * Initialize Battle
   */
  initBattle: (stage, playerUnit) => {
    const battleId = `battle_${Date.now()}`;

    // Create ally unit at start position
    const ally: BattleUnit = {
      ...playerUnit,
      id: `ally_${playerUnit.id}_${battleId}`,
      position: { x: 1, y: 3 },
      hasActed: false,
      isAlly: true,
    };

    // Create enemy units from stage monsters
    const enemies: BattleUnit[] = stage.monsters
      .map((sm, index) => {
        const monster = MONSTERS[sm.monsterId];
        if (!monster) return null;

        // Calculate stats based on level (base + level growth)
        const levelMultiplier = 1 + (sm.level - 1) * 0.1;
        const calcStat = (base: number) => Math.floor(base * levelMultiplier);

        const startPositions = [
          { x: 6, y: 1 },
          { x: 6, y: 3 },
          { x: 6, y: 5 },
          { x: 5, y: 2 },
          { x: 5, y: 4 },
        ];

        const maxHp = calcStat(monster.baseStats.hp);
        const maxMp = calcStat(monster.baseStats.mp);

        return {
          id: `enemy_${sm.monsterId}_${index}_${battleId}`,
          name: monster.name,
          icon: monster.icon,
          position:
            sm.position || startPositions[index % startPositions.length],
          currentHp: maxHp,
          maxHp: maxHp,
          currentMp: maxMp,
          maxMp: maxMp,
          stats: {
            atk: calcStat(monster.baseStats.atk),
            def: calcStat(monster.baseStats.def),
            agi: calcStat(monster.baseStats.agi),
            wis: calcStat(monster.baseStats.wis),
            mov: monster.baseStats.mov,
            rng: monster.baseStats.rng,
          },
          isAlly: false,
          hasActed: false,
          element: monster.element,
          rank: monster.rank,
        };
      })
      .filter((e) => e !== null) as BattleUnit[];

    // Calculate turn order (based on AGI)
    const allUnits = [ally, ...enemies];
    const turnOrder = [...allUnits].sort((a, b) => b.stats.agi - a.stats.agi);

    set({
      battleId,
      stage,
      allyUnits: [ally],
      enemyUnits: enemies,
      turn: 1,
      phase: "battle",
      currentUnitId: turnOrder[0]?.id || null,
      turnOrder,
      movementRange: [],
      attackRange: [],
      originalPosition: null,
      battleLogs: [],
      rewards: null,
    });

    // Add init log
    get().addBattleLog({
      type: "init",
      message: `⚔️ เริ่มการต่อสู้! ${stage.name}`,
    });

    // Calculate initial ranges
    get().calculateRanges();

    // If first unit is enemy, trigger AI
    const firstUnit = turnOrder[0];
    if (firstUnit && !firstUnit.isAlly) {
      setTimeout(() => get().playEnemyTurn(), 1000);
    }
  },

  /**
   * Calculate Movement and Attack Ranges
   */
  calculateRanges: () => {
    const state = get();
    const currentUnit = state.getCurrentUnit();

    if (!currentUnit) {
      set({ movementRange: [], attackRange: [] });
      return;
    }

    // Set original position if not set
    if (!state.originalPosition) {
      set({ originalPosition: { ...currentUnit.position } });
    }

    const positionForMove = state.originalPosition || currentUnit.position;
    const range = currentUnit.stats.mov;

    // BFS for movement range
    const moveRange: GridPosition[] = [];
    const visited = new Set<string>();
    const queue: { x: number; y: number; distance: number }[] = [
      { x: positionForMove.x, y: positionForMove.y, distance: 0 },
    ];
    visited.add(`${positionForMove.x},${positionForMove.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      const directions = [
        { x: current.x, y: current.y - 1 },
        { x: current.x, y: current.y + 1 },
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y },
      ];

      for (const next of directions) {
        const key = `${next.x},${next.y}`;

        // Check bounds
        if (
          next.x < 0 ||
          next.x >= state.gridWidth ||
          next.y < 0 ||
          next.y >= state.gridHeight
        ) {
          continue;
        }

        if (visited.has(key)) continue;

        // Check if occupied by enemy
        const occupiedByEnemy = state.enemyUnits.some(
          (u) => u.position.x === next.x && u.position.y === next.y
        );
        if (occupiedByEnemy) continue;

        // Check if occupied by ally (can't stop on ally)
        const occupiedByAlly = state.allyUnits.some(
          (u) =>
            u.position.x === next.x &&
            u.position.y === next.y &&
            u.id !== currentUnit.id
        );

        const newDistance = current.distance + 1;

        if (newDistance <= range) {
          if (!occupiedByAlly) {
            moveRange.push({ x: next.x, y: next.y });
          }
          visited.add(key);
          queue.push({ x: next.x, y: next.y, distance: newDistance });
        }
      }
    }

    // Attack range from current position
    const atkRange: GridPosition[] = [];
    const attackRangeValue = currentUnit.stats.rng || 2;

    for (let x = 0; x < state.gridWidth; x++) {
      for (let y = 0; y < state.gridHeight; y++) {
        const distance =
          Math.abs(x - currentUnit.position.x) +
          Math.abs(y - currentUnit.position.y);
        if (distance <= attackRangeValue && distance > 0) {
          atkRange.push({ x, y });
        }
      }
    }

    set({
      movementRange: moveRange,
      attackRange: atkRange,
    });
  },

  /**
   * Move Unit
   */
  moveUnit: (unitId, x, y) => {
    const state = get();
    const unit = [...state.allyUnits, ...state.enemyUnits].find(
      (u) => u.id === unitId
    );

    set((state) => {
      const newAllyUnits = state.allyUnits.map((u) =>
        u.id === unitId ? { ...u, position: { x, y } } : u
      );
      const newEnemyUnits = state.enemyUnits.map((u) =>
        u.id === unitId ? { ...u, position: { x, y } } : u
      );

      return {
        allyUnits: newAllyUnits,
        enemyUnits: newEnemyUnits,
      };
    });

    if (unit) {
      get().addBattleLog({
        type: "move",
        message: `🚶 ${unit.name} เคลื่อนที่ไปยัง (${x}, ${y})`,
        unitId: unit.id,
        unitName: unit.name,
        isAlly: unit.isAlly,
      });
    }

    // Recalculate attack range after move
    get().calculateRanges();
  },

  /**
   * Attack Unit
   */
  attackUnit: (attackerId, targetId) => {
    const state = get();
    const attacker = [...state.allyUnits, ...state.enemyUnits].find(
      (u) => u.id === attackerId
    );
    const target = [...state.allyUnits, ...state.enemyUnits].find(
      (u) => u.id === targetId
    );

    if (!attacker || !target) return;

    const damage = Math.max(1, attacker.stats.atk - target.stats.def);

    set((state) => {
      const newAllyUnits = state.allyUnits.map((unit) => {
        if (unit.id === targetId) {
          return { ...unit, currentHp: Math.max(0, unit.currentHp - damage) };
        }
        if (unit.id === attackerId) {
          return { ...unit, hasActed: true };
        }
        return unit;
      });

      const newEnemyUnits = state.enemyUnits.map((unit) => {
        if (unit.id === targetId) {
          return { ...unit, currentHp: Math.max(0, unit.currentHp - damage) };
        }
        if (unit.id === attackerId) {
          return { ...unit, hasActed: true };
        }
        return unit;
      });

      // Remove dead units
      const filteredAllyUnits = newAllyUnits.filter((u) => u.currentHp > 0);
      const filteredEnemyUnits = newEnemyUnits.filter((u) => u.currentHp > 0);

      return {
        allyUnits: filteredAllyUnits,
        enemyUnits: filteredEnemyUnits,
      };
    });

    // Add logs
    get().addBattleLog({
      type: "attack",
      message: `⚔️ ${attacker.name} โจมตี ${target.name}`,
      unitId: attacker.id,
      unitName: attacker.name,
      targetId: target.id,
      targetName: target.name,
      isAlly: attacker.isAlly,
    });

    get().addBattleLog({
      type: "damage",
      message: `💥 ${target.name} ได้รับ ${damage} ดาเมจ`,
      unitId: target.id,
      unitName: target.name,
      value: damage,
      isAlly: target.isAlly,
    });

    // Check if target died
    const updatedTarget = [...get().allyUnits, ...get().enemyUnits].find(
      (u) => u.id === targetId
    );
    if (!updatedTarget) {
      get().addBattleLog({
        type: "death",
        message: `💀 ${target.name} ถูกปราบ!`,
        unitId: target.id,
        unitName: target.name,
        isAlly: target.isAlly,
      });
    }

    // Check victory/defeat
    setTimeout(() => {
      if (get().checkVictory()) {
        get().endBattle(true);
      } else if (get().checkDefeat()) {
        get().endBattle(false);
      }
    }, 300);
  },

  /**
   * End Turn
   */
  endTurn: () => {
    set((state) => {
      // Mark current unit as acted
      const newAllyUnits = state.allyUnits.map((u) =>
        u.id === state.currentUnitId ? { ...u, hasActed: true } : u
      );
      const newEnemyUnits = state.enemyUnits.map((u) =>
        u.id === state.currentUnitId ? { ...u, hasActed: true } : u
      );

      // Get alive units
      const aliveUnits = [...newAllyUnits, ...newEnemyUnits].filter(
        (u) => u.currentHp > 0
      );

      // Find next unit in turn order
      const aliveTurnOrder = state.turnOrder.filter((u) =>
        aliveUnits.some((au) => au.id === u.id)
      );

      const currentIndex = aliveTurnOrder.findIndex(
        (u) => u.id === state.currentUnitId
      );
      const nextIndex = (currentIndex + 1) % aliveTurnOrder.length;
      const isNewTurn = currentIndex >= aliveTurnOrder.length - 1;

      // Reset hasActed on new turn
      if (isNewTurn) {
        newAllyUnits.forEach((u) => (u.hasActed = false));
        newEnemyUnits.forEach((u) => (u.hasActed = false));
      }

      return {
        allyUnits: newAllyUnits,
        enemyUnits: newEnemyUnits,
        turn: isNewTurn ? state.turn + 1 : state.turn,
        currentUnitId: aliveTurnOrder[nextIndex]?.id || null,
        originalPosition: null,
      };
    });

    // Add turn log
    const state = get();
    const nextUnit = state.getCurrentUnit();
    if (nextUnit) {
      get().addBattleLog({
        type: "turn_start",
        message: `🎯 เทิร์นของ ${nextUnit.name}`,
        unitId: nextUnit.id,
        unitName: nextUnit.name,
        isAlly: nextUnit.isAlly,
      });
    }

    // Calculate ranges for new unit
    get().calculateRanges();

    // If enemy turn, trigger AI
    if (nextUnit && !nextUnit.isAlly && state.phase === "battle") {
      setTimeout(() => get().playEnemyTurn(), 1000);
    }
  },

  /**
   * Get Current Unit
   */
  getCurrentUnit: () => {
    const { currentUnitId, allyUnits, enemyUnits } = get();
    return (
      [...allyUnits, ...enemyUnits].find((u) => u.id === currentUnitId) || null
    );
  },

  /**
   * Get Unit at Position
   */
  getUnitAtPosition: (x, y) => {
    const { allyUnits, enemyUnits } = get();
    return [...allyUnits, ...enemyUnits].find(
      (u) => u.position.x === x && u.position.y === y
    );
  },

  /**
   * Check if tile in movement range
   */
  isTileInMovementRange: (x, y) => {
    const { movementRange } = get();
    return movementRange.some((pos) => pos.x === x && pos.y === y);
  },

  /**
   * Check if tile in attack range
   */
  isTileInAttackRange: (x, y) => {
    const { attackRange } = get();
    return attackRange.some((pos) => pos.x === x && pos.y === y);
  },

  /**
   * Handle Tile Click
   */
  handleTileClick: (x, y) => {
    const state = get();
    const currentUnit = state.getCurrentUnit();

    if (!currentUnit || !currentUnit.isAlly || currentUnit.hasActed) return;

    const unit = state.getUnitAtPosition(x, y);

    if (unit && unit.id !== currentUnit.id) {
      // Try to attack enemy
      if (state.isTileInAttackRange(x, y) && !unit.isAlly) {
        state.attackUnit(currentUnit.id, unit.id);
        setTimeout(() => get().endTurn(), 500);
      }
    } else if (!unit && state.isTileInMovementRange(x, y)) {
      // Move to empty tile
      state.moveUnit(currentUnit.id, x, y);
    }
  },

  /**
   * Play Enemy Turn (AI)
   */
  playEnemyTurn: () => {
    const state = get();
    const currentUnit = state.getCurrentUnit();

    if (!currentUnit || currentUnit.isAlly || state.phase !== "battle") {
      return;
    }

    // Find nearest ally
    let nearestAlly: BattleUnit | null = null;
    let minDistance = Infinity;

    for (const ally of state.allyUnits) {
      const distance =
        Math.abs(ally.position.x - currentUnit.position.x) +
        Math.abs(ally.position.y - currentUnit.position.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearestAlly = ally;
      }
    }

    if (!nearestAlly) {
      get().endTurn();
      return;
    }

    const attackRangeValue = currentUnit.stats.rng || 2;

    if (minDistance <= attackRangeValue) {
      // Attack if in range
      get().attackUnit(currentUnit.id, nearestAlly.id);
      setTimeout(() => get().endTurn(), 500);
    } else {
      // Move toward ally
      const dx = nearestAlly.position.x - currentUnit.position.x;
      const dy = nearestAlly.position.y - currentUnit.position.y;

      let newX = currentUnit.position.x;
      let newY = currentUnit.position.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        newX += dx > 0 ? 1 : -1;
      } else {
        newY += dy > 0 ? 1 : -1;
      }

      // Check if occupied
      const occupied = [...state.allyUnits, ...state.enemyUnits].some(
        (u) =>
          u.position.x === newX &&
          u.position.y === newY &&
          u.id !== currentUnit.id
      );

      if (
        !occupied &&
        newX >= 0 &&
        newX < state.gridWidth &&
        newY >= 0 &&
        newY < state.gridHeight
      ) {
        get().moveUnit(currentUnit.id, newX, newY);
      }

      setTimeout(() => get().endTurn(), 500);
    }
  },

  /**
   * Check Victory
   */
  checkVictory: () => {
    const { enemyUnits } = get();
    return enemyUnits.length === 0 || enemyUnits.every((u) => u.currentHp <= 0);
  },

  /**
   * Check Defeat
   */
  checkDefeat: () => {
    const { allyUnits } = get();
    return allyUnits.length === 0 || allyUnits.every((u) => u.currentHp <= 0);
  },

  /**
   * End Battle
   */
  endBattle: (victory) => {
    const stage = get().stage;
    const rewards =
      victory && stage
        ? {
            exp: Math.floor(stage.rewards.exp),
            gold: Math.floor(stage.rewards.gold),
          }
        : null;

    set({
      phase: victory ? "victory" : "defeat",
      rewards,
    });

    get().addBattleLog({
      type: victory ? "victory" : "defeat",
      message: victory ? "🎉 ชัยชนะ!" : "💀 พ่ายแพ้...",
    });
  },

  /**
   * Reset Battle
   */
  resetBattle: () => {
    set(initialState);
  },
}));
