"use client";

import { getItemById } from "@/src/domain/data/items";
import { RARITY_BG_COLORS, RARITY_COLORS } from "@/src/domain/types/item";
import { gameClient } from "@/src/infrastructure/colyseus/GameClient";
import { useCharacterStore } from "@/src/presentation/stores/characterStore";
import { useState } from "react";

// ============================================
// Shop Categories
// ============================================

interface ShopItem {
  itemId: string;
  price: number;
  stock?: number; // undefined = unlimited
}

interface ShopCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  items: ShopItem[];
}

const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: "weapons",
    name: "ร้านอาวุธ",
    icon: "⚔️",
    description: "อาวุธสำหรับต่อสู้กับมอนสเตอร์",
    items: [
      { itemId: "weapon_wooden_sword", price: 50 },
      { itemId: "weapon_iron_sword", price: 200 },
      { itemId: "weapon_steel_sword", price: 800 },
      { itemId: "weapon_magic_staff", price: 600 },
      { itemId: "weapon_flame_sword", price: 2500 },
      { itemId: "weapon_ice_staff", price: 2500 },
    ],
  },
  {
    id: "armor",
    name: "ร้านเกราะ",
    icon: "🛡️",
    description: "เกราะและชุดป้องกัน",
    items: [
      { itemId: "armor_cloth", price: 30 },
      { itemId: "armor_leather", price: 150 },
      { itemId: "armor_chainmail", price: 500 },
      { itemId: "armor_plate", price: 1500 },
    ],
  },
  {
    id: "accessories",
    name: "ร้านเครื่องประดับ",
    icon: "💍",
    description: "แหวน สร้อย และเครื่องประดับ",
    items: [
      { itemId: "acc_wooden_ring", price: 80 },
      { itemId: "acc_power_ring", price: 400 },
      { itemId: "acc_speed_boots", price: 600 },
      { itemId: "acc_magic_amulet", price: 1000 },
    ],
  },
  {
    id: "farming",
    name: "ร้านอุปกรณ์เกษตร",
    icon: "🌾",
    description: "เมล็ดพันธุ์ ปุ๋ย และอุปกรณ์ทำฟาร์ม",
    items: [
      { itemId: "seed_carrot", price: 10 },
      { itemId: "seed_tomato", price: 15 },
      { itemId: "seed_corn", price: 20 },
      { itemId: "seed_potato", price: 12 },
      { itemId: "seed_strawberry", price: 25 },
      { itemId: "seed_pumpkin", price: 30 },
      { itemId: "fertilizer_basic", price: 50 },
      { itemId: "fertilizer_super", price: 150 },
    ],
  },
  {
    id: "potions",
    name: "ร้านยา",
    icon: "🧪",
    description: "ยารักษาและยาเพิ่มพลัง",
    items: [
      { itemId: "potion_hp_small", price: 25 },
      { itemId: "potion_hp_medium", price: 80 },
      { itemId: "potion_hp_large", price: 200 },
      { itemId: "potion_mp_small", price: 30 },
      { itemId: "potion_mp_medium", price: 100 },
      { itemId: "potion_stamina", price: 40 },
    ],
  },
  {
    id: "food",
    name: "ร้านอาหาร",
    icon: "🍽️",
    description: "อาหารและเครื่องดื่ม",
    items: [
      { itemId: "food_bread", price: 15 },
      { itemId: "food_cheese", price: 25 },
      { itemId: "food_meat", price: 50 },
      { itemId: "food_fish", price: 40 },
      { itemId: "food_salad", price: 30 },
      { itemId: "drink_water", price: 5 },
      { itemId: "drink_juice", price: 20 },
      { itemId: "drink_milk", price: 15 },
    ],
  },
  {
    id: "tools",
    name: "ร้านเครื่องมือ",
    icon: "🔧",
    description: "เครื่องมือสำหรับงานต่างๆ",
    items: [
      { itemId: "tool_axe", price: 100 },
      { itemId: "tool_pickaxe", price: 120 },
      { itemId: "tool_fishing_rod", price: 80 },
      { itemId: "tool_watering_can", price: 60 },
      { itemId: "tool_hoe", price: 70 },
    ],
  },
  {
    id: "furniture",
    name: "ร้านเฟอร์นิเจอร์",
    icon: "🪑",
    description: "เฟอร์นิเจอร์ตกแต่งบ้าน",
    items: [
      { itemId: "furniture_chair", price: 150 },
      { itemId: "furniture_table", price: 200 },
      { itemId: "furniture_bed", price: 500 },
      { itemId: "furniture_lamp", price: 80 },
      { itemId: "furniture_bookshelf", price: 300 },
    ],
  },
  {
    id: "chests",
    name: "ร้านหีบสมบัติ",
    icon: "📦",
    description: "หีบสมบัติลุ้นรางวัล",
    items: [
      { itemId: "chest_bronze", price: 100 },
      { itemId: "chest_silver", price: 500 },
      { itemId: "chest_gold", price: 2000 },
      { itemId: "chest_legendary", price: 10000 },
    ],
  },
  {
    id: "pets",
    name: "ร้านสัตว์เลี้ยง",
    icon: "🐾",
    description: "สัตว์เลี้ยงน่ารัก",
    items: [
      { itemId: "pet_cat", price: 500 },
      { itemId: "pet_dog", price: 500 },
      { itemId: "pet_rabbit", price: 300 },
      { itemId: "pet_bird", price: 200 },
      { itemId: "pet_fish", price: 100 },
    ],
  },
];

