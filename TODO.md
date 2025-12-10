# TODO: Retro Pixel Art - Open World Builder

> แรงบันดาลใจจากเกม Stardew Valley - สร้างสวนเล็กๆ ที่มีต้นไม้

---

## 🎯 Project Overview

**Tech Stack:**

- **Frontend:** Next.js (App Router) + TypeScript
- **3D Rendering:** React Three Fiber + Rapier Physics
- **Game Server:** Colyseus (realtime-server)
- **State Management:** Zustand + localforage (persist)
- **Styling:** Tailwind CSS
- **UI Theme:** Retro Pixel Art - Internet Explorer 5 Browser Style

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

## 🚀 Development Priority Order

### Sprint 1: Foundation (Current)

1. ✅ สร้าง TODO.md
2. ⏳ **สร้าง MainLayout (IE5 Browser style)**
3. ⏳ สร้าง Theme Provider + Theme Toggle
4. ⏳ สร้าง Retro UI Components (Button, Window, Input)

### Sprint 2: User & Landing

5. ⏳ สร้าง User Store (zustand + localforage)
6. ⏳ สร้าง Landing Page

### Sprint 3: Game Server

7. ⏳ Setup Colyseus Game Room
8. ⏳ สร้าง Game State Schemas
9. ⏳ สร้าง Game Client

### Sprint 4: Game World

10. ⏳ สร้าง Game Canvas (R3F + Rapier)
11. ⏳ สร้าง World Components (Ground, Trees)
12. ⏳ สร้าง Player Component + Controls

### Sprint 5: Polish

13. ⏳ Game UI Overlay
14. ⏳ Sound effects (optional)
15. ⏳ Performance optimization

### Sprint 6: Map Expansion & World Enhancement 🗺️

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
