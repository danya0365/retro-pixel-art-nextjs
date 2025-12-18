"use client";

import { useEffect, useRef, useState } from "react";

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  onClick?: () => void;
  submenu?: MenuItem[];
}

interface RetroDropdownProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
}

export function RetroDropdown({
  trigger,
  items,
  align = "left",
}: RetroDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className="retro-dropdown" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`retro-dropdown-menu ${
            align === "right" ? "retro-dropdown-right" : ""
          }`}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return <div key={index} className="retro-dropdown-separator" />;
            }

            return (
              <button
                key={index}
                className={`retro-dropdown-item ${
                  item.disabled ? "disabled" : ""
                }`}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
              >
                <span className="retro-dropdown-item-icon">{item.icon}</span>
                <span className="retro-dropdown-item-label">{item.label}</span>
                {item.shortcut && (
                  <span className="retro-dropdown-item-shortcut">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
