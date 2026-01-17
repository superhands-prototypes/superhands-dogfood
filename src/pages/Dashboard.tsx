import { useState, useCallback, useRef } from "react";
import {
  Loader2,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  Trash2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TabBar, NewTabView } from "@/components/browser-tabs";
import { Sidebar } from "@/components/view/Sidebar";
import { PreviewFrame } from "@/components/view/PreviewFrame";
import { useTabs } from "@/hooks/useTabs";
import { useAuth } from "@/providers/mock-auth";
import { getAvailableDeployments, getMockBranches } from "@/mock/deployments";

type DeviceType = "desktop" | "tablet" | "mobile";

export default function Dashboard() {
  const { user } = useAuth();

  // Mock data
  const branches = getMockBranches();
  const availableDeployments = getAvailableDeployments();

  const [activeDeployment, setActiveDeployment] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved === "true";
    }
    return false;
  });
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [deletingDeploymentId, setDeletingDeploymentId] = useState<string | null>(null);
  const [showNewTabView, setShowNewTabView] = useState(false);
  const [isScrollingDown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [feedbackCount] = useState(3); // Mock feedback count
  // Note: isScrollingDown would be used to hide the tab bar on scroll, disabled for now

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Tab management
  const {
    tabs,
    activeTabId,
    activeTab,
    addTab,
    addNewTab,
    closeTab,
    setActiveTab,
    reorderTabs,
    updateNewTabToDeployment,
    updateTabLabel,
  } = useTabs();

  // Get deployment IDs that are already open as tabs
  const openTabDeploymentIds = tabs
    .filter((t) => t.type === "deployment" && t.deploymentId)
    .map((t) => t.deploymentId as string);

  // Check if we're showing the new tab view
  const hasOtherTabs = tabs.some((t) => t.type !== "new-tab");
  const displayTabs = hasOtherTabs ? tabs : tabs.filter((t) => t.type !== "new-tab");
  const isShowingNewTab = (hasOtherTabs && activeTab?.type === "new-tab") || showNewTabView || displayTabs.length === 0;
  const shouldShowLogoSelected = displayTabs.length === 0 || (showNewTabView && !activeTab);

  // Handle tab click
  const handleTabClick = useCallback(
    (tabId: string) => {
      setShowNewTabView(false);
      setActiveTab(tabId);
    },
    [setActiveTab]
  );

  // Handle tab close
  const handleTabClose = useCallback(
    (tabId: string) => {
      closeTab(tabId);
      const remainingTabs = tabs.filter((t) => t.id !== tabId && t.type !== "new-tab");
      if (remainingTabs.length === 0) {
        setShowNewTabView(true);
      }
    },
    [tabs, closeTab]
  );

  // Handle selecting a deployment from NewTabView
  const handleSelectDeployment = useCallback(
    (dep: { id: string; branchId?: string; name?: string | null; branch: string; preview_url: string | null; repoFullName?: string }) => {
      const existingTab = tabs.find((t) => t.deploymentId === dep.id);
      if (existingTab) {
        setShowNewTabView(false);
        setActiveTab(existingTab.id);
        return;
      }

      if (activeTab?.type === "new-tab") {
        setShowNewTabView(false);
        updateNewTabToDeployment({
          id: dep.id,
          branchId: dep.branchId,
          name: dep.name,
          branch: dep.branch,
          preview_url: dep.preview_url,
          repoFullName: dep.repoFullName,
        });
      } else {
        setShowNewTabView(false);
        addTab({
          id: dep.id,
          branchId: dep.branchId,
          name: dep.name,
          branch: dep.branch,
          preview_url: dep.preview_url,
          repoFullName: dep.repoFullName,
        });
      }

      // Set active deployment
      const branch = branches.find(b => b.deployment?.id === dep.id);
      if (branch?.deployment) {
        setActiveDeployment({
          id: branch.deployment.id,
          branch: branch.name,
          preview_url: branch.deployment.previewUrl,
          status: branch.deployment.status,
        });
      }
    },
    [activeTab, updateNewTabToDeployment, addTab, tabs, setActiveTab, branches]
  );

  // Delete deployment handler (mock)
  const handleDeleteDeployment = useCallback((deploymentId: string) => {
    setDeletingDeploymentId(deploymentId);
    // Simulate deletion
    setTimeout(() => {
      const openTab = tabs.find((t) => t.deploymentId === deploymentId);
      if (openTab) {
        closeTab(openTab.id);
      }
      setDeletingDeploymentId(null);
      console.log("Deleted deployment:", deploymentId);
    }, 1000);
  }, [tabs, closeTab]);

  // Rename handlers
  const handleOpenRename = useCallback(() => {
    const currentName = activeTab?.label || "";
    setRenameValue(currentName);
    setShowRenameDialog(true);
  }, [activeTab?.label]);

  const handleRename = useCallback(() => {
    if (!activeTab?.deploymentId || !renameValue.trim()) return;

    setIsRenaming(true);
    // Simulate rename
    setTimeout(() => {
      updateTabLabel(activeTab.deploymentId!, renameValue.trim());
      setShowRenameDialog(false);
      setIsRenaming(false);
    }, 500);
  }, [activeTab?.deploymentId, renameValue, updateTabLabel]);

  // Get the preview URL to display
  const previewUrl = activeDeployment?.preview_url || activeTab?.previewUrl;

  // Get the share URL
  const shareDeploymentId = activeDeployment?.id || activeTab?.deploymentId;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = shareDeploymentId
    ? `${origin}/view/${shareDeploymentId}`
    : previewUrl;

  // Get sidebar deployment info
  const getSidebarDeployment = () => {
    if (activeTab?.type === "deployment" && activeTab.deploymentId) {
      const branch = branches.find(b => b.deployment?.id === activeTab.deploymentId);
      if (branch?.deployment) {
        return {
          id: branch.deployment.id,
          branch: branch.name,
          preview_url: branch.deployment.previewUrl,
          status: branch.deployment.status as any,
          installation_projects: branch.repo ? {
            project_name: branch.repo.name,
          } : { project_name: "" },
        };
      }
    }
    const firstWithDeployment = branches.find(b => b.deployment);
    if (firstWithDeployment?.deployment) {
      return {
        id: firstWithDeployment.deployment.id,
        branch: firstWithDeployment.name,
        preview_url: firstWithDeployment.deployment.previewUrl,
        status: firstWithDeployment.deployment.status as any,
        installation_projects: firstWithDeployment.repo ? {
          project_name: firstWithDeployment.repo.name,
        } : { project_name: "" },
      };
    }
    return null;
  };

  const sidebarDeployment = getSidebarDeployment();

  const copyUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Tab bar - fixed at top, full width */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${isScrollingDown ? "-translate-y-full" : "translate-y-0"}`}>
        <TabBar
          tabs={displayTabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onAddClick={() => addNewTab()}
          onLogoClick={() => {
            const existingNewTab = displayTabs.find((t) => t.type === "new-tab");
            if (existingNewTab) {
              setShowNewTabView(false);
              setActiveTab(existingNewTab.id);
            } else {
              addNewTab();
            }
          }}
          onReorderTabs={reorderTabs}
          isShowingNewTab={isShowingNewTab}
          shouldShowLogoSelected={shouldShowLogoSelected}
        />
      </div>

      {/* Spacer for fixed tab bar */}
      <div className="h-10 shrink-0" />

      {/* Controls bar - full width, below tab bar */}
      {!isShowingNewTab && previewUrl && (
        <div className="sticky top-10 z-30 bg-card/80 backdrop-blur-sm border-b border-border shrink-0">
          <div className="grid grid-cols-3 items-center gap-2 px-4 h-10">
            {/* Left side: Deployment name with menu */}
            <div className="flex items-center min-w-0">
              {activeTab?.deploymentId ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-2.5 py-1 -ml-2 rounded-md text-foreground hover:bg-foreground/10 active:bg-foreground/15 data-[state=open]:bg-foreground/10 focus:outline-none transition-all min-w-0"
                      aria-label="Prototype options"
                    >
                      <span className="text-xs font-medium truncate">
                        {sidebarDeployment?.branch || activeTab?.label || activeDeployment?.name || ""}
                      </span>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-popover border-border" align="start">
                    <DropdownMenuItem
                      onClick={handleOpenRename}
                      className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="text-sm font-medium text-foreground truncate">
                  {sidebarDeployment?.branch || activeTab?.label || activeDeployment?.name || ""}
                </span>
              )}
            </div>

            {/* Center: Device dropdown */}
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
                    <span className="capitalize">{device}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border" align="center">
                  <DropdownMenuCheckboxItem
                    checked={device === "mobile"}
                    onCheckedChange={() => setDevice("mobile")}
                    className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer"
                  >
                    Mobile
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={device === "tablet"}
                    onCheckedChange={() => setDevice("tablet")}
                    className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer"
                  >
                    Tablet
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={device === "desktop"}
                    onCheckedChange={() => setDevice("desktop")}
                    className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer"
                  >
                    Desktop
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side: Controls */}
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              {/* Edit in Cursor button (mock) */}
              <button
                onClick={() => console.log("Edit in Cursor clicked")}
                className="px-2.5 py-1 rounded-md bg-secondary text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                Edit in Cursor
              </button>

              {/* Share button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="px-2.5 py-1 rounded-md bg-orange-500 text-xs font-medium text-white hover:bg-orange-600 transition-colors"
              >
                Share
              </button>

              {/* Feedback panel button */}
              <button
                onClick={toggleSidebar}
                className={`relative p-1.5 rounded-md hover:bg-secondary transition-colors shrink-0 ${
                  !sidebarCollapsed
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Feedback"
              >
                <MessageSquare className="h-4 w-4" />
                {feedbackCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-medium bg-primary text-primary-foreground rounded-full">
                    {feedbackCount > 99 ? "99+" : feedbackCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Preview area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Preview content */}
          <div className={`flex-1 min-h-0 bg-background relative ${isShowingNewTab ? "overflow-y-auto" : "overflow-hidden"}`}>
            {isShowingNewTab ? (
              <NewTabView
                availableDeployments={availableDeployments}
                openTabIds={openTabDeploymentIds}
                onSelectDeployment={handleSelectDeployment}
                onDeleteDeployment={handleDeleteDeployment}
                deletingId={deletingDeploymentId}
                canCreateVariation={true}
                onNewPrototype={() => console.log("New prototype clicked")}
                isEmpty={branches.length === 0}
                currentUserId={user?.id}
              />
            ) : activeDeployment?.status === "building" || activeDeployment?.status === "pending" ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {activeDeployment?.status === "building" ? "Building deployment..." : "Starting deployment..."}
                  </p>
                </div>
              </div>
            ) : previewUrl ? (
              <PreviewFrame
                ref={iframeRef}
                url={previewUrl}
                device={device}
                showNav={false}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No preview available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          deployment={sidebarDeployment || {
            id: "",
            branch: "",
            preview_url: null,
            status: "pending" as const,
            installation_projects: { project_name: "" },
          }}
          collapsed={sidebarCollapsed || !sidebarDeployment || isShowingNewTab}
          onClose={toggleSidebar}
        />
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle>Share</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 min-w-0">
            {/* URL display - clickable to copy */}
            <button
              onClick={copyUrl}
              className="flex items-center gap-2 min-w-0 bg-muted rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer text-left"
              title="Click to copy"
            >
              <span className="flex-1 min-w-0 truncate overflow-hidden">
                {shareUrl}
              </span>
              {copied ? (
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Copy className="h-4 w-4 shrink-0" />
              )}
            </button>

            {/* Open in new tab button */}
            <a
              href={shareUrl || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              onClick={() => setShowShareModal(false)}
            >
              <ExternalLink className="h-4 w-4" />
              Open in new tab
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !deletingDeploymentId && setShowDeleteConfirm(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prototype?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {sidebarDeployment?.branch || activeTab?.label || "this prototype"}
              </span>
              {" "}and its deployment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingDeploymentId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (activeTab?.deploymentId) {
                  handleDeleteDeployment(activeTab.deploymentId);
                  setShowDeleteConfirm(false);
                }
              }}
              disabled={!!deletingDeploymentId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingDeploymentId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename prototype</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && renameValue.trim()) {
                  handleRename();
                }
              }}
              placeholder="Enter new name"
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRenameDialog(false)}
                disabled={isRenaming}
                className="px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                disabled={isRenaming || !renameValue.trim()}
                className="px-4 py-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isRenaming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
