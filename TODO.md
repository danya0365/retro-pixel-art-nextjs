# TODO: Retro Pixel Garden - RPG Adventure

> แรงบันดาลใจจากเกม Stardew Valley + Dragon Quest Tact
> 🌾 ปลูกผัก + ⚔️ สู้มอนสเตอร์แบบ Grid Battle

---

## 🎯 Project Overview

**Tech Stack:**

- **Frontend:** Next.js (App Router) + TypeScript
- **3D Rendering:** React Three Fiber + Rapier Physics (Optional/Future)
- **Game Server:** Colyseus (realtime-server)
- **State Management:** Zustand + localforage (persist)
- **Styling:** Tailwind CSS
- **UI Theme:** Retro Pixel Art - Internet Explorer 5 Browser Style (Win98)

**Game Modes:**

- **Simple Mode (Primary):** Text-based UI ในสไตล์ Win98 - ทำงานได้ทุกอุปกรณ์
- **3D Mode (Future):** React Three Fiber สำหรับ visual experience

---

## 📋 Phase 1: Core Foundation (No Database)

### 1.1 🖼️ MainLayout - IE5 Browser Style

> ออกแบบ interface จำลอง Internet Explorer 5 Browser บน Windows 98

- [x] **สร้าง Theme Provider** (`src/presentation/providers/ThemeProvider.tsx`) ✅

  - [x] ติดตั้ง next-themes สำหรับ dark/light mode
  - [x] สร้าง ThemeProvider wrapper component

- [x] **สร้าง MainLayout Component** (`src/presentation/components/layout/MainLayout.tsx`) ✅

  - [x] IE5 Title Bar (พร้อมปุ่ม minimize, maximize, close)
  - [x] IE5 Menu Bar (File, Edit, View, Favorites, Tools, Help)
  - [x] IE5 Toolbar (Back, Forward, Stop, Refresh, Home, Search, Favorites, History, Mail, Print)
  - [x] IE5 Address Bar (พร้อม Go button และ Links dropdown)
  - [x] Main Content Area (สำหรับ children)
  - [x] IE5 Status Bar (พร้อม progress indicator)
  - [ ] Sidebar Navigation (เหมือน Wikipedia/Explorer sidebar)

- [x] **สร้าง Header Component** (`src/presentation/components/layout/Header.tsx`) ✅

  - [x] IE5 style toolbar buttons
  - [x] Theme Toggle button (Dark/Light mode)
  - [x] Pixel art icons

- [x] **สร้าง Footer Component** (`src/presentation/components/layout/Footer.tsx`) ✅

  - [x] IE5 Status Bar style
  - [x] Connection status indicator
  - [x] Internet zone indicator

- [x] **สร้าง Retro Pixel Art CSS/Styling** ✅
  - [x] Windows 98 color palette
  - [x] Pixel art borders (3D beveled edges)
  - [x] Retro fonts (MS Sans Serif style)
  - [x] Button styles (pressed/hover states)

### 1.2 👤 User System (Local Storage Only)

> ไม่ต้อง login - สร้าง user เก็บลง local ด้วย zustand persist

- [x] **สร้าง User Store** (`src/presentation/stores/userStore.ts`) ✅

  - [x] User interface: { id, nickname, avatar, createdAt }
  - [x] Zustand store with localforage persistence
  - [x] generateUserId() function
  - [x] createUser(), updateUser() actions

- [x] **สร้าง User Creation Flow** ✅
  - [x] First-time visitor detection
  - [x] Nickname input modal (retro style)
  - [x] Avatar selection (pixel art avatars)

### 1.3 🏠 Landing Page

> หน้าแรกต้อนรับผู้เล่น

- [x] **สร้าง Landing Page** (`app/page.tsx`) ✅

  - [x] View: `src/presentation/components/landing/LandingView.tsx`

- [x] **Landing Page Features** ✅
  - [x] Hero section (Pixel art banner)
  - [x] Game title "Retro Pixel Garden"
  - [x] "Start Game" button
  - [x] "Continue" button (if user exists)
  - [x] Credits/About section

### 1.4 🎮 Colyseus Game Server Setup

> realtime-server ที่ /Users/marosdeeuma/retro-pixel-art-nextjs/realtime-server

