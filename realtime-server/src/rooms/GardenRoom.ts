import { Client, Room } from "@colyseus/core";
import {
  GardenPlayer,
  GardenState,
  InventoryItemSchema,
  PetSchema,
  PlantedItem,
  WorldObject,
} from "./schema/GardenState";

// Constants
const PLAYER_SPEED = 5;
const SERVER_TICK_RATE = 60;
const WORLD_SIZE = 80; // ขยายจาก 32 เป็น 80

interface PlayerInput {
  sequenceNumber: number;
  velocityX: number;
  velocityZ: number;
  direction: string;
  timestamp: number;
}

interface PlantInput {
  type: string;
  x: number;
  z: number;
}

interface PlaceObjectInput {
  type: string;
  x: number;
  y: number;
  z: number;
  rotation?: number;
}

interface JoinOptions {
  nickname?: string;
  avatar?: string;
  // Character stats from client
  characterClass?: string;
  stats?: {
    level?: number;
    exp?: number;
    expToNextLevel?: number;
    hp?: number;
    maxHp?: number;
    mp?: number;
    maxMp?: number;
    atk?: number;
    def?: number;
    agi?: number;
    wis?: number;
    gold?: number;
    mov?: number;
    rng?: number;
    highestClearedStage?: number;
  };
}

// Time before empty room is disposed (5 minutes)
const EMPTY_ROOM_TIMEOUT = 5 * 60 * 1000;

export class GardenRoom extends Room<GardenState> {
  maxClients = 20;
  autoDispose = false; // ไม่ให้ room หายเมื่อไม่มีผู้เล่น

  private updateInterval?: NodeJS.Timeout;
  private emptyRoomTimeout?: NodeJS.Timeout;
  private plantIdCounter = 0;
  private objectIdCounter = 0;

  onCreate(options: { worldName?: string }) {
    console.log("🌻 GardenRoom created!", options);

    this.setState(new GardenState());
    this.state.worldId = `garden_${Date.now()}`;
    this.state.worldName = options.worldName || "Pixel Garden";
    this.state.worldSize = WORLD_SIZE;

    // Set metadata
    this.setMetadata({
      worldName: this.state.worldName,
      playerCount: 0,
    });

    // Message handlers
    this.onMessage("player_input", (client, message: PlayerInput) => {
      this.handlePlayerInput(client, message);
    });

    this.onMessage("plant", (client, message: PlantInput) => {
      this.handlePlant(client, message);
    });

    this.onMessage("water", (client, message: { plantId: string }) => {
      this.handleWater(client, message.plantId);
    });

    this.onMessage("harvest", (client, message: { plantId: string }) => {
      this.handleHarvest(client, message.plantId);
    });

    this.onMessage("place_object", (client, message: PlaceObjectInput) => {
      this.handlePlaceObject(client, message);
    });

    this.onMessage("remove_object", (client, message: { objectId: string }) => {
      this.handleRemoveObject(client, message.objectId);
    });

    // Handle stats update from client
    this.onMessage(
      "update_stats",
      (client, message: { stats: Partial<JoinOptions["stats"]> }) => {
        this.handleUpdateStats(client, message.stats);
      }
    );

    // Handle battle victory from client
    this.onMessage(
      "battle_victory",
      (
        client,
        message: {
          stageId: number;
          stageName: string;
          rewards: { exp: number; gold: number };
          leveledUp: boolean;
          newLevel?: number;
        }
      ) => {
        this.handleBattleVictory(client, message);
      }
    );

    // Equipment & Inventory handlers
    this.onMessage(
      "equip_item",
      (
        client,
        message: { itemId: string; slot: "weapon" | "armor" | "accessory" }
      ) => {
        this.handleEquipItem(client, message);
      }
    );

    this.onMessage(
      "unequip_item",
      (client, message: { slot: "weapon" | "armor" | "accessory" }) => {
        this.handleUnequipItem(client, message);
      }
    );

    this.onMessage(
      "buy_item",
      (client, message: { itemId: string; quantity: number }) => {
        this.handleBuyItem(client, message);
      }
    );

    this.onMessage("open_chest", (client, message: { chestItemId: string }) => {
      this.handleOpenChest(client, message);
    });

    this.onMessage("use_consumable", (client, message: { itemId: string }) => {
      this.handleUseConsumable(client, message);
    });

    // Pet messages
    this.onMessage(
      "adopt_pet",
      (client, message: { petId: string; name: string }) => {
        this.handleAdoptPet(client, message);
      }
    );

    this.onMessage("feed_pet", (client, message: { petIndex: number }) => {
      this.handleFeedPet(client, message);
    });

    this.onMessage("play_with_pet", (client, message: { petIndex: number }) => {
      this.handlePlayWithPet(client, message);
    });

    this.onMessage(
      "set_active_pet",
      (client, message: { petIndex: number }) => {
        this.handleSetActivePet(client, message);
      }
    );

    this.onMessage(
      "rename_pet",
      (client, message: { petIndex: number; name: string }) => {
        this.handleRenamePet(client, message);
      }
    );

    // Start game loop
    this.startGameLoop();

    // Spawn some initial trees
    this.spawnInitialTrees();

    console.log("✅ GardenRoom initialized at 60 FPS");
  }

