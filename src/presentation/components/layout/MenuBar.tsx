"use client";

import {
  Bookmark,
  CheckSquare,
  Clipboard,
  Copy,
  FolderOpen,
  Globe,
  HelpCircle,
  Info,
  Printer,
  Redo,
  Save,
  Scissors,
  Settings,
  Star,
  Undo,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RetroDropdown, type MenuItem } from "../ui/RetroDropdown";
import { RetroAlert, RetroModal } from "../ui/RetroModal";

interface MenuBarProps {
  onPrint?: () => void;
}

export function MenuBar({ onPrint }: MenuBarProps) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "info" as "info" | "warning" | "error" | "question",
  });

  const showAlert = (
    title: string,
    message: string,
    icon: "info" | "warning" | "error" | "question" = "info"
  ) => {
    setAlertConfig({ title, message, icon });
    setAlertOpen(true);
  };

  const fileMenuItems: MenuItem[] = [
    {
      label: "New Window",
      icon: <FolderOpen size={14} />,
      shortcut: "Ctrl+N",
      onClick: () => window.open(window.location.href, "_blank"),
    },
    {
      label: "Open...",
      icon: <FolderOpen size={14} />,
      shortcut: "Ctrl+O",
      onClick: () =>
        showAlert("Open", "This feature opens a file dialog in IE5.", "info"),
    },
    { separator: true, label: "" },
    {
      label: "Save",
      icon: <Save size={14} />,
      shortcut: "Ctrl+S",
      onClick: () => showAlert("Save", "Page saved to your computer.", "info"),
    },
    {
      label: "Save As...",
      icon: <Save size={14} />,
      onClick: () =>
        showAlert("Save As", "Choose where to save this page.", "info"),
    },
    { separator: true, label: "" },
    {
      label: "Print...",
      icon: <Printer size={14} />,
      shortcut: "Ctrl+P",
      onClick: () => (onPrint ? onPrint() : window.print()),
    },
    { separator: true, label: "" },
    {
      label: "Close",
      icon: <X size={14} />,
      onClick: () => router.push("/"),
    },
  ];

  const editMenuItems: MenuItem[] = [
    {
      label: "Undo",
      icon: <Undo size={14} />,
      shortcut: "Ctrl+Z",
      disabled: true,
    },
    {
      label: "Redo",
      icon: <Redo size={14} />,
      shortcut: "Ctrl+Y",
      disabled: true,
    },
    { separator: true, label: "" },
    {
      label: "Cut",
      icon: <Scissors size={14} />,
      shortcut: "Ctrl+X",
      onClick: () => document.execCommand("cut"),
    },
    {
      label: "Copy",
      icon: <Copy size={14} />,
      shortcut: "Ctrl+C",
      onClick: () => document.execCommand("copy"),
    },
    {
      label: "Paste",
      icon: <Clipboard size={14} />,
      shortcut: "Ctrl+V",
      onClick: () =>
        navigator.clipboard
          .readText()
          .then((text) => {
            showAlert(
              "Paste",
              `Clipboard content: ${text.slice(0, 50)}...`,
              "info"
            );
          })
          .catch(() => {
            showAlert("Paste", "Unable to read clipboard.", "warning");
          }),
    },
    { separator: true, label: "" },
    {
      label: "Select All",
      icon: <CheckSquare size={14} />,
      shortcut: "Ctrl+A",
      onClick: () => document.execCommand("selectAll"),
    },
  ];

  const viewMenuItems: MenuItem[] = [
    {
      label: "Toolbars",
      icon: <Settings size={14} />,
      onClick: () =>
        showAlert("Toolbars", "Customize which toolbars are visible.", "info"),
    },
    {
      label: "Status Bar",
      icon: <CheckSquare size={14} />,
      onClick: () =>
        showAlert("Status Bar", "Toggle status bar visibility.", "info"),
    },
    { separator: true, label: "" },
    {
      label: "Stop",
      icon: <X size={14} />,
      shortcut: "Esc",
      onClick: () => window.stop(),
    },
    {
      label: "Refresh",
      icon: <Globe size={14} />,
      shortcut: "F5",
      onClick: () => router.refresh(),
    },
    { separator: true, label: "" },
    {
      label: "Text Size",
      onClick: () =>
        showAlert("Text Size", "Adjust the text size for this page.", "info"),
    },
    {
      label: "Source",
      onClick: () => setActiveModal("source"),
    },
    {
      label: "Full Screen",
      shortcut: "F11",
      onClick: () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      },
    },
  ];

  const favoritesMenuItems: MenuItem[] = [
    {
      label: "Add to Favorites...",
      icon: <Star size={14} />,
      shortcut: "Ctrl+D",
      onClick: () =>
        showAlert(
          "Add to Favorites",
          `"${document.title}" has been added to your Favorites.`,
          "info"
        ),
    },
    {
      label: "Organize Favorites...",
      icon: <Bookmark size={14} />,
      onClick: () => setActiveModal("favorites"),
    },
    { separator: true, label: "" },
    {
      label: "Retro Pixel Garden",
      icon: <Globe size={14} />,
      onClick: () => router.push("/"),
    },
    {
      label: "Play Game",
      icon: <Globe size={14} />,
      onClick: () => router.push("/game"),
    },
  ];

  const toolsMenuItems: MenuItem[] = [
    {
      label: "Internet Options...",
      icon: <Settings size={14} />,
      onClick: () => setActiveModal("options"),
    },
    { separator: true, label: "" },
    {
      label: "Windows Update",
      icon: <Globe size={14} />,
      disabled: true,
    },
    { separator: true, label: "" },
    {
      label: "Show Related Links",
      disabled: true,
    },
  ];

  const helpMenuItems: MenuItem[] = [
    {
      label: "Contents and Index",
      icon: <HelpCircle size={14} />,
      shortcut: "F1",
      onClick: () => setActiveModal("help"),
    },
    {
      label: "Tip of the Day",
      onClick: () => setActiveModal("tip"),
    },
    { separator: true, label: "" },
    {
      label: "Online Support",
      icon: <Globe size={14} />,
      onClick: () =>
        showAlert(
          "Online Support",
          "Visit our website for support and updates.",
          "info"
        ),
    },
    {
      label: "Send Feedback",
      onClick: () =>
        showAlert("Feedback", "Thank you for your feedback!", "info"),
    },
    { separator: true, label: "" },
    {
      label: "About Internet Explorer",
      icon: <Info size={14} />,
      onClick: () => setActiveModal("about"),
    },
  ];

  return (
    <>
      <div className="retro-menubar">
        <RetroDropdown
          trigger={
            <button className="retro-menu-item">
              <span className="underline">F</span>ile
            </button>
          }
          items={fileMenuItems}
        />
        <RetroDropdown
          trigger={
            <button className="retro-menu-item">
              <span className="underline">E</span>dit
            </button>
          }
          items={editMenuItems}
        />
        <RetroDropdown
          trigger={
            <button className="retro-menu-item">
              <span className="underline">V</span>iew
            </button>
          }
          items={viewMenuItems}
        />
        <RetroDropdown
          trigger={
            <button className="retro-menu-item">
              F<span className="underline">a</span>vorites
            </button>
          }
          items={favoritesMenuItems}
        />
        <RetroDropdown
          trigger={
            <button className="retro-menu-item">
              <span className="underline">T</span>ools
            </button>
          }
          items={toolsMenuItems}
        />
        <RetroDropdown
          trigger={
            <button className="retro-menu-item">
              <span className="underline">H</span>elp
            </button>
          }
          items={helpMenuItems}
        />
      </div>

      {/* Alert Dialog */}
      <RetroAlert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
      />

      {/* Help Modal */}
      <RetroModal
        isOpen={activeModal === "help"}
        onClose={() => setActiveModal(null)}
        title="Help Topics"
        icon={<HelpCircle size={14} />}
        width="450px"
        actions={
          <div className="flex gap-2 justify-end">
            <button
              className="retro-button px-6 py-1"
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="p-4">
          <div className="retro-inset p-3 bg-white dark:bg-[#1a1a1a] mb-4">
            <h3 className="font-bold mb-2 text-[var(--win98-button-text)]">
              📖 Help Topics
            </h3>
            <ul className="text-xs space-y-2 text-[var(--win98-button-text)]">
              <li className="cursor-pointer hover:text-blue-600">
                • Getting Started with Retro Pixel Garden
              </li>
              <li className="cursor-pointer hover:text-blue-600">
                • How to Build Your Garden
              </li>
              <li className="cursor-pointer hover:text-blue-600">
                • Multiplayer Guide
              </li>
              <li className="cursor-pointer hover:text-blue-600">
                • Keyboard Shortcuts
              </li>
              <li className="cursor-pointer hover:text-blue-600">
                • Troubleshooting
              </li>
            </ul>
          </div>
          <p className="text-xs text-[var(--win98-button-text)]">
            Press F1 at any time for context-sensitive help.
          </p>
        </div>
      </RetroModal>

      {/* About Modal */}
      <RetroModal
        isOpen={activeModal === "about"}
        onClose={() => setActiveModal(null)}
        title="About Internet Explorer"
        icon={<Info size={14} />}
        width="400px"
        actions={
          <div className="flex gap-2 justify-center">
            <button
              className="retro-button px-8 py-1"
              onClick={() => setActiveModal(null)}
            >
              OK
            </button>
          </div>
        }
      >
        <div className="p-4 text-center">
          <div className="text-4xl mb-4">🌐</div>
          <h2 className="font-bold text-lg mb-2 text-[var(--win98-button-text)]">
            Microsoft Internet Explorer 5
          </h2>
          <p className="text-xs text-[var(--win98-button-text)] mb-2">
            Version 5.0 (Retro Pixel Garden Edition)
          </p>
          <div className="retro-inset p-3 bg-white dark:bg-[#1a1a1a] text-left mb-4">
            <p className="text-xs text-[var(--win98-button-text)]">
              Product ID: RPG-2024-WIN98
              <br />
              © 2024 Retro Pixel Garden
              <br />
              Built with Next.js & React
            </p>
          </div>
          <p className="text-xs text-[var(--win98-button-text)]">
            Based on Windows 98 / Internet Explorer 5
          </p>
        </div>
      </RetroModal>

      {/* Tip of the Day Modal */}
      <RetroModal
        isOpen={activeModal === "tip"}
        onClose={() => setActiveModal(null)}
        title="💡 Tip of the Day"
        width="380px"
        actions={
          <div className="flex gap-2 justify-between items-center w-full">
            <label className="flex items-center gap-2 text-xs text-[var(--win98-button-text)]">
              <input type="checkbox" />
              Show tips at startup
            </label>
            <div className="flex gap-2">
              <button className="retro-button px-4 py-1">Next Tip</button>
              <button
                className="retro-button px-4 py-1"
                onClick={() => setActiveModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        }
      >
        <div className="p-4 flex gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <p className="text-sm text-[var(--win98-button-text)]">
              <strong>Did you know?</strong>
              <br />
              <br />
              You can press <strong>F5</strong> to refresh the page, or{" "}
              <strong>F11</strong> to enter full screen mode!
            </p>
          </div>
        </div>
      </RetroModal>

      {/* Favorites Modal */}
      <RetroModal
        isOpen={activeModal === "favorites"}
        onClose={() => setActiveModal(null)}
        title="Organize Favorites"
        icon={<Star size={14} />}
        width="400px"
        actions={
          <div className="flex gap-2 justify-end">
            <button
              className="retro-button px-6 py-1"
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="p-4">
          <div className="retro-inset p-2 bg-white dark:bg-[#1a1a1a] h-40 overflow-auto">
            <div className="flex items-center gap-2 p-1 hover:bg-[var(--win98-menu-highlight)] hover:text-white cursor-pointer">
              <Globe size={14} />
              <span className="text-xs">Retro Pixel Garden</span>
            </div>
            <div className="flex items-center gap-2 p-1 hover:bg-[var(--win98-menu-highlight)] hover:text-white cursor-pointer">
              <Globe size={14} />
              <span className="text-xs">Play Game</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="retro-button px-4 py-1 text-xs">
              Create Folder
            </button>
            <button className="retro-button px-4 py-1 text-xs">Rename</button>
            <button className="retro-button px-4 py-1 text-xs">Delete</button>
          </div>
        </div>
      </RetroModal>

      {/* Internet Options Modal */}
      <RetroModal
        isOpen={activeModal === "options"}
        onClose={() => setActiveModal(null)}
        title="Internet Options"
        icon={<Settings size={14} />}
        width="420px"
        actions={
          <div className="flex gap-2 justify-end">
            <button
              className="retro-button px-6 py-1"
              onClick={() => setActiveModal(null)}
            >
              OK
            </button>
            <button
              className="retro-button px-6 py-1"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </button>
            <button className="retro-button px-6 py-1">Apply</button>
          </div>
        }
      >
        <div className="p-2">
          {/* Tabs */}
          <div className="flex border-b border-[var(--win98-button-shadow)]">
            <button className="retro-button px-4 py-1 text-xs border-b-0 -mb-px bg-[var(--win98-window-bg)]">
              General
            </button>
            <button className="retro-button px-4 py-1 text-xs opacity-70">
              Security
            </button>
            <button className="retro-button px-4 py-1 text-xs opacity-70">
              Content
            </button>
            <button className="retro-button px-4 py-1 text-xs opacity-70">
              Advanced
            </button>
          </div>

          <div className="p-4">
            <div className="mb-4">
              <label className="block text-xs font-bold mb-2 text-[var(--win98-button-text)]">
                Home page
              </label>
              <div className="retro-inset p-2 bg-white dark:bg-[#1a1a1a]">
                <p className="text-xs text-[var(--win98-button-text)] mb-2">
                  You can change which page to use for your home page.
                </p>
                <input
                  type="text"
                  className="retro-input w-full"
                  defaultValue="http://localhost:3000/"
                />
                <div className="flex gap-2 mt-2">
                  <button className="retro-button px-3 py-0.5 text-xs">
                    Use Current
                  </button>
                  <button className="retro-button px-3 py-0.5 text-xs">
                    Use Default
                  </button>
                  <button className="retro-button px-3 py-0.5 text-xs">
                    Use Blank
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 text-[var(--win98-button-text)]">
                Temporary Internet files
              </label>
              <div className="retro-inset p-2 bg-white dark:bg-[#1a1a1a]">
                <p className="text-xs text-[var(--win98-button-text)]">
                  Pages you view on the Internet are stored in a special folder
                  for quick viewing later.
                </p>
                <div className="flex gap-2 mt-2">
                  <button className="retro-button px-3 py-0.5 text-xs">
                    Delete Files...
                  </button>
                  <button className="retro-button px-3 py-0.5 text-xs">
                    Settings...
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RetroModal>

      {/* View Source Modal */}
      <RetroModal
        isOpen={activeModal === "source"}
        onClose={() => setActiveModal(null)}
        title="View Source"
        width="500px"
        actions={
          <div className="flex gap-2 justify-end">
            <button
              className="retro-button px-6 py-1"
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="p-2">
          <div className="retro-inset bg-white dark:bg-[#1a1a1a] h-60 overflow-auto p-2">
            <pre className="text-xs font-mono text-[var(--win98-button-text)] whitespace-pre-wrap">
              {`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Retro Pixel Garden</title>
  <meta name="description" content="Build your pixel art garden">
</head>
<body>
  <!-- Retro Pixel Garden App -->
  <div id="root">
    <!-- React App renders here -->
  </div>
</body>
</html>`}
            </pre>
          </div>
        </div>
      </RetroModal>
    </>
  );
}