- [x] **สร้าง Game Room** (`realtime-server/src/rooms/GardenRoom.ts`) ✅

  - [x] Room state schema (Colyseus Schema)
  - [x] Player state (position, direction, nickname, avatar)
  - [x] World state (plants, objects)
  - [x] Sync mechanisms (plant, water, harvest, place/remove object)

- [x] **สร้าง Game State Schema** (`realtime-server/src/rooms/schema/GardenState.ts`) ✅

  - [x] GardenPlayer schema
  - [x] PlantedItem schema
  - [x] WorldObject schema
  - [x] GardenState (players, plants, objects, dayTime)

- [x] **สร้าง Game Client** (`src/infrastructure/colyseus/GameClient.ts`) ✅
  - [x] Colyseus.js client setup (singleton)
  - [x] Room connection management
  - [x] useGardenRoom hook for state sync

### 1.5 🌳 Game World (React Three + Rapier)

> สวนเล็กๆ แบบ Stardew Valley

- [x] **สร้าง Game Page** (`app/game/page.tsx`) ✅

  - [x] View: `src/presentation/components/game/GameView.tsx`

- [x] **สร้าง 3D Canvas Component** (`src/presentation/components/game/GameCanvas.tsx`) ✅

  - [x] React Three Fiber canvas setup
  - [x] Rapier physics world
  - [x] Camera controls (OrbitControls)
  - [x] Environment lighting

- [x] **สร้าง World Components** ✅

  - [x] Ground/Terrain (`src/presentation/components/game/world/Ground.tsx`)
  - [x] Grass patches
  - [x] Dirt path
  - [x] Pond (water)

- [x] **สร้าง Tree Component** (`src/presentation/components/game/world/Trees.tsx`) ✅

  - [x] Pixel art style trees (3 variants)
  - [x] Collision detection

- [x] **สร้าง Object Components** ✅

  - [x] Fence (`src/presentation/components/game/objects/Fence.tsx`)
  - [x] Bench (`src/presentation/components/game/objects/Bench.tsx`)
  - [x] StreetLamp (`src/presentation/components/game/objects/StreetLamp.tsx`)
  - [x] Flower (`src/presentation/components/game/objects/Flower.tsx`)
  - [x] PlantedCrop (`src/presentation/components/game/objects/PlantedCrop.tsx`)

- [x] **สร้าง Player Component** (`src/presentation/components/game/Player.tsx`) ✅

  - [x] Voxel-style character
  - [x] Movement controls (WASD/Arrow keys)
  - [x] Name tag + avatar emoji
  - [x] Collision detection (Rapier)
  - [x] Player-relative movement (W/S forward/backward, A/D rotate)
  - [x] Smooth rotation animation

- [x] **สร้าง Camera Controller** (`src/presentation/components/game/CameraController.tsx`) ✅

  - [x] Camera follows local player
  - [x] Smooth position interpolation
  - [x] Camera rotates behind player when moving
  - [x] Manual camera rotation with mouse (OrbitControls)

- [x] **สร้าง Hotbar System** (`src/presentation/stores/hotbarStore.ts`) ✅

  - [x] 9-slot hotbar with default items
  - [x] Keyboard shortcuts (1-9) for item selection
  - [x] Seeds, tools (watering can, hoe, axe, hand)
  - [x] Unified action system (E key)

- [x] **สร้าง Farming System** ✅

  - [x] Planting (E + seed selected)
  - [x] Watering (E + watering can)
  - [x] Harvesting (E + hand on mature plants)

- [x] **สร้าง Game UI Overlay** (`src/presentation/components/game/GameUI.tsx`) ✅
  - [x] Hotbar (9 slots)
  - [x] Inventory modal
  - [x] Settings modal
  - [x] Help modal
  - [x] Player stats (HP, stamina)
  - [x] Control hints

### 1.6 🔧 Utilities & Helpers

- [x] **Collision Detection** ✅ (handled by @react-three/rapier)

- [ ] **สร้าง Pixel Art Helpers** (Optional)
  - [ ] Sprite sheet loader
  - [ ] Color palette constants

### 1.7 🎮 Fun Game Features

- [x] **Day/Night Cycle Visual Effects** ✅

  - [x] Sky color changes based on dayTime
  - [x] Lighting intensity changes (sun position moves)
  - [x] Street lamps turn on at night
  - [x] Stars visible at night

