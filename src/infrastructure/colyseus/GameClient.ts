"use client";

import { Client, Room } from "colyseus.js";

// Colyseus server configuration
const COLYSEUS_SERVER_URL =
  process.env.NEXT_PUBLIC_COLYSEUS_URL || "ws://localhost:2567";
const COLYSEUS_HTTP_URL =
  process.env.NEXT_PUBLIC_COLYSEUS_HTTP_URL || "http://localhost:2567";

// Room info type from server
export interface RoomInfo {
  roomId: string;
  name: string;
  clients: number;
  maxClients: number;
  metadata: {
    worldName?: string;
    playerCount?: number;
  };
  locked: boolean;
  createdAt: string;
}

/**
 * Singleton Colyseus client for game connections
 */
class GameClientManager {
  private static instance: GameClientManager;
  private client: Client | null = null;
  private currentRoom: Room | null = null;
  private connectionPromise: Promise<Room> | null = null;
  private targetRoomId: string | null = null; // Track which room we're connecting to

  private constructor() {}

  static getInstance(): GameClientManager {
    if (!GameClientManager.instance) {
      GameClientManager.instance = new GameClientManager();
    }
    return GameClientManager.instance;
  }

  /**
   * Get or create Colyseus client
   */
  getClient(): Client {
    if (!this.client) {
      this.client = new Client(COLYSEUS_SERVER_URL);
    }
    return this.client;
  }

