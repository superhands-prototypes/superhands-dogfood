import { useState, useEffect, useCallback, useMemo } from "react";

export interface Tab {
  id: string;
  branchId: string | null;
  deploymentId: string | null;
  type: "deployment" | "new-tab" | "local";
  label: string;
  previewUrl: string | null;
  repoFullName?: string;
  // Local tab fields
  owner?: string;
  repoName?: string;
  branchName?: string;
}

interface StoredTabState {
  version: 1;
  tabs: Tab[];
  activeTabId: string;
  lastUpdated: string;
}

interface UseTabsOptions {
  initialDeploymentId?: string;
  initialDeployment?: {
    id: string;
    branchId?: string | null;
    name?: string | null;
    branch: string;
    preview_url: string | null;
    repoFullName?: string;
  };
}

interface UseTabsReturn {
  tabs: Tab[];
  activeTabId: string;
  activeTab: Tab | null;
  addTab: (deployment: {
    id: string;
    branchId?: string | null;
    name?: string | null;
    branch: string;
    preview_url: string | null;
    repoFullName?: string;
  }) => void;
  addNewTab: () => void;
  addLocalTab: (
    label: string,
    previewUrl: string,
    repoContext?: { owner: string; repoName: string; repoFullName: string },
    sourceDeploymentId?: string
  ) => void;
  closeTab: (tabId: string) => string | null; // returns new active deployment ID or null
  setActiveTab: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  isTabOpen: (deploymentId: string) => boolean;
  getTabByDeploymentId: (deploymentId: string) => Tab | undefined;
  updateNewTabToDeployment: (deployment: {
    id: string;
    branchId?: string | null;
    name?: string | null;
    branch: string;
    preview_url: string | null;
    repoFullName?: string;
  }) => void;
  updateLocalTabToDeployment: (deployment: {
    id: string;
    branchId?: string | null;
    name?: string | null;
    branch: string;
    preview_url: string | null;
    repoFullName?: string;
  }) => void;
  removeLocalTab: () => void;
  hasNewTab: boolean;
  updateTabLabel: (deploymentId: string, newLabel: string) => void;
}

const MAX_TABS = 10;

const STORAGE_KEY = "superhands_tabs_global";

function generateId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadTabsFromStorage(): StoredTabState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as StoredTabState;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveTabsToStorage(tabs: Tab[], activeTabId: string): void {
  if (typeof window === "undefined") return;
  // Don't persist new-tab or local tabs
  const persistableTabs = tabs.filter((t) => t.type === "deployment");
  const state: StoredTabState = {
    version: 1,
    tabs: persistableTabs,
    activeTabId: persistableTabs.some((t) => t.id === activeTabId)
      ? activeTabId
      : persistableTabs[0]?.id || "",
    lastUpdated: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota exceeded or other error
  }
}