- [x] **Particle Effects** ✅

  - [x] Green sparkles when planting
  - [x] Blue water droplets when watering
  - [x] Golden sparkles when harvesting

- [x] **Sound Effects** ✅ (`src/infrastructure/audio/soundService.ts`)

  - [x] Footsteps (alternating pitch)
  - [x] Planting sound (earth/digging + sparkle)
  - [x] Watering sound (splash + drips)
  - [x] Harvest sound (celebration arpeggio)
  - [x] Chicken cluck
  - [x] BGM (day/night/rain themes)

- [x] **NPC & Animals** ✅
  - [x] Chickens walking around (random movement, pecking, clucking)
  - [x] Butterflies flying (figure-8 pattern, wing flapping)

---

## 📁 Project Structure (Atomic Design + Clean Architecture)

```
retro-pixel-art-nextjs/
├── app/
│   ├── layout.tsx                    # Root layout with ThemeProvider
│   ├── page.tsx                      # Landing page
│   └── game/
│       └── page.tsx                  # Game page
├── src/
│   ├── domain/
│   │   └── types/
│   │       ├── user.ts               # User type definitions
│   │       ├── game.ts               # Game state types
│   │       └── world.ts              # World/Tile types
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx    # IE5 Browser layout
│   │   │   │   ├── Header.tsx        # IE5 Toolbar
│   │   │   │   ├── Footer.tsx        # IE5 Status bar
│   │   │   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   │   │   └── AddressBar.tsx    # IE5 Address bar
│   │   │   ├── landing/
│   │   │   │   └── LandingView.tsx
│   │   │   ├── game/
│   │   │   │   ├── GameView.tsx
│   │   │   │   ├── GameCanvas.tsx
│   │   │   │   ├── Player.tsx
│   │   │   │   ├── world/
│   │   │   │   │   ├── Ground.tsx
│   │   │   │   │   └── Terrain.tsx
│   │   │   │   └── objects/
│   │   │   │       ├── Tree.tsx
│   │   │   │       ├── Bush.tsx
│   │   │   │       └── Fence.tsx
│   │   │   └── ui/
│   │   │       ├── RetroButton.tsx   # Windows 98 style button
│   │   │       ├── RetroWindow.tsx   # Windows 98 style window
│   │   │       ├── RetroInput.tsx    # Retro input field
│   │   │       └── ThemeToggle.tsx   # Dark/Light toggle
│   │   ├── presenters/
│   │   │   ├── landing/
│   │   │   │   ├── LandingPresenter.ts
│   │   │   │   └── useLandingPresenter.ts
│   │   │   └── game/
│   │   │       ├── GamePresenter.ts
│   │   │       └── useGamePresenter.ts
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   └── stores/
│   │       ├── userStore.ts          # User state (zustand + localforage)
│   │       └── gameStore.ts          # Game UI state
│   └── infrastructure/
│       └── colyseus/
│           └── GameClient.ts         # Colyseus client
├── realtime-server/                   # Colyseus server (existing)
│   └── src/
│       ├── rooms/
│       │   └── GardenRoom.ts
│       └── schemas/
│           ├── PlayerSchema.ts
│           ├── WorldSchema.ts
│           └── index.ts
└── public/
    ├── sprites/                       # Pixel art sprites
    ├── textures/                      # Ground textures
    └── fonts/                         # Retro fonts
```

---

---

## 📋 Phase 2: Simple Mode RPG System 🎮

> โฟกัส Simple Mode เป็นหลัก - Text-based RPG แบบ Dragon Quest Tact

### 2.1 📺 Simple Mode Foundation

- [x] **สร้าง SimpleGameView** (`src/presentation/components/game/SimpleGameView.tsx`) ✅
  - [x] Mode toggle button (3D ↔ Simple)
  - [x] Farm grid 6x6 สำหรับปลูกผัก
  - [x] Inventory tab
  - [x] Players tab
  - [x] Activity log (terminal style)
  - [x] Quick actions (รดน้ำทั้งหมด, เก็บเกี่ยวทั้งหมด)

### 2.2 👤 Character Status System (RPG Style)

> เหมือน Dragon Quest Tact - status ตัวละครแบบ RPG

