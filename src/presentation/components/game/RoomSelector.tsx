"use client";

import { gameClient, RoomInfo } from "@/src/infrastructure/colyseus/GameClient";
import { Loader2, Plus, RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface RoomSelectorProps {
  onSelectRoom: (roomId: string | null, createNew: boolean) => void;
}

export function RoomSelector({ onSelectRoom }: RoomSelectorProps) {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const availableRooms = await gameClient.getAvailableRooms("garden_room");
      setRooms(availableRooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="retro-window max-w-lg w-full">
      <div className="retro-window-titlebar">
        <span className="retro-window-title">🎮 เลือกห้องเกม</span>
      </div>
      <div className="retro-window-content p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[var(--win98-button-text)]">
            ห้องที่เปิดอยู่
          </h2>
          <button
            onClick={fetchRooms}
            disabled={isLoading}
            className="retro-button px-2 py-1 text-xs flex items-center gap-1"
          >
            <RefreshCw
              className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
            />
            รีเฟรช
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--win98-button-text)]" />
            <p className="text-xs text-[var(--win98-button-text)]">
              กำลังโหลดห้อง...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-4">
            <p className="text-xs text-red-600 mb-2">⚠️ {error}</p>
            <button
              onClick={fetchRooms}
              className="retro-button px-3 py-1 text-xs"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Room List */}
        {!isLoading && !error && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-[var(--win98-button-shadow)] rounded">
                <p className="text-xs text-[var(--win98-button-text)] mb-2">
                  ยังไม่มีห้องที่เปิดอยู่
                </p>
                <p className="text-xs text-[var(--win98-button-text)] opacity-70">
                  สร้างห้องใหม่เพื่อเริ่มเล่น!
                </p>
              </div>
            ) : (
              rooms.slice(0, 3).map((room, index) => (
                <button
                  key={room.roomId}
                  onClick={() => onSelectRoom(room.roomId, false)}
                  className="w-full retro-button p-3 text-left hover:bg-[var(--win98-button-face)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {index === 0 ? "🌻" : index === 1 ? "🌺" : "🌸"}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[var(--win98-button-text)]">
                          {room.metadata?.worldName || `ห้อง ${index + 1}`}
                        </p>
                        <p className="text-[10px] text-[var(--win98-button-text)] opacity-70">
                          สร้างเมื่อ: {formatDate(room.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--win98-button-text)]">
                      <Users className="w-3 h-3" />
                      <span>
                        {room.clients}/{room.maxClients}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Divider */}
        <div className="my-4 border-t border-[var(--win98-button-shadow)]" />

        {/* Create New Room Button */}
        <button
          onClick={() => onSelectRoom(null, true)}
          className="w-full retro-button p-3 flex items-center justify-center gap-2 bg-[var(--win98-highlight)] text-white hover:brightness-110"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-bold">สร้างห้องใหม่</span>
        </button>

        {/* Info */}
        <p className="mt-4 text-[10px] text-center text-[var(--win98-button-text)] opacity-70">
          💡 เลือกห้องที่มีอยู่เพื่อเล่นต่อ หรือสร้างห้องใหม่
        </p>
      </div>
    </div>
  );
}
