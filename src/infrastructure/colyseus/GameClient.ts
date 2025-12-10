"use client";

import { Client, Room } from "colyseus.js";

// Colyseus server configuration
const COLYSEUS_SERVER_URL =
  process.env.NEXT_PUBLIC_COLYSEUS_URL || "ws://localhost:2567";

/**
 * Singleton Colyseus client for game connections
 */
class GameClientManager {
  private static instance: GameClientManager;
  private client: Client | null = null;
  private currentRoom: Room | null = null;
  private connectionPromise: Promise<Room> | null = null;

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
}

// Export singleton instance
export const gameClient = GameClientManager.getInstance();

// Export types for room state listeners
export type RoomStateListener<T> = (state: T) => void;
export type RoomMessageListener<T> = (message: T) => void;
