"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface ToolbarConfig {
  // Navigation buttons
  showBack?: boolean;
  showForward?: boolean;
  showStop?: boolean;
  showRefresh?: boolean;
  showHome?: boolean;

  // Feature buttons
  showSearch?: boolean;
  showFavorites?: boolean;
  showHistory?: boolean;
  showMail?: boolean;
  showPrint?: boolean;

  // Disabled states
  disableBack?: boolean;
  disableForward?: boolean;

  // Custom handlers (override defaults)
  onBack?: () => void;
  onForward?: () => void;
  onStop?: () => void;
  onRefresh?: () => void;
  onHome?: () => void;
  onSearch?: () => void;
  onFavorites?: () => void;
  onHistory?: () => void;
  onMail?: () => void;
  onPrint?: () => void;
}

export interface TitleBarConfig {
  showMinimize?: boolean;
  showMaximize?: boolean;
  showClose?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export interface AddressBarConfig {
  showAddressBar?: boolean;
  showGoButton?: boolean;
  showLinksButton?: boolean;
  onNavigate?: (url: string) => void;
  onLinksClick?: () => void;
}

export interface LayoutConfig {
  toolbar: ToolbarConfig;
  titleBar: TitleBarConfig;
  addressBar: AddressBarConfig;
  status?: string;
  connected?: boolean;
}

interface LayoutContextValue {
  config: LayoutConfig;
  setConfig: (config: Partial<LayoutConfig>) => void;
  setToolbarConfig: (config: Partial<ToolbarConfig>) => void;
  setTitleBarConfig: (config: Partial<TitleBarConfig>) => void;
  setAddressBarConfig: (config: Partial<AddressBarConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: LayoutConfig = {
  toolbar: {
    showBack: true,
    showForward: true,
    showStop: true,
    showRefresh: true,
    showHome: true,
    showSearch: true,
    showFavorites: true,
    showHistory: true,
    showMail: false, // Hide by default - not commonly used
    showPrint: true,
    disableBack: false,
    disableForward: false,
  },
  titleBar: {
    showMinimize: true,
    showMaximize: true,
    showClose: true,
  },
  addressBar: {
    showAddressBar: true,
    showGoButton: true,
    showLinksButton: false, // Hide by default - not commonly used
  },
  status: "Done",
  connected: false,
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<LayoutConfig>(defaultConfig);

  const setConfig = useCallback((newConfig: Partial<LayoutConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      ...newConfig,
      toolbar: { ...prev.toolbar, ...newConfig.toolbar },
      titleBar: { ...prev.titleBar, ...newConfig.titleBar },
      addressBar: { ...prev.addressBar, ...newConfig.addressBar },
    }));
  }, []);

  const setToolbarConfig = useCallback(
    (toolbarConfig: Partial<ToolbarConfig>) => {
      setConfigState((prev) => ({
        ...prev,
        toolbar: { ...prev.toolbar, ...toolbarConfig },
      }));
    },
    []
  );

  const setTitleBarConfig = useCallback(
    (titleBarConfig: Partial<TitleBarConfig>) => {
      setConfigState((prev) => ({
        ...prev,
        titleBar: { ...prev.titleBar, ...titleBarConfig },
      }));
    },
    []
  );

  const setAddressBarConfig = useCallback(
    (addressBarConfig: Partial<AddressBarConfig>) => {
      setConfigState((prev) => ({
        ...prev,
        addressBar: { ...prev.addressBar, ...addressBarConfig },
      }));
    },
    []
  );

  const resetConfig = useCallback(() => {
    setConfigState(defaultConfig);
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        config,
        setConfig,
        setToolbarConfig,
        setTitleBarConfig,
        setAddressBarConfig,
        resetConfig,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayoutContext must be used within a LayoutProvider");
  }
  return context;
}

export function useLayoutConfig() {
  const {
    config,
    setConfig,
    setToolbarConfig,
    setTitleBarConfig,
    setAddressBarConfig,
    resetConfig,
  } = useLayoutContext();
  return {
    config,
    setConfig,
    setToolbarConfig,
    setTitleBarConfig,
    setAddressBarConfig,
    resetConfig,
  };
}
