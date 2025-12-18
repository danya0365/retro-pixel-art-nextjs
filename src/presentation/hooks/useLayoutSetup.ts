"use client";

import {
  useLayoutConfig,
  type AddressBarConfig,
  type TitleBarConfig,
  type ToolbarConfig,
} from "@/src/presentation/contexts/LayoutContext";
import { useEffect } from "react";

interface LayoutSetupOptions {
  toolbar?: Partial<ToolbarConfig>;
  titleBar?: Partial<TitleBarConfig>;
  addressBar?: Partial<AddressBarConfig>;
  status?: string;
  connected?: boolean;
}

/**
 * Hook to configure layout for specific pages
 * Automatically resets to defaults when component unmounts
 */
export function useLayoutSetup(options: LayoutSetupOptions) {
  const { setConfig, resetConfig } = useLayoutConfig();

  useEffect(() => {
    setConfig({
      toolbar: options.toolbar,
      titleBar: options.titleBar,
      addressBar: options.addressBar,
      status: options.status,
      connected: options.connected,
    });

    // Reset to defaults when unmounting
    return () => {
      resetConfig();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - intentionally ignoring deps for initial setup

  // Return functions to update config dynamically
  return useLayoutConfig();
}

/**
 * Preset configurations for common page types
 */
export const layoutPresets = {
  // Landing page - minimal toolbar, hide some buttons
  landing: {
    toolbar: {
      showBack: false,
      showForward: false,
      showStop: false,
      showSearch: false,
      showFavorites: false,
      showHistory: false,
      showMail: false,
      showPrint: false,
    },
    titleBar: {
      showMinimize: false,
    },
  } satisfies LayoutSetupOptions,

  // Game page - show connection status, custom back behavior
  game: {
    toolbar: {
      showStop: false,
      showSearch: false,
      showFavorites: false,
      showHistory: false,
      showMail: false,
      showPrint: false,
    },
    status: "Loading...",
    connected: false,
  } satisfies LayoutSetupOptions,

  // Full toolbar - all features visible
  full: {
    toolbar: {
      showBack: true,
      showForward: true,
      showStop: true,
      showRefresh: true,
      showHome: true,
      showSearch: true,
      showFavorites: true,
      showHistory: true,
      showMail: true,
      showPrint: true,
    },
  } satisfies LayoutSetupOptions,
} as const;
