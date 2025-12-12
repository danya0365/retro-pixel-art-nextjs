"use client";

import { getItemById } from "@/src/domain/data/items";
import { gameClient } from "@/src/infrastructure/colyseus/GameClient";
import { useCharacterStore } from "@/src/presentation/stores/characterStore";
import { useState } from "react";

// Pet icons mapping
const PET_ICONS: Record<string, string> = {
  pet_cat: "🐱",
  pet_dog: "🐕",
  pet_rabbit: "🐰",
  pet_bird: "🐦",
  pet_fish: "🐠",
};

const PET_NAMES: Record<string, string> = {
  pet_cat: "แมว",
  pet_dog: "หมา",
  pet_rabbit: "กระต่าย",
  pet_bird: "นก",
  pet_fish: "ปลาทอง",
};

export function PetPanel() {
  const pets = useCharacterStore((state) => state.character.pets) || [];
  const activePetId =
    useCharacterStore((state) => state.character.activePetId) || "";
  const inventory =
    useCharacterStore((state) => state.character.inventory) || [];
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [selectedPetIndex, setSelectedPetIndex] = useState<number | null>(null);

  // Find pet items in inventory
  const petItems = inventory.filter((item) => item.itemId.startsWith("pet_"));

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm">
          🐾 สัตว์เลี้ยงของฉัน ({pets.length}/5)
        </h3>
        {petItems.length > 0 && (
          <button
            onClick={() => setShowAdoptModal(true)}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            + รับเลี้ยงใหม่
          </button>
        )}
      </div>

      {/* Pet List */}
      {pets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🐾</div>
          <p>ยังไม่มีสัตว์เลี้ยง</p>
          <p className="text-xs mt-1">
            {petItems.length > 0
              ? "คลิก 'รับเลี้ยงใหม่' เพื่อเริ่มต้น!"
              : "ซื้อสัตว์เลี้ยงที่ร้านค้าก่อนนะ!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pets.map((pet, index) => (
            <PetCard
              key={index}
              pet={pet}
              isActive={pet.petId === activePetId}
              isSelected={selectedPetIndex === index}
              onSelect={() =>
                setSelectedPetIndex(index === selectedPetIndex ? null : index)
              }
            />
          ))}
        </div>
      )}

      {/* Selected Pet Actions */}
      {selectedPetIndex !== null && pets[selectedPetIndex] && (
        <PetActions
          pet={pets[selectedPetIndex]}
          petIndex={selectedPetIndex}
          isActive={pets[selectedPetIndex].petId === activePetId}
          onClose={() => setSelectedPetIndex(null)}
        />
      )}

      {/* Adopt Modal */}
      {showAdoptModal && (
        <AdoptPetModal
          petItems={petItems}
          onClose={() => setShowAdoptModal(false)}
        />
      )}
    </div>
  );
}

// ============================================
// Pet Card Component
// ============================================

function PetCard({
  pet,
  isActive,
  isSelected,
  onSelect,
}: {
  pet: {
    petId: string;
    name: string;
    happiness: number;
    hunger: number;
    energy: number;
    level: number;
  };
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const icon = PET_ICONS[pet.petId] || "🐾";

  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 rounded border-2 text-left transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : isActive
          ? "border-yellow-400 bg-yellow-50"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">{pet.name}</span>
            {isActive && (
              <span className="text-xs bg-yellow-300 px-1 rounded">ตามตัว</span>
            )}
            <span className="text-xs text-gray-500">Lv.{pet.level}</span>
          </div>
          <div className="flex gap-2 mt-1 text-xs">
            <span title="ความสุข">😊 {pet.happiness}%</span>
            <span title="ความอิ่ม">🍖 {pet.hunger}%</span>
            <span title="พลังงาน">⚡ {pet.energy}%</span>
          </div>
        </div>
      </div>

      {/* Status Bars */}
      <div className="mt-2 space-y-1">
        <StatusBar label="😊" value={pet.happiness} color="bg-pink-400" />
        <StatusBar label="🍖" value={pet.hunger} color="bg-orange-400" />
        <StatusBar label="⚡" value={pet.energy} color="bg-yellow-400" />
      </div>
    </button>
  );
}

function StatusBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs w-4">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// Pet Actions Component
// ============================================

function PetActions({
  pet,
  petIndex,
  isActive,
  onClose,
}: {
  pet: {
    petId: string;
    name: string;
    happiness: number;
    hunger: number;
  };
  petIndex: number;
  isActive: boolean;
  onClose: () => void;
}) {
  const [newName, setNewName] = useState(pet.name);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleFeed = () => {
    gameClient.feedPet(petIndex);
  };

  const handlePlay = () => {
    gameClient.playWithPet(petIndex);
  };

  const handleSetActive = () => {
    gameClient.setActivePet(petIndex);
  };

  const handleRename = () => {
    if (newName.trim() && newName !== pet.name) {
      gameClient.renamePet(petIndex, newName.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{PET_ICONS[pet.petId] || "🐾"}</span>
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="px-2 py-0.5 border rounded text-sm"
              maxLength={20}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsRenaming(true)}
              className="font-bold hover:underline"
            >
              {pet.name} ✏️
            </button>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleFeed}
          className="py-2 text-sm bg-orange-100 hover:bg-orange-200 rounded flex flex-col items-center"
        >
          <span className="text-lg">🍖</span>
          <span className="text-xs">ให้อาหาร</span>
        </button>
        <button
          onClick={handlePlay}
          className="py-2 text-sm bg-pink-100 hover:bg-pink-200 rounded flex flex-col items-center"
        >
          <span className="text-lg">🎾</span>
          <span className="text-xs">เล่นด้วย</span>
        </button>
        {!isActive && (
          <button
            onClick={handleSetActive}
            className="py-2 text-sm bg-yellow-100 hover:bg-yellow-200 rounded flex flex-col items-center"
          >
            <span className="text-lg">⭐</span>
            <span className="text-xs">ตั้งตามตัว</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Adopt Pet Modal
// ============================================

function AdoptPetModal({
  petItems,
  onClose,
}: {
  petItems: { itemId: string; quantity: number }[];
  onClose: () => void;
}) {
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [petName, setPetName] = useState("");

  const handleAdopt = () => {
    if (!selectedPet) return;
    const defaultName = PET_NAMES[selectedPet] || "สัตว์เลี้ยง";
    gameClient.adoptPet(selectedPet, petName.trim() || defaultName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-80 max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">🐾 รับเลี้ยงสัตว์</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {petItems.map((item) => {
            const petInfo = getItemById(item.itemId);
            const icon = PET_ICONS[item.itemId] || "🐾";
            const name = PET_NAMES[item.itemId] || item.itemId;

            return (
              <button
                key={item.itemId}
                onClick={() => setSelectedPet(item.itemId)}
                className={`w-full p-3 rounded border-2 text-left flex items-center gap-3 ${
                  selectedPet === item.itemId
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="text-3xl">{icon}</span>
                <div className="flex-1">
                  <div className="font-bold">{name}</div>
                  <div className="text-xs text-gray-500">
                    {petInfo?.description || "สัตว์เลี้ยงน่ารัก"}
                  </div>
                </div>
                <div className="text-xs text-gray-400">x{item.quantity}</div>
              </button>
            );
          })}
        </div>

        {selectedPet && (
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">
              ตั้งชื่อสัตว์เลี้ยง
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder={PET_NAMES[selectedPet] || "ชื่อสัตว์เลี้ยง"}
              className="w-full px-3 py-2 border rounded"
              maxLength={20}
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleAdopt}
            disabled={!selectedPet}
            className={`flex-1 py-2 rounded ${
              selectedPet
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            รับเลี้ยง 🐾
          </button>
        </div>
      </div>
    </div>
  );
}