  onJoin(client: Client, options: JoinOptions) {
    console.log(`🌱 Player ${client.sessionId} joined garden!`);

    // Clear empty room timeout when player joins
    if (this.emptyRoomTimeout) {
      clearTimeout(this.emptyRoomTimeout);
      this.emptyRoomTimeout = undefined;
      console.log("⏰ Empty room timeout cleared - player joined");
    }

    // Find spawn point
    const spawnPoint = this.findSpawnPoint();

    // Create player with unique ID using sessionId
    const player = new GardenPlayer();
    player.id = client.sessionId; // Use sessionId as unique player ID
    player.clientId = client.sessionId;
    player.nickname =
      options.nickname || `Gardener${this.state.players.length + 1}`;
    player.avatar = options.avatar || "🧑‍🌾";
    player.x = spawnPoint.x;
    player.y = 0.5; // Slightly above ground
    player.z = spawnPoint.z;
    player.direction = "down";
    player.currentAction = "idle";
    player.timestamp = Date.now();

    // Apply character stats from client
    player.characterClass = options.characterClass || "Farmer";
    if (options.stats) {
      player.level = options.stats.level ?? 1;
      player.exp = options.stats.exp ?? 0;
      player.expToNextLevel = options.stats.expToNextLevel ?? 100;
      player.hp = options.stats.hp ?? 120;
      player.maxHp = options.stats.maxHp ?? 120;
      player.mp = options.stats.mp ?? 30;
      player.maxMp = options.stats.maxMp ?? 30;
      player.atk = options.stats.atk ?? 85;
      player.def = options.stats.def ?? 75;
      player.agi = options.stats.agi ?? 90;
      player.wis = options.stats.wis ?? 60;
      player.gold = options.stats.gold ?? 100;
      player.mov = options.stats.mov ?? 2;
      player.rng = options.stats.rng ?? 1;
      player.highestClearedStage = options.stats.highestClearedStage ?? 0;
    }

    this.state.players.push(player);

    // Update metadata
    this.setMetadata({
      ...this.metadata,
      playerCount: this.state.players.length,
    });

    // Send spawn info to client
    client.send("player_spawned", {
      playerId: player.id,
      clientId: player.clientId,
      nickname: player.nickname,
      avatar: player.avatar,
      x: player.x,
      y: player.y,
      z: player.z,
    });

    // ✅ Sync inventory and pets to client on join
    this.sendInventoryUpdate(client, player);
    this.sendPetUpdate(client, player);

    // ✅ Give starter pet if player has no pets
    if (player.pets.length === 0) {
      this.giveStarterPet(client, player);
    }

    console.log(
      `✅ "${player.nickname}" ${player.avatar} spawned at (${player.x.toFixed(
        1
      )}, ${player.z.toFixed(1)})`
    );
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`👋 Player ${client.sessionId} left (consented: ${consented})`);

    const playerIndex = this.state.players.findIndex(
      (p) => p.clientId === client.sessionId
    );

    if (playerIndex !== -1) {
      const player = this.state.players[playerIndex];
      console.log(`🗑️ Removing "${player.nickname}" from garden`);

      this.state.players.splice(playerIndex, 1);

      this.setMetadata({
        ...this.metadata,
        playerCount: this.state.players.length,
      });

      this.broadcast("player_left", { clientId: client.sessionId });
    }

