"use client";

import { useLayoutContext } from "@/src/presentation/contexts/LayoutContext";
import { ChevronDown, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AddressBarProps {
  address?: string;
}

export function AddressBar({
  address = "http://retro-pixel-garden.local/",
}: AddressBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { config } = useLayoutContext();
  const { addressBar } = config;

  // Update address bar based on current pathname
  const currentUrl = `http://retro-pixel-garden.local${pathname}`;
  const [inputValue, setInputValue] = useState(address);

  useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  const handleGo = () => {
    if (addressBar.onNavigate) {
      addressBar.onNavigate(inputValue);
    } else {
      // Default: try to navigate to the path
      try {
        const url = new URL(inputValue);
        router.push(url.pathname);
      } catch {
        // If not a valid URL, treat as path
        router.push(inputValue.startsWith("/") ? inputValue : `/${inputValue}`);
      }
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
      {addressBar.showGoButton !== false && (
        <button className="retro-addressbar-go" onClick={handleGo}>
          <ChevronRight size={14} />
          <span>Go</span>
        </button>
      )}
      {addressBar.showLinksButton && (
        <button
          className="retro-addressbar-links"
          onClick={addressBar.onLinksClick}
        >
          Links
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}
