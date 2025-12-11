import { MapSchema, Schema, type } from "@colyseus/schema";

/**
 * Player Stats Schema
 * RPG stats for the player
 */
export class PlayerStats extends Schema {
  @type("number") level: number = 1;
  @type("number") exp: number = 0;
  @type("number") expToNextLevel: number = 100;

  @type("number") hp: number = 120;
  @type("number") maxHp: number = 120;
  @type("number") mp: number = 30;
  @type("number") maxMp: number = 30;

  @type("number") atk: number = 85;
  @type("number") def: number = 75;
  @type("number") agi: number = 90;
  @type("number") wis: number = 60;
  @type("number") mov: number = 2;
  @type("number") rng: number = 1;

  @type("number") gold: number = 100;
  @type("number") highestClearedStage: number = 0;
}

/**
 * Player Schema
 * Represents a player in the game
 */
export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") username: string = "";
  @type("string") characterType: string = "warrior"; // warrior, mage, archer, rogue
  @type("string") characterClass: string = "Farmer"; // Farmer, Warrior, Mage
  @type("string") avatar: string = "👨‍🌾";

  // Position
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type("number") rotation: number = 0;
  @type("boolean") isMoving: boolean = false;
  @type("number") timestamp: number = 0;

  // RPG Stats
  @type(PlayerStats) stats: PlayerStats = new PlayerStats();
}

/**
 * NPC Schema
 * Represents a non-player character in the game
 */
export class NPC extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("string") type: string = "villager"; // villager, merchant, guard, animal
  @type("string") behavior: string = "idle"; // idle, wander, patrol
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type("number") rotation: number = 0;
  @type("number") speed: number = 1.5;
  @type("number") health: number = 100;
  @type("number") maxHealth: number = 100;
  @type("boolean") isInteractable: boolean = true;
}

/**
 * Game State Schema
 * Root state that gets synchronized with all clients
 */
export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: NPC }) npcs = new MapSchema<NPC>();
  @type("number") serverTime: number = Date.now();
}