- [ ] **สร้าง Character Store** (`src/presentation/stores/characterStore.ts`)

  - [ ] Level, EXP, Next Level EXP
  - [ ] HP / Max HP
  - [ ] MP / Max MP (Mana สำหรับ skill)
  - [ ] STR (Strength) - พลังโจมตี
  - [ ] DEF (Defense) - พลังป้องกัน
  - [ ] AGI (Agility) - ความเร็ว/ลำดับการโจมตี
  - [ ] LUK (Luck) - โชค/critical rate
  - [ ] Equipment slots (Weapon, Armor, Accessory)

- [ ] **สร้าง CharacterPanel** (`src/presentation/components/game/CharacterPanel.tsx`)
  - [ ] Avatar + Name + Level
  - [ ] HP/MP bars
  - [ ] Stats display
  - [ ] Equipment display
  - [ ] EXP progress bar

### 2.3 ⚔️ Grid Battle System

> Turn-based tactical combat บน Grid เหมือน Dragon Quest Tact

- [ ] **สร้าง Battle Store** (`src/presentation/stores/battleStore.ts`)

  - [ ] Battle state (idle, in_battle, victory, defeat)
  - [ ] Turn order queue
  - [ ] Current turn (player/enemy)
  - [ ] Selected action (attack, skill, item, move)
  - [ ] Target selection

- [ ] **สร้าง BattleGrid** (`src/presentation/components/battle/BattleGrid.tsx`)

  - [ ] 8x8 tactical grid
  - [ ] Unit placement (player, allies, enemies)
  - [ ] Movement range highlight
  - [ ] Attack range highlight
  - [ ] Terrain effects (optional)

- [ ] **สร้าง BattleUI** (`src/presentation/components/battle/BattleUI.tsx`)

  - [ ] Action menu (Attack, Skill, Item, Move, Wait)
  - [ ] Turn order display
  - [ ] Battle log
  - [ ] Enemy HP bars

- [ ] **สร้าง Monster Database** (`src/domain/data/monsters.ts`)
  - [ ] Slime, Goblin, Skeleton (basic monsters)
  - [ ] Monster stats (HP, ATK, DEF, AGI)
  - [ ] Drop items
  - [ ] EXP reward

### 2.4 🗺️ World Map & Exploration

- [ ] **สร้าง WorldMap** (`src/presentation/components/game/WorldMap.tsx`)

  - [ ] Location nodes (Farm, Forest, Cave, Village)
  - [ ] Travel between locations
  - [ ] Random encounter rate
  - [ ] Location descriptions

- [ ] **สร้าง Location System**
  - [ ] Farm (ปลูกผัก, พักฟื้น HP)
  - [ ] Forest (หามอนสเตอร์, เก็บไม้)
  - [ ] Cave (มอนสเตอร์แข็งแกร่ง, หาแร่)
  - [ ] Village (ซื้อขายไอเทม, รับ quest)

### 2.5 🎒 Inventory & Items

- [ ] **ปรับปรุง Inventory System**

  - [ ] Item categories (Consumable, Equipment, Material, Key Item)
  - [ ] Item stacking
  - [ ] Use item in/out of battle
  - [ ] Sell items

- [ ] **สร้าง Item Database** (`src/domain/data/items.ts`)
  - [ ] Potions (HP/MP recovery)
  - [ ] Weapons (Sword, Axe, Staff)
  - [ ] Armor (Helmet, Chest, Boots)
  - [ ] Materials (Wood, Stone, Iron)

### 2.6 📜 Quest System

- [ ] **สร้าง Quest Store** (`src/presentation/stores/questStore.ts`)

  - [ ] Active quests
  - [ ] Completed quests
  - [ ] Quest objectives
  - [ ] Quest rewards

- [ ] **สร้าง QuestPanel** (`src/presentation/components/game/QuestPanel.tsx`)
  - [ ] Quest list
  - [ ] Quest details
  - [ ] Progress tracking

---

## 🚀 Development Priority Order

### Sprint 1-5: Foundation ✅ (Completed)

1. ✅ MainLayout (IE5 Browser style)
2. ✅ Theme Provider + Retro UI Components
3. ✅ User Store (zustand + localforage)
4. ✅ Landing Page
5. ✅ Colyseus Game Server
6. ✅ 3D Game World (React Three Fiber)
7. ✅ Farming System

### Sprint 6: Simple Mode RPG (Current) 🎮

8. ✅ Simple Mode UI (SimpleGameView)
9. ⏳ **Character Status System**
10. ⏳ **Grid Battle System**
11. ⏳ Monster Database