export function ShopPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>("weapons");
  const gold = useCharacterStore((state) => state.character.gold);

  const currentCategory = SHOP_CATEGORIES.find(
    (c) => c.id === selectedCategory
  );

  return (
    <div className="flex gap-2 h-[400px]">
      {/* Left Sidebar - Shop Categories */}
      <div className="w-1/3 space-y-1 overflow-y-auto pr-1">
        <div className="text-xs font-bold text-gray-600 mb-2">🏪 ร้านค้า</div>
        {SHOP_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 transition-colors ${
              selectedCategory === category.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{category.name}</div>
              <div
                className={`text-xs truncate ${
                  selectedCategory === category.id
                    ? "text-blue-100"
                    : "text-gray-500"
                }`}
              >
                {category.items.length} รายการ
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Right Panel - Shop Items */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-2 bg-yellow-50 border border-yellow-300 rounded mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentCategory?.icon}</span>
            <div>
              <div className="font-bold">{currentCategory?.name}</div>
              <div className="text-xs text-gray-500">
                {currentCategory?.description}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">เงินของคุณ</div>
            <div className="text-yellow-600 font-bold text-lg">
              💰 {gold.toLocaleString()} G
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {currentCategory?.items.map((shopItem) => (
              <ShopItemCard
                key={shopItem.itemId}
                shopItem={shopItem}
                gold={gold}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Shop Item Card
// ============================================

function ShopItemCard({
  shopItem,
  gold,
}: {
  shopItem: ShopItem;
  gold: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const item = getItemById(shopItem.itemId);

  // Fallback for items not in master data
  const displayItem = item || {
    id: shopItem.itemId,
    name: shopItem.itemId
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    icon: "📦",
    description: "ไอเท็มไม่พบในระบบ",
    rarity: "common" as const,
    type: "material" as const,
  };

  const totalPrice = shopItem.price * quantity;
  const canAfford = gold >= totalPrice;

  const handleBuy = () => {
    gameClient.buyItem(shopItem.itemId, quantity);
    setQuantity(1);
  };

  return (
    <div
      className={`p-2 border rounded ${
        item ? RARITY_BG_COLORS[item.rarity] : "bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-2xl">{displayItem.icon}</span>
        <div className="flex-1 min-w-0">
          <div
            className={`font-bold text-sm truncate ${
              item ? RARITY_COLORS[item.rarity] : "text-gray-600"
            }`}
          >
            {displayItem.name}
          </div>
          <div className="text-xs text-gray-500 line-clamp-2">
            {displayItem.description}
          </div>
          <div className="text-xs text-yellow-600 font-bold mt-1">
            {shopItem.price.toLocaleString()} G / ชิ้น
          </div>
        </div>
      </div>

      {/* Purchase Controls */}
      <div className="flex items-center gap-1 mt-2">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm font-bold"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          max="99"
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Math.max(1, Math.min(99, parseInt(e.target.value) || 1))
            )
          }
          className="w-10 text-center text-xs border rounded py-0.5"
        />
        <button
          onClick={() => setQuantity((q) => Math.min(99, q + 1))}
          className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm font-bold"
        >
          +
        </button>
        <button
          onClick={handleBuy}
          disabled={!canAfford}
          className={`flex-1 py-1 text-xs rounded font-bold ${
            canAfford
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          ซื้อ {totalPrice.toLocaleString()} G
        </button>
      </div>
    </div>
  );
}
