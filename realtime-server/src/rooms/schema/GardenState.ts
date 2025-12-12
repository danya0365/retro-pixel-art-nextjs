import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

/**
 * Inventory Item Schema
 */
export class InventoryItemSchema extends Schema {
  @type("string") itemId: string = "";
  @type("number") quantity: number = 0;
}

/**
 * Equipment Schema
 */
export class EquipmentSchema extends Schema {
  @type("string") weapon: string = ""; // Item ID or empty
  @type("string") armor: string = "";
  @type("string") accessory: string = "";
}

/**
 * Pet Schema - สัตว์เลี้ยงของผู้เล่น
 */
export class PetSchema extends Schema {
  @type("string") petId: string = ""; // pet_cat, pet_dog, etc.
  @type("string") name: string = ""; // ชื่อที่ผู้เล่นตั้ง
  @type("number") happiness: number = 100; // 0-100 ความสุข
  @type("number") hunger: number = 100; // 0-100 ความอิ่ม
  @type("number") energy: number = 100; // 0-100 พลังงาน
  @type("number") level: number = 1;
  @type("number") exp: number = 0;
  @type("number") adoptedAt: number = 0; // timestamp ที่รับเลี้ยง
  @type("number") lastFedAt: number = 0; // timestamp ล่าสุดที่ให้อาหาร
  @type("number") lastPlayedAt: number = 0; // timestamp ล่าสุดที่เล่นด้วย
}

/**
 * Player state in the garden world
 */
export class GardenPlayer extends Schema {
  @type("string") id: string = "";
  @type("string") clientId: string = "";
  @type("string") nickname: string = "";
  @type("string") avatar: string = "🧑‍🌾";

  // Position
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;

  // Movement
  @type("number") velocityX: number = 0;
  @type("number") velocityZ: number = 0;
  @type("string") direction: string = "down"; // up, down, left, right
  @type("boolean") isMoving: boolean = false;

  // State
  @type("string") currentAction: string = "idle"; // idle, walk, plant, water, harvest
  @type("number") lastProcessedInput: number = 0;
  @type("number") timestamp: number = 0;

  // Character Stats (synced from client)
  @type("string") characterClass: string = "Farmer";
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
  @type("number") gold: number = 100;
  @type("number") mov: number = 2;
  @type("number") rng: number = 1;
  @type("number") highestClearedStage: number = 0;

  // Equipment (Item IDs equipped)
  @type(EquipmentSchema) equipment = new EquipmentSchema();

  // Inventory (Array of items with quantity)
  @type([InventoryItemSchema]) inventory =
    new ArraySchema<InventoryItemSchema>();

  // Pets (Array of owned pets)
  @type([PetSchema]) pets = new ArraySchema<PetSchema>();

  // Active Pet (currently following player)
  @type("string") activePetId: string = ""; // petId of active pet
}

/**
 * Planted item in the garden
 */
export class PlantedItem extends Schema {
  @type("string") id: string = "";
  @type("string") type: string = ""; // tree_oak, flower_rose, etc.
  @type("number") x: number = 0;
  @type("number") z: number = 0;
  @type("number") growthStage: number = 0; // 0-4
  @type("number") plantedAt: number = 0;
  @type("number") wateredAt: number = 0;
  @type("string") plantedBy: string = "";
}

/**
 * World object (decoration, structure)
 */
export class WorldObject extends Schema {
  @type("string") id: string = "";
  @type("string") type: string = ""; // fence_wood, bench, lamp, etc.
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type("number") rotation: number = 0;
  @type("string") placedBy: string = "";
  @type("number") timestamp: number = 0;
}

/**
 * Main garden room state
 */
export class GardenState extends Schema {
  @type("string") worldId: string = "";
  @type("string") worldName: string = "Pixel Garden";
  @type("number") worldSize: number = 32;

  // Collections
  @type([GardenPlayer]) players = new ArraySchema<GardenPlayer>();
  @type({ map: PlantedItem }) plants = new MapSchema<PlantedItem>();
  @type({ map: WorldObject }) objects = new MapSchema<WorldObject>();

  // Server state
  @type("number") serverTick: number = 0;
  @type("number") serverTime: number = 0;
  @type("number") dayTime: number = 12; // 0-24 hours (game time)
}