### Sprint 7: World & Content

12. ⏳ World Map & Locations
13. ⏳ Item Database
14. ⏳ Quest System

### Sprint 8: Polish & Balance

15. ⏳ Game balancing
16. ⏳ More monsters & items
17. ⏳ Sound effects for battle

### Future: 3D Integration

18. ⏳ 3D Battle visualization
19. ⏳ 3D World exploration
20. ⏳ Performance optimization

### Sprint 6 (Legacy): Map Expansion 🗺️

> ขยาย Map ให้ใหญ่ขึ้น เพิ่มความหลากหลาย ทำให้น่าสำรวจ

- [ ] **ขยาย Ground** (จาก 32 → 80 units)

  - [ ] ปรับ GROUND_SIZE constant
  - [ ] เพิ่ม grass patches จาก 50 → 200
  - [ ] เพิ่ม terrain variety (texture variatฟions)

- [ ] **เพิ่ม Zone System**

  - [ ] Farmland Zone (พื้นที่ปลูกผัก - ตรงกลาง)
  - [ ] Forest Zone (ป่าต้นไม้ - ด้านซ้าย)
  - [ ] Village Zone (หมู่บ้าน - ด้านขวา)
  - [ ] Lake Zone (ทะเลสาบ - ด้านบน)

- [ ] **เพิ่ม Decorations** (`src/presentation/components/game/objects/`)

  - [ ] Rock.tsx (หิน 3 ขนาด)
  - [ ] Bush.tsx (พุ่มไม้หลายสี)
  - [ ] Log.tsx (ท่อนไม้/ตอไม้)
  - [ ] Haystack.tsx (กองฟาง)
  - [ ] Barrel.tsx (ถัง)
  - [ ] Crate.tsx (ลังไม้)

- [ ] **ปรับปรุง Paths**

  - [ ] Main road เชื่อม zones
  - [ ] Cobblestone path ในหมู่บ้าน
  - [ ] Dirt path ในฟาร์ม
  - [ ] Forest trail ในป่า

- [ ] **เพิ่ม Buildings** (`src/presentation/components/game/buildings/`)

  - [ ] Barn.tsx (โรงนา)
  - [ ] Well.tsx (บ่อน้ำ)
  - [ ] Bridge.tsx (สะพานข้ามน้ำ)
  - [ ] Windmill.tsx (กังหันลม)
  - [ ] SmallHouse.tsx (บ้านเล็ก)

- [ ] **ปรับปรุง Water Features**

  - [ ] ขยาย Pond เป็น Lake
  - [ ] เพิ่ม River (แม่น้ำ)
  - [ ] เพิ่ม Waterfall effects

- [ ] **เพิ่ม Trees variety**

  - [ ] Oak Tree, Pine Tree, Cherry Blossom
  - [ ] Dead Tree (ต้นไม้แห้ง)
  - [ ] Apple Tree (เก็บผลไม้ได้)

- [ ] **อัพเดท GameCanvas**
  - [ ] ใช้ Zone system จัด layout
  - [ ] ปรับ camera far distance
  - [ ] ปรับ Grid size

---

## 📝 Notes

### Pattern Rules

- ทุก page.tsx ต้องตาม `/prompt/CREATE_PAGE_PATTERN.md`
- ใช้ Clean Architecture + SOLID principles
- ใช้ Atomic Design structure

### Phase 2 (Future)

- เก็บข้อมูลลง Supabase database
- ระบบ login ด้วย Supabase Auth
- Cloud save/load

---

## 🎨 IE5 Browser Design Reference

จากรูป `/prompt/internet_explorer_5_on_windows_98.png`:

1. **Title Bar** (สีน้ำเงินเข้ม gradient)
   - Window title + minimize/maximize/close buttons
2. **Menu Bar** (พื้นหลังเทา)

   - File | Edit | View | Favorites | Tools | Help

3. **Toolbar** (icons + labels)

   - Back, Forward, Stop, Refresh, Home
   - Search, Favorites, History, Mail, Print

4. **Address Bar**

   - "Address" label + input field + Go button + Links dropdown

5. **Content Area**

   - Main page content
   - Optional sidebar (navigation)

6. **Status Bar**
   - "Done" status + Progress bar + Zone indicator (Internet)

---

_Last Updated: 2024_
