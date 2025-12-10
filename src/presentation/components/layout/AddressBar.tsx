"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface AddressBarProps {
  address?: string;
  onNavigate?: (address: string) => void;
}

export function AddressBar({
  address = "http://retro-pixel-garden.local/",
  onNavigate,
}: AddressBarProps) {
  const [inputValue, setInputValue] = useState(address);

  const handleGo = () => {
    if (onNavigate) {
      onNavigate(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGo();
    }
  };

  return (
    <div className="retro-addressbar">
      <div className="retro-addressbar-label">Address</div>
      <div className="retro-addressbar-input-wrapper">
        <div className="retro-addressbar-icon">
          <img
            src="/icons/page.png"
            alt=""
            width={16}
            height={16}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <input
          type="text"
          className="retro-addressbar-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="retro-addressbar-dropdown">
          <ChevronDown size={12} />
        </button>
      </div>
      <button className="retro-addressbar-go" onClick={handleGo}>
        <ChevronRight size={14} />
        <span>Go</span>
      </button>
      <button className="retro-addressbar-links">
        Links
        <ChevronRight size={12} />
      </button>
    </div>
  );
}
