import { useState, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import { Tab } from "./Tab";
import type { Tab as TabType } from "@/hooks/useTabs";
import { SettingsMenu } from "@/components/navigation/SettingsMenu";

interface TabBarProps {
  tabs: TabType[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onAddClick: () => void;
  onLogoClick?: () => void;
  onReorderTabs?: (fromIndex: number, toIndex: number) => void;
  isShowingNewTab?: boolean;
  shouldShowLogoSelected?: boolean;
}

export function TabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onAddClick,
  onLogoClick,
  onReorderTabs,
  isShowingNewTab = false,
  shouldShowLogoSelected = false,
}: TabBarProps) {
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastReorderTime = useRef<number>(0);

  // Check if there's a "new tab" tab open
  const hasNewTab = tabs.some((t) => t.type === "new-tab");

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedTabIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragEnd = () => {
    setDraggedTabIndex(null);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedTabIndex === null || !onReorderTabs) return;

    // Throttle reorders to prevent too rapid changes
    const now = Date.now();
    if (now - lastReorderTime.current < 150) return;

    const mouseX = e.clientX;

    // Find which tab the mouse is over based on position
    for (let i = 0; i < tabRefs.current.length; i++) {
      const tabEl = tabRefs.current[i];
      if (!tabEl || i === draggedTabIndex) continue;

      const rect = tabEl.getBoundingClientRect();
      const tabMidpoint = rect.left + rect.width / 2;

      // Check if mouse crossed the midpoint of this tab
      if (draggedTabIndex < i) {
        // Dragging right: reorder when mouse passes midpoint
        if (mouseX > tabMidpoint) {
          lastReorderTime.current = now;
          onReorderTabs(draggedTabIndex, i);
          setDraggedTabIndex(i);
          return;
        }
      } else {
        // Dragging left: reorder when mouse passes midpoint
        if (mouseX < tabMidpoint) {
          lastReorderTime.current = now;
          onReorderTabs(draggedTabIndex, i);
          setDraggedTabIndex(i);
          return;
        }
      }
    }
  }, [draggedTabIndex, onReorderTabs]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedTabIndex(null);
  };

  return (
    <div className="flex items-end h-10 bg-muted/50 shrink-0 relative">
      {/* Bottom border that goes behind tabs - visible line separating inactive tabs from content */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border z-0" />

      {/* Logo - far left, styled as a tab when new tab view is active or when no tabs exist */}
      <div className="flex items-end shrink-0 h-10">
        <button
          onClick={onLogoClick || onAddClick}
          className={`
            flex items-center justify-center w-10 h-10 shrink-0 transition-all
            ${
              shouldShowLogoSelected
                ? "bg-card text-foreground rounded-t-lg border-l border-t border-r border-border border-b-0 z-10 -mb-px cursor-pointer"
                : "hover:bg-muted/50 cursor-pointer"
            }
          `}
          aria-label="Show all prototypes"
        >
          <img src="/icon.png" alt="SuperHands" className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex items-end gap-0 min-w-0 overflow-x-auto scrollbar-hide relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {tabs.map((tab, index) => {
          const isDragging = draggedTabIndex === index;
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              className={`relative transition-transform duration-150 ${
                isActive ? "z-30" : "z-10"
              } ${
                index > 0 ? "-ml-px" : ""
              } ${
                isDragging ? "opacity-50 scale-105" : ""
              }`}
            >
              <Tab
                id={tab.id}
                label={tab.label}
                isActive={tab.id === activeTabId}
                isLocal={tab.type === "local"}
                isNewTab={tab.type === "new-tab"}
                isCloseable={true}
                onClick={() => onTabClick(tab.id)}
                onClose={() => onTabClose(tab.id)}
                onDragStart={handleDragStart(index)}
                onDragEnd={handleDragEnd}
                draggable={true}
              />
            </div>
          );
        })}
      </div>

      {/* Add button - positioned right after tabs, hidden when S logo is active or when a new tab is open */}
      {!isShowingNewTab && !hasNewTab && (
        <div className="flex items-end shrink-0 h-10">
          <button
            onClick={onAddClick}
            className="group flex items-center justify-center px-3 py-2.5 text-sm font-medium bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground rounded-t-lg border-l border-t border-r border-transparent hover:border-border -mb-px hover:z-10 transition-all shrink-0 cursor-pointer"
            aria-label="New tab"
          >
            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          </button>
        </div>
      )}

      {/* Spacer to push settings to the right */}
      <div className="flex-1" />

      {/* Settings Menu - positioned at far right */}
      <div className="flex items-center mr-1 h-10">
        <SettingsMenu />
      </div>
    </div>
  );
}