export function useTabs({
  initialDeploymentId,
  initialDeployment,
}: UseTabsOptions = {}): UseTabsReturn {
  // Check if we should start with a new-tab
  const isNewTabStart = !initialDeploymentId || initialDeploymentId === "__new__";

  const [tabs, setTabs] = useState<Tab[]>(() => {
    // Initialize from localStorage or create initial tab
    const stored = loadTabsFromStorage();

    // If starting with new-tab view
    if (isNewTabStart) {
      // If we have stored tabs, use them and add a new-tab
      if (stored && stored.tabs.length > 0) {
        // Check if there's already a new-tab
        const hasNewTab = stored.tabs.some((t) => t.type === "new-tab");
        if (hasNewTab) {
          return stored.tabs;
        }
        return [
          ...stored.tabs,
          {
            id: generateId(),
            branchId: null,
            deploymentId: null,
            type: "new-tab" as const,
            label: "New tab",
            previewUrl: null,
          },
        ];
      }
      // No stored tabs, start with just a new-tab
      return [
        {
          id: generateId(),
          branchId: null,
          deploymentId: null,
          type: "new-tab" as const,
          label: "New tab",
          previewUrl: null,
        },
      ];
    }

    if (stored && stored.tabs.length > 0) {
      // Check if the initial deployment is already in tabs
      const hasInitial = stored.tabs.some((t) => t.deploymentId === initialDeploymentId);
      if (hasInitial) {
        return stored.tabs;
      }
      // Add the initial deployment as a new tab
      const newTab: Tab = {
        id: generateId(),
        branchId: initialDeployment?.branchId || null,
        deploymentId: initialDeploymentId!,
        type: "deployment",
        label: initialDeployment?.name || initialDeployment?.branch || "Branch",
        previewUrl: initialDeployment?.preview_url || null,
        repoFullName: initialDeployment?.repoFullName,
      };
      return [...stored.tabs, newTab];
    }
    // Create initial tab
    return [
      {
        id: generateId(),
        branchId: initialDeployment?.branchId || null,
        deploymentId: initialDeploymentId!,
        type: "deployment",
        label: initialDeployment?.name || initialDeployment?.branch || "Branch",
        previewUrl: initialDeployment?.preview_url || null,
        repoFullName: initialDeployment?.repoFullName,
      },
    ];
  });

  const [activeTabId, setActiveTabIdState] = useState<string>(() => {
    // If starting with new-tab, set it as active
    if (isNewTabStart) {
      const newTab = tabs.find((t) => t.type === "new-tab");
      return newTab?.id || tabs[tabs.length - 1]?.id || "";
    }

    const stored = loadTabsFromStorage();
    // If the stored active tab matches our initial deployment, use it
    if (stored && initialDeploymentId) {
      const initialTab = stored.tabs.find((t) => t.deploymentId === initialDeploymentId);
      if (initialTab) {
        return initialTab.id;
      }
    }
    // Otherwise, find the tab for the initial deployment
    const tab = tabs.find((t) => t.deploymentId === initialDeploymentId);
    return tab?.id || tabs[0]?.id || "";
  });

  // Sync to localStorage when tabs change
  useEffect(() => {
    saveTabsToStorage(tabs, activeTabId);
  }, [tabs, activeTabId]);

  // Update active tab when URL deployment changes
  useEffect(() => {
    // Skip if we're in new-tab mode
    if (isNewTabStart) return;

    const tab = tabs.find((t) => t.deploymentId === initialDeploymentId);
    if (tab && tab.id !== activeTabId) {
      setActiveTabIdState(tab.id);
    }
  }, [initialDeploymentId, tabs, activeTabId]);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || null,
    [tabs, activeTabId]
  );

  const addTab = useCallback(
    (deployment: {
      id: string;
      branchId?: string | null;
      name?: string | null;
      branch: string;
      preview_url: string | null;
      repoFullName?: string;
    }) => {
      // Check if already open using current tabs
      const existingTab = tabs.find((t) => t.deploymentId === deployment.id);
      if (existingTab) {
        setActiveTabIdState(existingTab.id);
        return;
      }
      // Check max tabs
      if (tabs.length >= MAX_TABS) {
        return;
      }
      const newTabId = generateId();
      setTabs((prev) => {
        // Double-check in case of race condition
        const existing = prev.find((t) => t.deploymentId === deployment.id);
        if (existing) {
          return prev;
        }
        if (prev.length >= MAX_TABS) {
          return prev;
        }
        const newTab: Tab = {
          id: newTabId,
          branchId: deployment.branchId || null,
          deploymentId: deployment.id,
          type: "deployment",
          label: deployment.name || deployment.branch,
          previewUrl: deployment.preview_url,
          repoFullName: deployment.repoFullName,
        };
        return [...prev, newTab];
      });
      setActiveTabIdState(newTabId);
    },
    [tabs]
  );

  const closeTab = useCallback(
    (tabId: string): string | null => {
      const tabIndex = tabs.findIndex((t) => t.id === tabId);
      if (tabIndex === -1) return null;

      const closingTab = tabs[tabIndex];
      const isActive = tabId === activeTabId;
      const newTabs = tabs.filter((t) => t.id !== tabId);

      // If closing the last tab
      if (newTabs.length === 0) {
        // If closing a new-tab, allow it to close completely (empty tabs)
        if (closingTab.type === "new-tab") {
          setTabs([]);
          setActiveTabIdState("");
          return null;
        }
        // Otherwise, create a new-tab
        const newTab: Tab = {
          id: generateId(),
          branchId: null,
          deploymentId: null,
          type: "new-tab",
          label: "New tab",
          previewUrl: null,
        };
        setTabs([newTab]);
        setActiveTabIdState(newTab.id);
        return null;
      }

      setTabs(newTabs);

      if (isActive) {
        // Switch to adjacent tab
        const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
        const newActiveTab = newTabs[newActiveIndex];
        setActiveTabIdState(newActiveTab.id);
        // Return the deployment ID to navigate to
        return newActiveTab.deploymentId;
      }

      // Return current active deployment if not closing active tab
      const currentActive = tabs.find((t) => t.id === activeTabId);
      return currentActive?.deploymentId || null;
    },
    [tabs, activeTabId]
  );

  const setActiveTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab) {
        setActiveTabIdState(tabId);
      }
    },
    [tabs]
  );

  const reorderTabs = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      setTabs((prev) => {
        const newTabs = [...prev];
        const [movedTab] = newTabs.splice(fromIndex, 1);
        newTabs.splice(toIndex, 0, movedTab);
        return newTabs;
      });
    },
    []
  );

  const isTabOpen = useCallback(
    (deploymentId: string): boolean => {
      return tabs.some((t) => t.deploymentId === deploymentId);
    },
    [tabs]
  );

  const getTabByDeploymentId = useCallback(
    (deploymentId: string): Tab | undefined => {
      return tabs.find((t) => t.deploymentId === deploymentId);
    },
    [tabs]
  );

  const addNewTab = useCallback(() => {
    // Check if there's already a new-tab open
    const existingNewTab = tabs.find((t) => t.type === "new-tab");
    if (existingNewTab) {
      setActiveTabIdState(existingNewTab.id);
      return;
    }
    // Check max tabs
    if (tabs.length >= MAX_TABS) {
      return;
    }
    const newTab: Tab = {
      id: generateId(),
      branchId: null,
      deploymentId: null,
      type: "new-tab",
      label: "New tab",
      previewUrl: null,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabIdState(newTab.id);
  }, [tabs]);

  const updateNewTabToDeployment = useCallback(
    (deployment: {
      id: string;
      branchId?: string | null;
      name?: string | null;
      branch: string;
      preview_url: string | null;
      repoFullName?: string;
    }) => {
      // Check if there's a new-tab to update
      const newTab = tabs.find((t) => t.type === "new-tab");
      if (!newTab) {
        // No new-tab to update, just add normally
        const existingTab = tabs.find((t) => t.deploymentId === deployment.id);
        if (existingTab) {
          setActiveTabIdState(existingTab.id);
          return;
        }
        const newTabId = generateId();
        setTabs((prev) => {
          // Double-check in case of race condition
          if (prev.find((t) => t.deploymentId === deployment.id)) {
            return prev;
          }
          const tab: Tab = {
            id: newTabId,
            branchId: deployment.branchId || null,
            deploymentId: deployment.id,
            type: "deployment",
            label: deployment.name || deployment.branch,
            previewUrl: deployment.preview_url,
            repoFullName: deployment.repoFullName,
          };
          return [...prev, tab];
        });
        setActiveTabIdState(newTabId);
        return;
      }
      // Update the new-tab to become a deployment tab (keeps same id, so active tab stays the same)
      setTabs((prev) =>
        prev.map((t) =>
          t.type === "new-tab"
            ? {
                ...t,
                branchId: deployment.branchId || null,
                deploymentId: deployment.id,
                type: "deployment" as const,
                label: deployment.name || deployment.branch,
                previewUrl: deployment.preview_url,
                repoFullName: deployment.repoFullName,
              }
            : t
        )
      );
      // Explicitly set this tab as active to ensure UI updates
      setActiveTabIdState(newTab.id);
    },
    [tabs, activeTabId]
  );

  const hasNewTab = useMemo(
    () => tabs.some((t) => t.type === "new-tab"),
    [tabs]
  );

  const addLocalTab = useCallback(
    (
      label: string,
      previewUrl: string,
      repoContext?: { owner: string; repoName: string; repoFullName: string },
      sourceDeploymentId?: string
    ) => {
      // Check if there's already a local tab
      const existingLocal = tabs.find((t) => t.type === "local");
      if (existingLocal) {
        // Update the existing local tab
        setTabs((prev) =>
          prev.map((t) =>
            t.type === "local"
              ? {
                  ...t,
                  label,
                  previewUrl,
                  owner: repoContext?.owner,
                  repoName: repoContext?.repoName,
                  repoFullName: repoContext?.repoFullName,
                }
              : t
          )
        );
        setActiveTabIdState(existingLocal.id);
        return;
      }

      // Check max tabs
      if (tabs.length >= MAX_TABS) {
        return;
      }

      // Remove new-tab if present and replace with local tab
      const newTabId = generateId();
      setTabs((prev) => {
        const withoutNewTab = prev.filter((t) => t.type !== "new-tab");
        const localTab: Tab = {
          id: newTabId,
          branchId: null,
          deploymentId: sourceDeploymentId || null,
          type: "local",
          label,
          previewUrl,
          owner: repoContext?.owner,
          repoName: repoContext?.repoName,
          repoFullName: repoContext?.repoFullName,
        };
        return [...withoutNewTab, localTab];
      });
      setActiveTabIdState(newTabId);
    },
    [tabs]
  );

  const updateLocalTabToDeployment = useCallback(
    (deployment: {
      id: string;
      branchId?: string | null;
      name?: string | null;
      branch: string;
      preview_url: string | null;
      repoFullName?: string;
    }) => {
      // Find the local tab
      const localTab = tabs.find((t) => t.type === "local");
      if (!localTab) {
        // No local tab, just add as regular tab
        addTab(deployment);
        return;
      }

      // Update the local tab to become a deployment tab
      setTabs((prev) =>
        prev.map((t) =>
          t.type === "local"
            ? {
                ...t,
                branchId: deployment.branchId || null,
                deploymentId: deployment.id,
                type: "deployment" as const,
                label: deployment.name || deployment.branch,
                previewUrl: deployment.preview_url,
                repoFullName: deployment.repoFullName,
              }
            : t
        )
      );
      setActiveTabIdState(localTab.id);
    },
    [tabs, addTab]
  );

  const removeLocalTab = useCallback(() => {
    const localTab = tabs.find((t) => t.type === "local");
    if (localTab) {
      closeTab(localTab.id);
    }
  }, [tabs, closeTab]);

  const updateTabLabel = useCallback(
    (deploymentId: string, newLabel: string) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.deploymentId === deploymentId ? { ...t, label: newLabel } : t
        )
      );
    },
    []
  );

  return {
    tabs,
    activeTabId,
    activeTab,
    addTab,
    addNewTab,
    addLocalTab,
    closeTab,
    setActiveTab,
    reorderTabs,
    isTabOpen,
    getTabByDeploymentId,
    updateNewTabToDeployment,
    updateLocalTabToDeployment,
    removeLocalTab,
    hasNewTab,
    updateTabLabel,
  };
}
