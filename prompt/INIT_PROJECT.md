ช่วยเขียน TODO สำหรับโปรเจค /Users/marosdeeuma/retro-pixel-art-nextjs

สร้างเกม open world builder

อารมณ์ของเกมเป็น retro pixel art โดยเริ่มต้น สวนเล็กๆ ที่มีต้นไม้ (เอาแรงบันดาลใจจากเกม Stardew Valley)

โดยทุกครั้งที่สร้าง page.tsx ต้องทำตาม rule ที่เขียนไว้ที่ /Users/marosdeeuma/retro-pixel-art-nextjs/prompt/CREATE_PAGE_PATTERN.md

โดยเราจะทำ phase 1 ด้วย game server โดย colyseus ที่ /Users/marosdeeuma/retro-pixel-art-nextjs/realtime-server

เก็บข้อมูลใน game server แบบ state (เราจะเก็บข้อมูลใน game server แบบ state แต่ไม่เก็บข้อมูลลง db รอต่อ phase 2)

จะวาด Canvas ให้ด้วย react-three และใช้ rapier physics

ต้องมีหน้า landing

ไม่ต้องมี login แต่ให้ทำระบบ สร้าง user เพื่อข้อมูลลง local ด้วย zustand persist ด้วย localforageปห

ไม่ต้องมี database ให้สามารถเล่นได้เลย เพราะจะเก็บข้อมูลใน game server แบบ state

เริ่มพัฒนาโปรเจคอันดับแรกเลย ต้องสร้างหน้า MainLayout พร้อม Header Footer และใส่ Theme Toggle เพื่อทำ dark mode

โดย MainLayout ให้ออกแบบ interface เหมือน RETRO PIXEL ART จำลอง Internet Explorer 5 Browser ตามรูป /Users/marosdeeuma/retro-pixel-art-nextjs/prompt/internet_explorer_5_on_windows_98.png

เราจะต่อ phase 2 เก็บข้อมูลลง db ด้วย supabase และมีระบบ login ด้วย supabase auth (ยังไม่รุ้ว่าจะทำตอนไหน อาจจะไม่ทำก็ได้)
