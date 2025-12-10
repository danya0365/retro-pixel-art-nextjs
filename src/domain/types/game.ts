/**
 * Game domain types for Retro Pixel Garden
 * Used for game state management with Colyseus
 */

// Player state
export interface PlayerState {
  id: string;
  oddsname: string;
  avatar: string;
  x: number;
  y: number;
  z: number;
  direction: "up" | "down" | "left" | "right";
  isMoving: boolean;
  currentAction: PlayerAction | null;
}

export type PlayerAction = "idle" | "walk" | "plant" | "water" | "harvest";

// World tile types
export type TileType = "grass" | "dirt" | "water" | "stone" | "sand" | "path";

export interface Tile {
  id: string;
  type: TileType;
  x: number;
  y: number;
  plantedItem?: PlantedItem;
}

// Planted items (crops, trees, flowers)
export interface PlantedItem {
  id: string;
  type: PlantType;
  plantedAt: string;
  growthStage: number; // 0-4 (seed to mature)
  wateredAt?: string;
}

export type PlantType =
  | "tree_oak"
  | "tree_pine"
  | "tree_maple"
  | "flower_rose"
  | "flower_sunflower"
  | "flower_tulip"
  | "bush_berry"
  | "bush_flower";

// World objects (decorations, structures)
export interface WorldObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  z: number;
  rotation?: number;
}

export type ObjectType =
  | "fence_wood"
  | "fence_stone"
  | "bench"
  | "lamp"
  | "fountain"
  | "statue"
  | "mailbox"
  | "sign";

// Game world state
export interface WorldState {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: Map<string, Tile>;
  objects: Map<string, WorldObject>;
  players: Map<string, PlayerState>;
  createdAt: string;
  updatedAt: string;
}

// Game room state for Colyseus
export interface GameRoomState {
  worldId: string;
  worldName: string;
  players: Map<string, PlayerState>;
  tiles: Map<string, Tile>;
  objects: Map<string, WorldObject>;
}

// Input commands for player movement
export interface PlayerInput {
  type: "move" | "action";
  direction?: "up" | "down" | "left" | "right";
  action?: PlayerAction;
  targetX?: number;
  targetY?: number;
}

// Game settings
export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  showGrid: boolean;
  cameraZoom: number;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.7,
  showGrid: false,
  cameraZoom: 1,
};

// World generation config
export interface WorldConfig {
  width: number;
  height: number;
  seed?: string;
  treesDensity: number; // 0-1
  waterFeatures: boolean;
  pathways: boolean;
}

export const DEFAULT_WORLD_CONFIG: WorldConfig = {
  width: 32,
  height: 32,
  treesDensity: 0.15,
  waterFeatures: true,
  pathways: true,
};
