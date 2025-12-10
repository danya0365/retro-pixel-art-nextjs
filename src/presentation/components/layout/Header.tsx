"use client";

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
import { ThemeToggle } from "../ui/ThemeToggle";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

function ToolbarButton({ icon, label, onClick, disabled }: ToolbarButtonProps) {
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

interface HeaderProps {
  onBack?: () => void;
  onForward?: () => void;
  onRefresh?: () => void;
  onHome?: () => void;
}

export function Header({ onBack, onForward, onRefresh, onHome }: HeaderProps) {
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
            onClick={onBack}
          />
          <ToolbarButton
            icon={<ArrowRight size={16} />}
            label="Forward"
            onClick={onForward}
          />
          <ToolbarButton icon={<X size={16} />} label="Stop" />
          <ToolbarButton
            icon={<RefreshCw size={16} />}
            label="Refresh"
            onClick={onRefresh}
          />
          <ToolbarButton
            icon={<Home size={16} />}
            label="Home"
            onClick={onHome}
          />
        </div>

        <div className="retro-toolbar-separator" />

        <div className="retro-toolbar-group">
          <ToolbarButton icon={<Search size={16} />} label="Search" />
          <ToolbarButton icon={<Star size={16} />} label="Favorites" />
          <ToolbarButton icon={<History size={16} />} label="History" />
          <ToolbarButton icon={<Mail size={16} />} label="Mail" />
          <ToolbarButton icon={<Printer size={16} />} label="Print" />
        </div>

        <div className="retro-toolbar-spacer" />

        <div className="retro-toolbar-group">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