    // Start empty room timeout if no players left
    if (this.state.players.length === 0) {
      console.log(
        `⏰ Room empty - will dispose in ${
          EMPTY_ROOM_TIMEOUT / 1000
        }s if no one joins`
      );
      this.emptyRoomTimeout = setTimeout(() => {
        console.log("🔴 Empty room timeout reached - disposing room");
        this.disconnect();
      }, EMPTY_ROOM_TIMEOUT);
    }
  }

  onDispose() {
    console.log("🔴 GardenRoom disposing...");
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.emptyRoomTimeout) {
      clearTimeout(this.emptyRoomTimeout);
    }
  }

  /**
   * Start authoritative game loop
   */
  private startGameLoop() {
    const deltaTime = 1000 / SERVER_TICK_RATE;

    this.updateInterval = setInterval(() => {
      this.updateGameState(deltaTime);
    }, deltaTime);
  }

  /**
   * Handle player movement input
   */
  private handlePlayerInput(client: Client, input: PlayerInput) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );

    if (!player) return;

    player.lastProcessedInput = input.sequenceNumber;
    player.velocityX = this.clamp(input.velocityX, -1, 1);
    player.velocityZ = this.clamp(input.velocityZ, -1, 1);
    player.direction = input.direction || player.direction;
    player.isMoving = input.velocityX !== 0 || input.velocityZ !== 0;
    player.currentAction = player.isMoving ? "walk" : "idle";
  }

  /**
   * Handle planting
   */
  private handlePlant(client: Client, input: PlantInput) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );

    if (!player) return;

    // Validate position is within world bounds
    const halfSize = this.state.worldSize / 2;
    if (
      input.x < -halfSize ||
      input.x > halfSize ||
      input.z < -halfSize ||
      input.z > halfSize
    ) {
      client.send("plant_failed", { reason: "Out of bounds" });
      return;
    }

    // Check if something already exists at this location
    const key = `${Math.floor(input.x)}_${Math.floor(input.z)}`;
    if (this.state.plants.has(key)) {
      client.send("plant_failed", { reason: "Location occupied" });
      return;
    }

    // Create plant
    const plant = new PlantedItem();
    plant.id = `plant_${this.plantIdCounter++}`;
    plant.type = input.type;
    plant.x = input.x;
    plant.z = input.z;
    plant.growthStage = 0;
    plant.plantedAt = Date.now();
    plant.plantedBy = client.sessionId;

    this.state.plants.set(plant.id, plant);

    console.log(
      `🌱 ${player.nickname} planted ${input.type} at (${input.x}, ${input.z})`
    );

    this.broadcast("plant_added", {
      id: plant.id,
      type: plant.type,
      x: plant.x,
      z: plant.z,
      plantedBy: player.nickname,
    });
  }

  /**
   * Handle watering
   */
  private handleWater(client: Client, plantId: string) {
    const plant = this.state.plants.get(plantId);
    if (!plant) return;

    plant.wateredAt = Date.now();

    this.broadcast("plant_watered", { plantId });
  }

  /**
   * Handle harvesting
   */
  private handleHarvest(client: Client, plantId: string) {
    const plant = this.state.plants.get(plantId);
    if (!plant) return;

    // Only harvest mature plants
    if (plant.growthStage < 4) {
      client.send("harvest_failed", { reason: "Plant not mature yet" });
      return;
    }

    this.state.plants.delete(plantId);

    this.broadcast("plant_harvested", { plantId });
  }

  /**
   * Handle placing objects
   */
  private handlePlaceObject(client: Client, input: PlaceObjectInput) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );

    if (!player) return;

    const obj = new WorldObject();
    obj.id = `obj_${this.objectIdCounter++}`;
    obj.type = input.type;
    obj.x = input.x;
    obj.y = input.y;
    obj.z = input.z;
    obj.rotation = input.rotation || 0;
    obj.placedBy = client.sessionId;
    obj.timestamp = Date.now();

    this.state.objects.set(obj.id, obj);

    console.log(`🏗️ ${player.nickname} placed ${input.type}`);

    this.broadcast("object_placed", {
      id: obj.id,
      type: obj.type,
      x: obj.x,
      y: obj.y,
      z: obj.z,
      rotation: obj.rotation,
    });
  }

  /**
   * Handle removing objects
   */
  private handleRemoveObject(client: Client, objectId: string) {
    const obj = this.state.objects.get(objectId);
    if (!obj) return;

    // Only owner can remove
    if (obj.placedBy !== client.sessionId) {
      client.send("remove_failed", { reason: "Not your object" });
      return;
    }

    this.state.objects.delete(objectId);

    this.broadcast("object_removed", { objectId });
  }

  /**
   * Update game state each tick
   */
  private updateGameState(deltaTime: number) {
    const deltaSeconds = deltaTime / 1000;

    this.state.serverTick++;
    this.state.serverTime = Date.now();

    // Update day/night cycle (1 game hour = 1 real minute)
    this.state.dayTime = (this.state.dayTime + deltaSeconds / 60) % 24;

    // Update players
    this.state.players.forEach((player) => {
      this.updatePlayer(player, deltaSeconds);
    });

    // Update plant growth
    this.updatePlantGrowth();
  }

  /**
   * Update player position
   */
  private updatePlayer(player: GardenPlayer, deltaSeconds: number) {
    if (!player.isMoving) return;

    // Normalize velocity
    const length = Math.sqrt(
      player.velocityX * player.velocityX + player.velocityZ * player.velocityZ
    );

    if (length > 0) {
      const normalizedVx = player.velocityX / length;
      const normalizedVz = player.velocityZ / length;

      const newX = player.x + normalizedVx * PLAYER_SPEED * deltaSeconds;
      const newZ = player.z + normalizedVz * PLAYER_SPEED * deltaSeconds;

      // Keep within world bounds (expanded map)
      const halfSize = this.state.worldSize / 2 - 2;
      player.x = this.clamp(newX, -halfSize, halfSize);
      player.z = this.clamp(newZ, -halfSize, halfSize);
    }

    player.timestamp = Date.now();
  }

  /**
   * Update plant growth based on time
   */
  private updatePlantGrowth() {
    const now = Date.now();
    const growthTime = 30000; // 30 seconds per stage

    this.state.plants.forEach((plant) => {
      if (plant.growthStage >= 4) return; // Already mature

      const timeSincePlanted = now - plant.plantedAt;
      const newStage = Math.min(4, Math.floor(timeSincePlanted / growthTime));

      if (newStage > plant.growthStage) {
        plant.growthStage = newStage;
        this.broadcast("plant_grew", {
          plantId: plant.id,
          stage: plant.growthStage,
        });
      }
    });
  }

  /**
   * Spawn initial trees in the garden
   */
  private spawnInitialTrees() {
    const treePositions = [
      { x: -8, z: -8 },
      { x: -10, z: -5 },
      { x: 8, z: -10 },
      { x: 10, z: 10 },
      { x: -12, z: 5 },
      { x: 12, z: -3 },
    ];

    const treeTypes = ["tree_oak", "tree_pine", "tree_maple"];

    treePositions.forEach((pos, i) => {
      const plant = new PlantedItem();
      plant.id = `tree_${i}`;
      plant.type = treeTypes[i % treeTypes.length];
      plant.x = pos.x;
      plant.z = pos.z;
      plant.growthStage = 4; // Already mature
      plant.plantedAt = Date.now() - 300000; // Planted 5 min ago
      plant.plantedBy = "system";

      this.state.plants.set(plant.id, plant);
    });

    console.log(`🌳 Spawned ${treePositions.length} initial trees`);
  }

  /**
   * Find spawn point for new player
   */
  private findSpawnPoint(): { x: number; z: number } {
    // Spawn near center with some randomness
    const x = (Math.random() - 0.5) * 6;
    const z = (Math.random() - 0.5) * 6;
    return { x, z };
  }

  /**
   * Clamp value
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Handle stats update from client
   */
  private handleUpdateStats(
    client: Client,
    stats: Partial<JoinOptions["stats"]> | undefined
  ) {
    if (!stats) return;

    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    // Update player stats
    if (stats.level !== undefined) player.level = stats.level;
    if (stats.exp !== undefined) player.exp = stats.exp;
    if (stats.expToNextLevel !== undefined)
      player.expToNextLevel = stats.expToNextLevel;
    if (stats.hp !== undefined) player.hp = stats.hp;
    if (stats.maxHp !== undefined) player.maxHp = stats.maxHp;
    if (stats.mp !== undefined) player.mp = stats.mp;
    if (stats.maxMp !== undefined) player.maxMp = stats.maxMp;
    if (stats.atk !== undefined) player.atk = stats.atk;
    if (stats.def !== undefined) player.def = stats.def;
    if (stats.agi !== undefined) player.agi = stats.agi;
    if (stats.wis !== undefined) player.wis = stats.wis;
    if (stats.gold !== undefined) player.gold = stats.gold;
    if (stats.mov !== undefined) player.mov = stats.mov;
    if (stats.rng !== undefined) player.rng = stats.rng;
    if (stats.highestClearedStage !== undefined)
      player.highestClearedStage = stats.highestClearedStage;

    console.log(`📊 Stats updated for ${player.nickname}: Lv.${player.level}`);
  }

  /**
   * Handle battle victory message from client
   */
  private handleBattleVictory(
    client: Client,
    message: {
      stageId: number;
      stageName: string;
      rewards: { exp: number; gold: number };
      leveledUp: boolean;
      newLevel?: number;
    }
  ) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    // Update player stats based on rewards
    player.exp += message.rewards.exp;
    player.gold += message.rewards.gold;

    // Check for level up (simple calculation)
    const expToNextLevel = player.expToNextLevel;
    let didLevelUp = false;
    while (player.exp >= expToNextLevel && player.level < 99) {
      player.exp -= expToNextLevel;
      player.level += 1;
      player.expToNextLevel = Math.floor(100 * Math.pow(1.5, player.level - 1));
      didLevelUp = true;
    }

    // Update highest cleared stage
    if (message.stageId > player.highestClearedStage) {
      player.highestClearedStage = message.stageId;
    }

    console.log(
      `🏆 ${player.nickname} won ${message.stageName}! +${
        message.rewards.exp
      } EXP, +${message.rewards.gold} Gold${
        didLevelUp ? ` (Level Up! → Lv.${player.level})` : ""
      }`
    );

    // ✅ ส่ง stats ที่ update แล้วกลับไปให้ client sync ลง characterStore
    client.send("stats_synced", {
      level: player.level,
      exp: player.exp,
      expToNextLevel: player.expToNextLevel,
      gold: player.gold,
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp,
      maxMp: player.maxMp,
      atk: player.atk,
      def: player.def,
      agi: player.agi,
      wis: player.wis,
      mov: player.mov,
      rng: player.rng,
      highestClearedStage: player.highestClearedStage,
    });
  }

  // ============================================
  // Equipment & Inventory Handlers
  // ============================================

  /**
   * Handle equip item
   */
  private handleEquipItem(
    client: Client,
    message: { itemId: string; slot: "weapon" | "armor" | "accessory" }
  ) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    // Check if player has the item in inventory
    const invItem = player.inventory.find((i) => i.itemId === message.itemId);
    if (!invItem || invItem.quantity < 1) {
      client.send("error", { message: "ไม่มีไอเท็มนี้ในกระเป๋า" });
      return;
    }

    // Unequip current item if any
    const currentEquipped = player.equipment[message.slot];
    if (currentEquipped) {
      // Add back to inventory
      this.addItemToInventory(player, currentEquipped, 1);
    }

    // Equip new item
    player.equipment[message.slot] = message.itemId;

    // Remove from inventory
    this.removeItemFromInventory(player, message.itemId, 1);

    // Send update to client
    this.sendInventoryUpdate(client, player);

    console.log(
      `⚔️ ${player.nickname} equipped ${message.itemId} to ${message.slot}`
    );
  }

  /**
   * Handle unequip item
   */
  private handleUnequipItem(
    client: Client,
    message: { slot: "weapon" | "armor" | "accessory" }
  ) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    const currentEquipped = player.equipment[message.slot];
    if (!currentEquipped) {
      client.send("error", { message: "ไม่มีไอเท็มติดตั้งอยู่" });
      return;
    }

    // Add back to inventory
    this.addItemToInventory(player, currentEquipped, 1);

    // Clear equipment slot
    player.equipment[message.slot] = "";

    // Send update to client
    this.sendInventoryUpdate(client, player);

    console.log(`📤 ${player.nickname} unequipped from ${message.slot}`);
  }

  /**
   * Handle buy item from shop
   */
  private handleBuyItem(
    client: Client,
    message: { itemId: string; quantity: number }
  ) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    // Item prices - all buyable items
    const ITEM_PRICES: Record<string, number> = {
      // Chests
      chest_bronze: 100,
      chest_silver: 500,
      chest_gold: 2000,
      chest_legendary: 10000,
      // Potions
      potion_hp_small: 25,
      potion_hp_medium: 80,
      potion_hp_large: 200,
      potion_mp_small: 30,
      potion_mp_medium: 100,
      potion_stamina: 40,
      // Weapons
      weapon_wooden_sword: 50,
      weapon_iron_sword: 200,
      weapon_steel_sword: 800,
      weapon_magic_staff: 600,
      weapon_flame_sword: 2500,
      weapon_ice_staff: 2500,
      // Armor
      armor_cloth: 30,
      armor_leather: 150,
      armor_chainmail: 500,
      armor_plate: 1500,
      // Accessories
      acc_wooden_ring: 80,
      acc_power_ring: 400,
      acc_speed_boots: 600,
      acc_magic_amulet: 1000,
      // Seeds & Farming
      seed_carrot: 10,
      seed_tomato: 15,
      seed_corn: 20,
      seed_potato: 12,
      seed_strawberry: 25,
      seed_pumpkin: 30,
      fertilizer_basic: 50,
      fertilizer_super: 150,
      // Food & Drinks
      food_bread: 15,
      food_cheese: 25,
      food_meat: 50,
      food_fish: 40,
      food_salad: 30,
      drink_water: 5,
      drink_juice: 20,
      drink_milk: 15,
      // Tools
      tool_axe: 100,
      tool_pickaxe: 120,
      tool_fishing_rod: 80,
      tool_watering_can: 60,
      tool_hoe: 70,
      // Furniture
      furniture_chair: 150,
      furniture_table: 200,
      furniture_bed: 500,
      furniture_lamp: 80,
      furniture_bookshelf: 300,
      // Pets
      pet_cat: 500,
      pet_dog: 500,
      pet_rabbit: 300,
      pet_bird: 200,
      pet_fish: 100,
    };

    const price = ITEM_PRICES[message.itemId];
    if (!price) {
      client.send("error", { message: "ไอเท็มนี้ไม่สามารถซื้อได้" });
      return;
    }

    const totalCost = price * message.quantity;
    if (player.gold < totalCost) {
      client.send("error", { message: "Gold ไม่เพียงพอ" });
      return;
    }

    // Deduct gold
    player.gold -= totalCost;

    // Add item to inventory
    this.addItemToInventory(player, message.itemId, message.quantity);

    // Send update to client
    this.sendInventoryUpdate(client, player);

    console.log(
      `🛒 ${player.nickname} bought ${message.quantity}x ${message.itemId} for ${totalCost} gold`
    );
  }

  /**
   * Handle open treasure chest
   */
  private handleOpenChest(client: Client, message: { chestItemId: string }) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    // Check if player has the chest
    const chestItem = player.inventory.find(
      (i) => i.itemId === message.chestItemId
    );
    if (!chestItem || chestItem.quantity < 1) {
      client.send("error", { message: "ไม่มีหีบสมบัตินี้ในกระเป๋า" });
      return;
    }

    // Chest drop tables (simplified)
    const CHEST_DROPS: Record<
      string,
      { itemId: string; chance: number; min: number; max: number }[]
    > = {
      chest_bronze: [
        { itemId: "weapon_wooden_sword", chance: 20, min: 1, max: 1 },
        { itemId: "weapon_iron_sword", chance: 10, min: 1, max: 1 },
        { itemId: "armor_cloth", chance: 20, min: 1, max: 1 },
        { itemId: "armor_leather", chance: 10, min: 1, max: 1 },
        { itemId: "acc_wooden_ring", chance: 15, min: 1, max: 1 },
        { itemId: "potion_hp_small", chance: 50, min: 1, max: 3 },
        { itemId: "mat_slime_gel", chance: 40, min: 2, max: 5 },
      ],
      chest_silver: [
        { itemId: "weapon_steel_sword", chance: 15, min: 1, max: 1 },
        { itemId: "weapon_magic_staff", chance: 15, min: 1, max: 1 },
        { itemId: "armor_chainmail", chance: 12, min: 1, max: 1 },
        { itemId: "acc_power_ring", chance: 10, min: 1, max: 1 },
        { itemId: "potion_hp_medium", chance: 40, min: 1, max: 3 },
      ],
      chest_gold: [
        { itemId: "weapon_flame_sword", chance: 10, min: 1, max: 1 },
        { itemId: "weapon_ice_staff", chance: 10, min: 1, max: 1 },
        { itemId: "armor_plate", chance: 8, min: 1, max: 1 },
        { itemId: "acc_speed_boots", chance: 8, min: 1, max: 1 },
        { itemId: "weapon_thunder_blade", chance: 3, min: 1, max: 1 },
      ],
      chest_legendary: [
        { itemId: "weapon_thunder_blade", chance: 20, min: 1, max: 1 },
        { itemId: "armor_dragon_scale", chance: 15, min: 1, max: 1 },
        { itemId: "acc_dragon_amulet", chance: 15, min: 1, max: 1 },
        { itemId: "weapon_excalibur", chance: 5, min: 1, max: 1 },
      ],
    };

    const drops = CHEST_DROPS[message.chestItemId];
    if (!drops) {
      client.send("error", { message: "ไม่ใช่หีบสมบัติ" });
      return;
    }

    // Remove chest from inventory
    this.removeItemFromInventory(player, message.chestItemId, 1);

    // Roll for drops
    const obtainedItems: { itemId: string; quantity: number }[] = [];
    for (const drop of drops) {
      const roll = Math.random() * 100;
      if (roll < drop.chance) {
        const quantity =
          Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
        this.addItemToInventory(player, drop.itemId, quantity);
        obtainedItems.push({ itemId: drop.itemId, quantity });
      }
    }

    // Guarantee at least one item
    if (obtainedItems.length === 0 && drops.length > 0) {
      const randomDrop = drops[Math.floor(Math.random() * drops.length)];
      this.addItemToInventory(player, randomDrop.itemId, 1);
      obtainedItems.push({ itemId: randomDrop.itemId, quantity: 1 });
    }

    // Send results to client
    client.send("chest_opened", { items: obtainedItems });
    this.sendInventoryUpdate(client, player);

    console.log(
      `📦 ${player.nickname} opened ${message.chestItemId}, got: ${obtainedItems
        .map((i) => `${i.quantity}x ${i.itemId}`)
        .join(", ")}`
    );
  }

  /**
   * Handle use consumable item
   */
  private handleUseConsumable(client: Client, message: { itemId: string }) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    // Check if player has the item
    const invItem = player.inventory.find((i) => i.itemId === message.itemId);
    if (!invItem || invItem.quantity < 1) {
      client.send("error", { message: "ไม่มีไอเท็มนี้ในกระเป๋า" });
      return;
    }

    // Consumable effects
    const CONSUMABLE_EFFECTS: Record<
      string,
      { type: "heal_hp" | "heal_mp"; value: number }
    > = {
      potion_hp_small: { type: "heal_hp", value: 50 },
      potion_hp_medium: { type: "heal_hp", value: 150 },
      potion_mp_small: { type: "heal_mp", value: 30 },
    };

    const effect = CONSUMABLE_EFFECTS[message.itemId];
    if (!effect) {
      client.send("error", { message: "ไม่ใช่ไอเท็มที่ใช้ได้" });
      return;
    }

    // Apply effect
    if (effect.type === "heal_hp") {
      player.hp = Math.min(player.hp + effect.value, player.maxHp);
    } else if (effect.type === "heal_mp") {
      player.mp = Math.min(player.mp + effect.value, player.maxMp);
    }

    // Remove item from inventory
    this.removeItemFromInventory(player, message.itemId, 1);

    // Send update
    client.send("consumable_used", {
      itemId: message.itemId,
      effect,
      newHp: player.hp,
      newMp: player.mp,
    });
    this.sendInventoryUpdate(client, player);

    console.log(
      `💊 ${player.nickname} used ${message.itemId} (${effect.type}: +${effect.value})`
    );
  }

  // ============================================
  // Inventory Helper Methods
  // ============================================

  private addItemToInventory(
    player: GardenPlayer,
    itemId: string,
    quantity: number
  ) {
    const existing = player.inventory.find((i) => i.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      const newItem = new InventoryItemSchema();
      newItem.itemId = itemId;
      newItem.quantity = quantity;
      player.inventory.push(newItem);
    }
  }

  private removeItemFromInventory(
    player: GardenPlayer,
    itemId: string,
    quantity: number
  ) {
    const existing = player.inventory.find((i) => i.itemId === itemId);
    if (existing) {
      existing.quantity -= quantity;
      if (existing.quantity <= 0) {
        const index = player.inventory.indexOf(existing);
        player.inventory.splice(index, 1);
      }
    }
  }

  private sendInventoryUpdate(client: Client, player: GardenPlayer) {
    // Convert inventory to plain object array
    const inventory = player.inventory.map((i) => ({
      itemId: i.itemId,
      quantity: i.quantity,
    }));

    // Send full inventory sync
    client.send("inventory_synced", {
      inventory,
      equipment: {
        weapon: player.equipment.weapon || null,
        armor: player.equipment.armor || null,
        accessory: player.equipment.accessory || null,
      },
      gold: player.gold,
    });
  }

  // ============================================
  // Pet System Methods
  // ============================================

  /**
   * Handle adopt pet - ซื้อ pet จาก inventory แล้วเพิ่มเป็นสัตว์เลี้ยง
   */
  private handleAdoptPet(
    client: Client,
    message: { petId: string; name: string }
  ) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    // Check if player has pet item in inventory
    const petItem = player.inventory.find((i) => i.itemId === message.petId);
    if (!petItem || petItem.quantity < 1) {
      client.send("error", { message: "ไม่มีสัตว์เลี้ยงนี้ในกระเป๋า" });
      return;
    }

    // Check max pets limit (5)
    if (player.pets.length >= 5) {
      client.send("error", { message: "คุณมีสัตว์เลี้ยงครบ 5 ตัวแล้ว" });
      return;
    }

    // Remove pet item from inventory
    this.removeItemFromInventory(player, message.petId, 1);

    // Create new pet
    const newPet = new PetSchema();
    newPet.petId = message.petId;
    newPet.name = message.name || this.getDefaultPetName(message.petId);
    newPet.happiness = 100;
    newPet.hunger = 100;
    newPet.energy = 100;
    newPet.level = 1;
    newPet.exp = 0;
    newPet.adoptedAt = Date.now();
    newPet.lastFedAt = Date.now();
    newPet.lastPlayedAt = Date.now();

    player.pets.push(newPet);

    // If first pet, set as active
    if (player.pets.length === 1) {
      player.activePetId = message.petId;
    }

    // Send update
    this.sendPetUpdate(client, player);
    this.sendInventoryUpdate(client, player);

    // Send success message
    client.send("pet_action_success", {
      action: "adopt",
      petName: newPet.name,
      message: `ยินดีต้อนรับ ${newPet.name} สู่ครอบครัว! 🎉🐾`,
    });

    console.log(
      `🐾 ${player.nickname} adopted ${newPet.name} (${message.petId})`
    );
  }

  /**
   * Handle feed pet - ให้อาหารสัตว์เลี้ยง
   */
  private handleFeedPet(client: Client, message: { petIndex: number }) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    const pet = player.pets[message.petIndex];
    if (!pet) {
      client.send("error", { message: "ไม่พบสัตว์เลี้ยง" });
      return;
    }

    // Check cooldown (10 seconds between feeds)
    const feedCooldown = 10 * 1000;
    if (Date.now() - pet.lastFedAt < feedCooldown) {
      const remaining = Math.ceil(
        (feedCooldown - (Date.now() - pet.lastFedAt)) / 1000
      );
      client.send("error", { message: `รออีก ${remaining} วินาที` });
      return;
    }

    // Check if player has food
    const foodItems = ["food_meat", "food_fish", "food_bread"];
    let foodUsed = null;
    for (const foodId of foodItems) {
      const food = player.inventory.find((i) => i.itemId === foodId);
      if (food && food.quantity > 0) {
        foodUsed = foodId;
        break;
      }
    }

    if (!foodUsed) {
      client.send("error", { message: "ไม่มีอาหารในกระเป๋า" });
      return;
    }

    // Remove food from inventory
    this.removeItemFromInventory(player, foodUsed, 1);

    // Update pet stats
    pet.hunger = Math.min(100, pet.hunger + 30);
    pet.happiness = Math.min(100, pet.happiness + 10);
    pet.lastFedAt = Date.now();

    // Give exp
    pet.exp += 5;
    this.checkPetLevelUp(pet);

    // Send update
    this.sendPetUpdate(client, player);
    this.sendInventoryUpdate(client, player);

    // Send success message
    client.send("pet_action_success", {
      action: "feed",
      petName: pet.name,
      message: `ให้อาหาร ${pet.name} แล้ว! 🍖`,
      stats: { hunger: pet.hunger, happiness: pet.happiness },
    });

    console.log(`🍖 ${player.nickname} fed ${pet.name}`);
  }

  /**
   * Handle play with pet - เล่นกับสัตว์เลี้ยง
   */
  private handlePlayWithPet(client: Client, message: { petIndex: number }) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    const pet = player.pets[message.petIndex];
    if (!pet) {
      client.send("error", { message: "ไม่พบสัตว์เลี้ยง" });
      return;
    }

    // Check cooldown (5 minutes)
    const cooldown = 5 * 60 * 1000;
    if (Date.now() - pet.lastPlayedAt < cooldown) {
      const remaining = Math.ceil(
        (cooldown - (Date.now() - pet.lastPlayedAt)) / 1000
      );
      client.send("error", { message: `รออีก ${remaining} วินาที` });
      return;
    }

    // Update pet stats
    pet.happiness = Math.min(100, pet.happiness + 20);
    pet.energy = Math.max(0, pet.energy - 10);
    pet.lastPlayedAt = Date.now();

    // Give exp
    pet.exp += 10;
    this.checkPetLevelUp(pet);

    // Send update
    this.sendPetUpdate(client, player);

    // Send success message
    client.send("pet_action_success", {
      action: "play",
      petName: pet.name,
      message: `เล่นกับ ${pet.name} แล้ว! 🎾 +10 EXP`,
      stats: { happiness: pet.happiness, energy: pet.energy, exp: pet.exp },
    });

    console.log(`🎾 ${player.nickname} played with ${pet.name}`);
  }

  /**
   * Handle set active pet - ตั้งสัตว์เลี้ยงที่ตามตัว
   */
  private handleSetActivePet(client: Client, message: { petIndex: number }) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    const pet = player.pets[message.petIndex];
    if (!pet) {
      client.send("error", { message: "ไม่พบสัตว์เลี้ยง" });
      return;
    }

    player.activePetId = pet.petId;

    // Send update
    this.sendPetUpdate(client, player);

    // Send success message
    client.send("pet_action_success", {
      action: "set_active",
      petName: pet.name,
      message: `ตั้ง ${pet.name} เป็นสัตว์เลี้ยงตามตัวแล้ว! ⭐`,
    });

    console.log(`🐾 ${player.nickname} set active pet: ${pet.name}`);
  }

  /**
   * Handle rename pet - เปลี่ยนชื่อสัตว์เลี้ยง
   */
  private handleRenamePet(
    client: Client,
    message: { petIndex: number; name: string }
  ) {
    const player = this.state.players.find(
      (p) => p.clientId === client.sessionId
    );
    if (!player) return;

    const pet = player.pets[message.petIndex];
    if (!pet) {
      client.send("error", { message: "ไม่พบสัตว์เลี้ยง" });
      return;
    }

    const oldName = pet.name;
    pet.name = message.name.slice(0, 20); // Max 20 chars

    // Send update
    this.sendPetUpdate(client, player);

    // Send success message
    client.send("pet_action_success", {
      action: "rename",
      petName: pet.name,
      message: `เปลี่ยนชื่อจาก ${oldName} เป็น ${pet.name} แล้ว! ✏️`,
    });

    console.log(`✏️ ${player.nickname} renamed pet: ${oldName} -> ${pet.name}`);
  }

  /**
   * Get default pet name based on type
   */
  private getDefaultPetName(petId: string): string {
    const names: Record<string, string> = {
      pet_cat: "มิ้วมิ้ว",
      pet_dog: "บั๊ดดี้",
      pet_rabbit: "บันนี่",
      pet_bird: "ทวีตี้",
      pet_fish: "นีโม่",
    };
    return names[petId] || "สัตว์เลี้ยง";
  }

  /**
   * Check pet level up
   */
  private checkPetLevelUp(pet: PetSchema) {
    const expRequired = pet.level * 50;
    if (pet.exp >= expRequired) {
      pet.exp -= expRequired;
      pet.level++;
      console.log(`🎉 Pet ${pet.name} leveled up to ${pet.level}!`);
    }
  }

  /**
   * Send pet update to client
   */
  private sendPetUpdate(client: Client, player: GardenPlayer) {
    const pets = player.pets.map((p) => ({
      petId: p.petId,
      name: p.name,
      happiness: p.happiness,
      hunger: p.hunger,
      energy: p.energy,
      level: p.level,
      exp: p.exp,
      adoptedAt: p.adoptedAt,
      lastFedAt: p.lastFedAt,
      lastPlayedAt: p.lastPlayedAt,
    }));

    client.send("pets_synced", {
      pets,
      activePetId: player.activePetId,
    });
  }

  /**
   * Give starter pet to new player
   */
  private giveStarterPet(client: Client, player: GardenPlayer) {
    // Random starter pet
    const starterPets = ["pet_cat", "pet_dog", "pet_rabbit"];
    const petId = starterPets[Math.floor(Math.random() * starterPets.length)];

    // Create new pet
    const newPet = new PetSchema();
    newPet.petId = petId;
    newPet.name = this.getDefaultPetName(petId);
    newPet.happiness = 100;
    newPet.hunger = 100;
    newPet.energy = 100;
    newPet.level = 1;
    newPet.exp = 0;
    newPet.adoptedAt = Date.now();
    newPet.lastFedAt = Date.now();
    newPet.lastPlayedAt = Date.now();

    player.pets.push(newPet);
    player.activePetId = petId;

    // Give some starter items too
    this.addItemToInventory(player, "food_bread", 5);
    this.addItemToInventory(player, "food_meat", 3);
    this.addItemToInventory(player, "potion_hp_small", 3);

    // Send updates
    this.sendPetUpdate(client, player);
    this.sendInventoryUpdate(client, player);

    console.log(
      `🎁 ${player.nickname} received starter pet: ${newPet.name} (${petId})`
    );
  }
}
