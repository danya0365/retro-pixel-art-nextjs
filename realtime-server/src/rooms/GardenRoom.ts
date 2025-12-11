import { Client, Room } from "@colyseus/core";
import {
  GardenPlayer,
  GardenState,
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

    if (message.leveledUp && message.newLevel) {
      player.level = message.newLevel;
    }

    // Update highest cleared stage
    if (message.stageId > player.highestClearedStage) {
      player.highestClearedStage = message.stageId;
    }

    console.log(
      `🏆 ${player.nickname} won ${message.stageName}! +${message.rewards.exp} EXP, +${message.rewards.gold} Gold`
    );
  }
}