  /**
   * Fetch available rooms from server
   */
  async getAvailableRooms(
    roomName: string = "garden_room"
  ): Promise<RoomInfo[]> {
    try {
      const response = await fetch(
        `${COLYSEUS_HTTP_URL}/api/rooms/${roomName}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch available rooms:", error);
      return [];
    }
  }

  /**
   * Join or create a game room
   * Returns existing room or pending connection if already connecting
   */
  async joinOrCreateRoom(
    roomName: string = "garden_room",
    options: Record<string, unknown> = {}
  ): Promise<Room> {
    // Return existing room if already connected
    if (this.currentRoom) {
      console.log("Already connected to a room, returning existing room");
      return this.currentRoom;
    }

    // Return pending promise if already connecting
    if (this.connectionPromise) {
      console.log("Connection already in progress, waiting...");
      return this.connectionPromise;
    }

    // Create new connection promise
    this.connectionPromise = this.createConnection(roomName, options);

    try {
      return await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  /**
   * Join a specific room by roomId
   */
  async joinRoomById(
    roomId: string,
    options: Record<string, unknown> = {}
  ): Promise<Room> {
    // Return existing room if already connected to same room
    if (this.currentRoom && this.currentRoom.roomId === roomId) {
      console.log("Already connected to this room");
      return this.currentRoom;
    }

    // Return pending promise if already connecting to same room
    if (this.connectionPromise && this.targetRoomId === roomId) {
      console.log("Connection to this room already in progress, waiting...");
      return this.connectionPromise;
    }

    // Leave current room if connected to different room
    if (this.currentRoom) {
      await this.leaveRoom();
    }

    this.targetRoomId = roomId;
    this.connectionPromise = this.doJoinRoomById(roomId, options);

    try {
      return await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
      this.targetRoomId = null;
    }
  }

  private async doJoinRoomById(
    roomId: string,
    options: Record<string, unknown>
  ): Promise<Room> {
    try {
      const client = this.getClient();
      console.log(`Joining room by ID: ${roomId}...`);
      this.currentRoom = await client.joinById(roomId, options);
      console.log(`Connected to room: ${this.currentRoom.roomId}`);

      // Setup disconnect handler
      this.currentRoom.onLeave((code) => {
        console.log(`Left room with code: ${code}`);
        this.currentRoom = null;
      });

      return this.currentRoom;
    } catch (error) {
      console.error("Failed to join room:", error);
      throw error;
    }
  }

  /**
   * Create a new room
   */
  async createRoom(
    roomName: string = "garden_room",
    options: Record<string, unknown> = {}
  ): Promise<Room> {
    // Return existing room if already connected
    if (this.currentRoom) {
      console.log("Already connected to a room, returning existing room");
      return this.currentRoom;
    }

    // Return pending promise if already creating
    if (this.connectionPromise && this.targetRoomId === "__creating__") {
      console.log("Room creation already in progress, waiting...");
      return this.connectionPromise;
    }

    this.targetRoomId = "__creating__";
    this.connectionPromise = this.doCreateRoom(roomName, options);

    try {
      return await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
      this.targetRoomId = null;
    }
  }

  private async doCreateRoom(
    roomName: string,
    options: Record<string, unknown>
  ): Promise<Room> {
    try {
      const client = this.getClient();
      console.log(`Creating new room: ${roomName}...`);
      this.currentRoom = await client.create(roomName, options);
      console.log(`Created room: ${this.currentRoom.roomId}`);

      // Setup disconnect handler
      this.currentRoom.onLeave((code) => {
        console.log(`Left room with code: ${code}`);
        this.currentRoom = null;
      });

      return this.currentRoom;
    } catch (error) {
      console.error("Failed to create room:", error);
      throw error;
    }
  }

  /**
   * Internal method to create connection
   */
  private async createConnection(
    roomName: string,
    options: Record<string, unknown>
  ): Promise<Room> {
    try {
      const client = this.getClient();

      console.log(`Connecting to room: ${roomName}...`);
      this.currentRoom = await client.joinOrCreate(roomName, options);
      console.log(`Connected to room: ${this.currentRoom.roomId}`);

      // Setup disconnect handler
      this.currentRoom.onLeave((code) => {
        console.log(`Left room with code: ${code}`);
        this.currentRoom = null;
      });

      return this.currentRoom;
    } catch (error) {
      console.error("Failed to join room:", error);
      throw error;
    }
  }

  /**
   * Get current room
   */
  getCurrentRoom(): Room | null {
    return this.currentRoom;
  }

  /**
   * Leave current room
   */
  async leaveRoom(consented: boolean = true): Promise<void> {
    if (this.currentRoom) {
      await this.currentRoom.leave(consented);
      this.currentRoom = null;
    }
  }

  /**
   * Send message to room
   */
  sendMessage(type: string, message: unknown): void {
    if (!this.currentRoom) {
      console.warn("Not connected to any room");
      return;
    }
    this.currentRoom.send(type, message);
  }

  /**
   * Check if connected to a room
   */
  isConnected(): boolean {
    return this.currentRoom !== null;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.currentRoom) {
      this.currentRoom.leave();
      this.currentRoom = null;
    }
    this.client = null;
  }

  // ============================================
  // Battle & Character Sync Methods
  // ============================================

  /**
   * Sync full character data to server
   */
  syncCharacter(data: {
    username: string;
    characterClass: string;
    avatar: string;
    stats: {
      level: number;
      exp: number;
      expToNextLevel: number;
      hp: number;
      maxHp: number;
      mp: number;
      maxMp: number;
      atk: number;
      def: number;
      agi: number;
      wis: number;
      mov: number;
      rng: number;
      gold: number;
      highestClearedStage: number;
    };
  }): void {
    this.sendMessage("sync_character", data);
  }

  /**
   * Report battle victory to server
   */
  reportBattleVictory(data: {
    stageId: number;
    stageName: string;
    rewards: {
      exp: number;
      gold: number;
    };
    leveledUp: boolean;
    newLevel?: number;
  }): void {
    this.sendMessage("battle_victory", data);
  }

  /**
   * Update specific stats
   */
  updateStats(
    stats: Partial<{
      level: number;
      exp: number;
      expToNextLevel: number;
      hp: number;
      maxHp: number;
      mp: number;
      maxMp: number;
      atk: number;
      def: number;
      agi: number;
      wis: number;
      mov: number;
      rng: number;
      gold: number;
      highestClearedStage: number;
    }>
  ): void {
    this.sendMessage("update_stats", { stats });
  }

  /**
   * Listen for battle result sync confirmation
   */
  onBattleResultSynced(
    callback: (data: {
      success: boolean;
      stats: {
        level: number;
        exp: number;
        gold: number;
        highestClearedStage: number;
      };
    }) => void
  ): () => void {
    if (!this.currentRoom) {
      console.warn("Not connected to any room");
      return () => {};
    }

    this.currentRoom.onMessage("battle_result_synced", callback);
    return () => {
      // Cleanup would go here if needed
    };
  }

  /**
   * Listen for other players' battle results
   */
  onPlayerBattleResult(
    callback: (data: {
      playerId: string;
      username: string;
      stageName: string;
      rewards: { exp: number; gold: number };
      leveledUp: boolean;
      newLevel?: number;
    }) => void
  ): () => void {
    if (!this.currentRoom) {
      console.warn("Not connected to any room");
      return () => {};
    }

    this.currentRoom.onMessage("player_battle_result", callback);
    return () => {
      // Cleanup would go here if needed
    };
  }
}

// Export singleton instance
export const gameClient = GameClientManager.getInstance();

// Export types for room state listeners
export type RoomStateListener<T> = (state: T) => void;
export type RoomMessageListener<T> = (message: T) => void;
