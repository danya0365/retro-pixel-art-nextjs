"use client";

import { getItemById } from "@/src/domain/data/items";
import { gameClient } from "@/src/infrastructure/colyseus/GameClient";
import { useCharacterStore } from "@/src/presentation/stores/characterStore";
import { useState } from "react";

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

  const petItems = inventory.filter((item) => item.itemId.startsWith("pet_"));

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm">
          🐾 สัตว์เลี้ยงของฉัน ({pets.length}/5)
        </h3>
        {petItems.length > 0 && (
          <button
            onClick={() => setShowAdoptModal(true)}
            className="retro-button text-xs px-2 py-1"
          >
            + รับเลี้ยงใหม่
          </button>
        )}
      </div>

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

      {selectedPetIndex !== null && pets[selectedPetIndex] && (
        <PetActionsModal
          pet={pets[selectedPetIndex]}
          petIndex={selectedPetIndex}
          isActive={pets[selectedPetIndex].petId === activePetId}
          onClose={() => setSelectedPetIndex(null)}
        />
      )}

      {showAdoptModal && (
        <AdoptPetModal
          petItems={petItems}
          onClose={() => setShowAdoptModal(false)}
        />
      )}
    </div>
  );
}

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
      className={`w-full p-2 text-left transition-all retro-inset ${
        isSelected ? "bg-blue-100" : isActive ? "bg-yellow-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{pet.name}</span>
            {isActive && (
              <span className="text-xs bg-yellow-300 px-1 rounded">⭐</span>
            )}
            <span className="text-xs text-gray-500">Lv.{pet.level}</span>
          </div>
          <div className="flex gap-3 mt-1 text-xs">
            <span>😊{pet.happiness}%</span>
            <span>🍖{pet.hunger}%</span>
            <span>⚡{pet.energy}%</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function PetActionsModal({
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
    energy: number;
    level: number;
    exp: number;
  };
  petIndex: number;
  isActive: boolean;
  onClose: () => void;
}) {
  const [newName, setNewName] = useState(pet.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = (action: string, callback: () => void) => {
    setActionLoading(action);
    callback();
    setTimeout(() => setActionLoading(null), 500);
  };

  const handleFeed = () => handleAction("feed", () => gameClient.feedPet(petIndex));
  const handlePlay = () => handleAction("play", () => gameClient.playWithPet(petIndex));
  const handleSetActive = () => handleAction("active", () => gameClient.setActivePet(petIndex));

  const handleRename = () => {
    if (newName.trim() && newName !== pet.name) {
      gameClient.renamePet(petIndex, newName.trim());
    }
    setIsRenaming(false);
  };

  const icon = PET_ICONS[pet.petId] || "🐾";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="retro-window w-80 max-w-[90vw]">
        <div className="retro-window-titlebar">
          <span className="retro-window-title">
            {icon} {pet.name} - สัตว์เลี้ยง
          </span>
          <div className="retro-window-controls">
            <button className="retro-window-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="retro-window-content p-3">
          <div className="flex items-center gap-3 mb-3 p-2 retro-inset">
            <span className="text-4xl">{icon}</span>
            <div className="flex-1">
              {isRenaming ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === "Enter" && handleRename()}
                  className="retro-input w-full text-sm"
                  maxLength={20}
                  autoFocus
                />
              ) : (
                <>
                  <button
                    onClick={() => setIsRenaming(true)}
                    className="font-bold text-sm hover:underline"
                  >
                    {pet.name} ✏️
                  </button>
                  <div className="text-xs">
                    Lv.{pet.level} • EXP: {pet.exp}
                    {isActive && <span className="ml-2 text-yellow-700">⭐ ตามตัว</span>}
                  </div>
                </>
              )}
            </div>
          </div>

          <fieldset className="retro-fieldset mb-3">
            <legend>📊 สถานะ</legend>
            <div className="space-y-2 p-2">
              <Win98ProgressBar label="😊 ความสุข" value={pet.happiness} />
              <Win98ProgressBar label="🍖 ความอิ่ม" value={pet.hunger} />
              <Win98ProgressBar label="⚡ พลังงาน" value={pet.energy} />
            </div>
          </fieldset>

          <fieldset className="retro-fieldset mb-3">
            <legend>🎮 คำสั่ง</legend>
            <div className="grid grid-cols-2 gap-2 p-2">
              <button
                onClick={handleFeed}
                disabled={actionLoading === "feed"}
                className="retro-button flex flex-col items-center py-2"
              >
                <span className="text-xl">{actionLoading === "feed" ? "⏳" : "🍖"}</span>
                <span className="text-xs">ให้อาหาร</span>
              </button>
              <button
                onClick={handlePlay}
                disabled={actionLoading === "play"}
                className="retro-button flex flex-col items-center py-2"
              >
                <span className="text-xl">{actionLoading === "play" ? "⏳" : "🎾"}</span>
                <span className="text-xs">เล่นด้วย</span>
              </button>
              {!isActive && (
                <button
                  onClick={handleSetActive}
                  disabled={actionLoading === "active"}
                  className="retro-button flex flex-col items-center py-2 col-span-2"
                >
                  <span className="text-xl">{actionLoading === "active" ? "⏳" : "⭐"}</span>
                  <span className="text-xs">ตั้งตามตัว</span>
                </button>
              )}
            </div>
          </fieldset>

          <button onClick={onClose} className="retro-button w-full">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

function Win98ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="retro-inset h-4 p-0.5">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

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
      <div className="retro-window w-80 max-w-[90vw]">
        <div className="retro-window-titlebar">
          <span className="retro-window-title">🐾 รับเลี้ยงสัตว์</span>
          <div className="retro-window-controls">
            <button className="retro-window-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="retro-window-content p-3">
          <fieldset className="retro-fieldset mb-3">
            <legend>เลือกสัตว์เลี้ยง</legend>
            <div className="space-y-1 p-2 max-h-40 overflow-y-auto">
              {petItems.map((item) => {
                const petInfo = getItemById(item.itemId);
                const icon = PET_ICONS[item.itemId] || "🐾";
                const name = PET_NAMES[item.itemId] || item.itemId;

                return (
                  <button
                    key={item.itemId}
                    onClick={() => setSelectedPet(item.itemId)}
                    className={`w-full p-2 text-left retro-button ${
                      selectedPet === item.itemId ? "retro-button-active" : ""
                    }`}
                  >
                    <span className="text-xl mr-2">{icon}</span>
                    <span>{name}</span>
                    <span className="text-xs ml-2 text-gray-500">
                      x{item.quantity}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {selectedPet && (
            <fieldset className="retro-fieldset mb-3">
              <legend>ตั้งชื่อ</legend>
              <div className="p-2">
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder={PET_NAMES[selectedPet] || "ชื่อสัตว์เลี้ยง"}
                  className="retro-input w-full"
                  maxLength={20}
                />
              </div>
            </fieldset>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAdopt}
              disabled={!selectedPet}
              className="retro-button flex-1"
            >
              รับเลี้ยง 🐾
            </button>
            <button onClick={onClose} className="retro-button flex-1">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
