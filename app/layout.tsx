import { MainLayout } from "@/src/presentation/components/layout/MainLayout";
import { ThemeProvider } from "@/src/presentation/providers/ThemeProvider";
import type { Metadata } from "next";
import "../public/styles/index.css";

export const metadata: Metadata = {
  title: "Retro Pixel Garden - Open World Builder",
  description:
    "Build your own pixel art garden in this retro-styled open world game inspired by Stardew Valley",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <MainLayout
            title="Retro Pixel Garden - Microsoft Internet Explorer"
            address="http://retro-pixel-garden.local/"
          >
            {children}
          </MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
