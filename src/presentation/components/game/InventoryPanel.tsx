"use client";

import {
  getEquipmentSlot,
  getItemById,
  isEquipment,
} from "@/src/domain/data/items";
import type { Item } from "@/src/domain/types/item";
import { RARITY_BG_COLORS, RARITY_COLORS } from "@/src/domain/types/item";
import { gameClient } from "@/src/infrastructure/colyseus/GameClient";
import { useCharacterStore } from "@/src/presentation/stores/characterStore";
import { useState } from "react";

type TabType = "inventory" | "equipment" | "shop";

export function InventoryPanel() {
  const [activeTab, setActiveTab] = useState<TabType>("inventory");

  return (
    <div className="space-y-2">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-300 pb-1">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-3 py-1 text-xs ${
            activeTab === "inventory"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          🎒 กระเป๋า
        </button>
        <button
          onClick={() => setActiveTab("equipment")}
          className={`px-3 py-1 text-xs ${
            activeTab === "equipment"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          ⚔️ อุปกรณ์
        </button>
        <button
          onClick={() => setActiveTab("shop")}
          className={`px-3 py-1 text-xs ${
            activeTab === "shop"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          🏪 ร้านค้า
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "inventory" && <InventoryTab />}
      {activeTab === "equipment" && <EquipmentTab />}
      {activeTab === "shop" && <ShopTab />}
    </div>
  );
}

// ============================================
// Inventory Tab
// ============================================

function InventoryTab() {
  const inventory = useCharacterStore((state) => state.character.inventory);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleUseItem = (itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return;

    if (item.type === "consumable") {
      gameClient.useConsumable(itemId);
    } else if (item.type === "chest") {
      gameClient.openChest(itemId);
    } else if (isEquipment(item)) {
      const slot = getEquipmentSlot(item);
      if (slot) {
        gameClient.equipItem(itemId, slot);
      }
    }
    setSelectedItem(null);
  };

  if (inventory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🎒</div>
        <p>กระเป๋าว่างเปล่า</p>
        <p className="text-xs mt-1">ซื้อหีบสมบัติหรือไปล่ามอนสเตอร์!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Item Grid */}
      <div className="grid grid-cols-4 gap-1 max-h-[200px] overflow-y-auto p-1">
        {inventory.map((invItem) => {
          const item = getItemById(invItem.itemId);
          if (!item) return null;

          return (
            <button
              key={invItem.itemId}
              onClick={() => setSelectedItem(invItem.itemId)}
              className={`p-2 border rounded text-center ${
                selectedItem === invItem.itemId ? "ring-2 ring-blue-500" : ""
              } ${RARITY_BG_COLORS[item.rarity]}`}
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="text-[10px] truncate">{item.name}</div>
              <div className="text-xs font-bold">x{invItem.quantity}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Item Details */}
      {selectedItem && (
        <ItemDetails
          itemId={selectedItem}
          onUse={() => handleUseItem(selectedItem)}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

// ============================================
// Equipment Tab
// ============================================

function EquipmentTab() {
  const serverEquipment = useCharacterStore(
    (state) => state.character.serverEquipment
  );

  const handleUnequip = (slot: "weapon" | "armor" | "accessory") => {
    gameClient.unequipItem(slot);
  };

  const slots: {
    key: "weapon" | "armor" | "accessory";
    label: string;
    icon: string;
  }[] = [
    { key: "weapon", label: "อาวุธ", icon: "⚔️" },
    { key: "armor", label: "เกราะ", icon: "🛡️" },
    { key: "accessory", label: "เครื่องประดับ", icon: "💍" },
  ];

  return (
    <div className="space-y-2">
      {slots.map((slot) => {
        const equippedItemId = serverEquipment[slot.key];
        const item = equippedItemId ? getItemById(equippedItemId) : null;

        return (
          <div
            key={slot.key}
            className="flex items-center gap-2 p-2 border rounded bg-gray-50"
          >
            <div className="text-2xl w-10 text-center">{slot.icon}</div>
            <div className="flex-1">
              <div className="text-xs text-gray-500">{slot.label}</div>
              {item ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className={`text-sm font-bold ${
                      RARITY_COLORS[item.rarity]
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-400">- ว่าง -</div>
              )}
            </div>
            {item && (
              <button
                onClick={() => handleUnequip(slot.key)}
                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                ถอด
              </button>
            )}
          </div>
        );
      })}

      {/* Equipment Stats Preview */}
      <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
        <div className="text-xs font-bold text-blue-600 mb-1">
          โบนัสจากอุปกรณ์
        </div>
        <EquipmentStatsPreview />
      </div>
    </div>
  );
}

function EquipmentStatsPreview() {
  const serverEquipment = useCharacterStore(
    (state) => state.character.serverEquipment
  );

  // Calculate total bonuses from equipment
  const totalBonus = { atk: 0, def: 0, agi: 0, wis: 0, hp: 0, mp: 0 };

  Object.values(serverEquipment).forEach((itemId) => {
    if (!itemId) return;
    const item = getItemById(itemId);
    if (item && isEquipment(item)) {
      const bonus = item.statBonus;
      if (bonus.atk) totalBonus.atk += bonus.atk;
      if (bonus.def) totalBonus.def += bonus.def;
      if (bonus.agi) totalBonus.agi += bonus.agi;
      if (bonus.wis) totalBonus.wis += bonus.wis;
      if (bonus.hp) totalBonus.hp += bonus.hp;
      if (bonus.mp) totalBonus.mp += bonus.mp;
    }
  });

  const hasBonus = Object.values(totalBonus).some((v) => v > 0);

  if (!hasBonus) {
    return <div className="text-xs text-gray-400">ไม่มีอุปกรณ์</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-1 text-xs">
      {totalBonus.atk > 0 && (
        <div className="text-red-600">ATK +{totalBonus.atk}</div>
      )}
      {totalBonus.def > 0 && (
        <div className="text-blue-600">DEF +{totalBonus.def}</div>
      )}
      {totalBonus.agi > 0 && (
        <div className="text-green-600">AGI +{totalBonus.agi}</div>
      )}
      {totalBonus.wis > 0 && (
        <div className="text-purple-600">WIS +{totalBonus.wis}</div>
      )}
      {totalBonus.hp > 0 && (
        <div className="text-pink-600">HP +{totalBonus.hp}</div>
      )}
      {totalBonus.mp > 0 && (
        <div className="text-cyan-600">MP +{totalBonus.mp}</div>
      )}
    </div>
  );
}

// ============================================
// Shop Tab
// ============================================

const SHOP_ITEMS = [
  { itemId: "chest_bronze", price: 100 },
  { itemId: "chest_silver", price: 500 },
  { itemId: "chest_gold", price: 2000 },
  { itemId: "chest_legendary", price: 10000 },
  { itemId: "potion_hp_small", price: 25 },
  { itemId: "potion_hp_medium", price: 80 },
  { itemId: "potion_mp_small", price: 30 },
];

function ShopTab() {
  const gold = useCharacterStore((state) => state.character.gold);
  const [quantity, setQuantity] = useState<Record<string, number>>({});

  const handleBuy = (itemId: string) => {
    const qty = quantity[itemId] || 1;
    gameClient.buyItem(itemId, qty);
    setQuantity((prev) => ({ ...prev, [itemId]: 1 }));
  };

  return (
    <div className="space-y-2">
      {/* Gold Display */}
      <div className="flex justify-between items-center p-2 bg-yellow-50 border border-yellow-300 rounded">
        <span className="font-bold">💰 Gold</span>
        <span className="text-yellow-600 font-bold">
          {gold.toLocaleString()} G
        </span>
      </div>

      {/* Shop Items */}
      <div className="space-y-1 max-h-[250px] overflow-y-auto">
        {SHOP_ITEMS.map((shopItem) => {
          const item = getItemById(shopItem.itemId);
          if (!item) return null;

          const qty = quantity[shopItem.itemId] || 1;
          const totalPrice = shopItem.price * qty;
          const canAfford = gold >= totalPrice;

          return (
            <div
              key={shopItem.itemId}
              className={`flex items-center gap-2 p-2 border rounded ${
                RARITY_BG_COLORS[item.rarity]
              }`}
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="flex-1">
                <div
                  className={`text-sm font-bold ${RARITY_COLORS[item.rarity]}`}
                >
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">{item.description}</div>
                <div className="text-xs text-yellow-600 font-bold">
                  {shopItem.price.toLocaleString()} G
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={qty}
                  onChange={(e) =>
                    setQuantity((prev) => ({
                      ...prev,
                      [shopItem.itemId]: Math.max(
                        1,
                        parseInt(e.target.value) || 1
                      ),
                    }))
                  }
                  className="w-12 px-1 py-0.5 text-xs border rounded text-center"
                />
                <button
                  onClick={() => handleBuy(shopItem.itemId)}
                  disabled={!canAfford}
                  className={`px-2 py-1 text-xs rounded ${
                    canAfford
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  ซื้อ
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Item Details Modal
// ============================================

function ItemDetails({
  itemId,
  onUse,
  onClose,
}: {
  itemId: string;
  onUse: () => void;
  onClose: () => void;
}) {
  const item = getItemById(itemId);
  if (!item) return null;

  const getActionLabel = (item: Item) => {
    switch (item.type) {
      case "weapon":
      case "armor":
      case "accessory":
        return "สวมใส่";
      case "consumable":
        return "ใช้";
      case "chest":
        return "เปิด";
      default:
        return null;
    }
  };

  const actionLabel = getActionLabel(item);

  return (
    <div className={`p-3 border-2 rounded ${RARITY_BG_COLORS[item.rarity]}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{item.icon}</span>
          <div>
            <div className={`font-bold ${RARITY_COLORS[item.rarity]}`}>
              {item.name}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {item.rarity}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <p className="text-xs text-gray-600 mb-2">{item.description}</p>

      {/* Stats for equipment */}
      {isEquipment(item) && item.statBonus && (
        <div className="grid grid-cols-3 gap-1 text-xs mb-2 p-2 bg-white/50 rounded">
          {Object.entries(item.statBonus).map(([stat, value]) => (
            <div key={stat} className="text-green-600">
              {stat.toUpperCase()} +{value}
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      {actionLabel && (
        <button
          onClick={onUse}
          className="w-full py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
