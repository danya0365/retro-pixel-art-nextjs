"use client";

import { useLayoutContext } from "@/src/presentation/contexts/LayoutContext";
import {
  ArrowLeft,
  ArrowRight,
  History,
  Home,
  Mail,
  Printer,
  RefreshCw,
  Search,
  Star,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "../ui/ThemeToggle";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

function ToolbarButton({
  icon,
  label,
  onClick,
  disabled,
  hidden,
}: ToolbarButtonProps) {
  if (hidden) return null;

  return (
    <button
      className="retro-toolbar-button"
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <span className="retro-toolbar-icon">{icon}</span>
      <span className="retro-toolbar-label">{label}</span>
    </button>
  );
}

export function Header() {
  const router = useRouter();
  const { config } = useLayoutContext();
  const { toolbar } = config;
  return (
    <div className="retro-header">
      {/* Menu Bar */}
      <div className="retro-menubar">
        <button className="retro-menu-item">
          <span className="underline">F</span>ile
        </button>
        <button className="retro-menu-item">
          <span className="underline">E</span>dit
        </button>
        <button className="retro-menu-item">
          <span className="underline">V</span>iew
        </button>
        <button className="retro-menu-item">
          F<span className="underline">a</span>vorites
        </button>
        <button className="retro-menu-item">
          <span className="underline">T</span>ools
        </button>
        <button className="retro-menu-item">
          <span className="underline">H</span>elp
        </button>
      </div>

      {/* Toolbar */}
      <div className="retro-toolbar">
        <div className="retro-toolbar-group">
          <ToolbarButton
            icon={<ArrowLeft size={16} />}
            label="Back"
            onClick={toolbar.onBack || (() => router.back())}
            disabled={toolbar.disableBack}
            hidden={!toolbar.showBack}
          />
          <ToolbarButton
            icon={<ArrowRight size={16} />}
            label="Forward"
            onClick={toolbar.onForward || (() => window.history.forward())}
            disabled={toolbar.disableForward}
            hidden={!toolbar.showForward}
          />
          <ToolbarButton
            icon={<X size={16} />}
            label="Stop"
            onClick={toolbar.onStop || (() => window.stop())}
            hidden={!toolbar.showStop}
          />
          <ToolbarButton
            icon={<RefreshCw size={16} />}
            label="Refresh"
            onClick={toolbar.onRefresh || (() => router.refresh())}
            hidden={!toolbar.showRefresh}
          />
          <ToolbarButton
            icon={<Home size={16} />}
            label="Home"
            onClick={toolbar.onHome || (() => router.push("/"))}
            hidden={!toolbar.showHome}
          />
        </div>

        <div className="retro-toolbar-separator" />

        <div className="retro-toolbar-group">
          <ToolbarButton
            icon={<Search size={16} />}
            label="Search"
            onClick={toolbar.onSearch}
            hidden={!toolbar.showSearch}
          />
          <ToolbarButton
            icon={<Star size={16} />}
            label="Favorites"
            onClick={toolbar.onFavorites}
            hidden={!toolbar.showFavorites}
          />
          <ToolbarButton
            icon={<History size={16} />}
            label="History"
            onClick={toolbar.onHistory}
            hidden={!toolbar.showHistory}
          />
          <ToolbarButton
            icon={<Mail size={16} />}
            label="Mail"
            onClick={toolbar.onMail}
            hidden={!toolbar.showMail}
          />
          <ToolbarButton
            icon={<Printer size={16} />}
            label="Print"
            onClick={toolbar.onPrint || (() => window.print())}
            hidden={!toolbar.showPrint}
          />
        </div>

        <div className="retro-toolbar-spacer" />

        <div className="retro-toolbar-group">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
