import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  GitBranch,
  Github,
  Loader2,
  Lock,
  Plus,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/formatting";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
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

type VariationLoadingState = "idle" | "connecting" | "cloning" | "starting" | "ready" | "error";

interface CreatorInfo {
  name: string | null;
  avatar_url: string | null;
}

interface AvailableDeployment {
  id: string;
  branchId?: string;
  branch: string;
  preview_url: string | null;
  status?: "pending" | "building" | "deployed" | "failed";
  name?: string | null;
  created_by_user?: CreatorInfo | null;
  created_by_id?: string | null;
  repoFullName?: string;
  created_at?: string;
  updated_at?: string;
}

interface NewTabViewProps {
  availableDeployments: AvailableDeployment[];
  openTabIds: string[]; // deployment IDs that are already open as tabs
  onSelectDeployment: (deployment: AvailableDeployment) => void;
  onCreateVariation?: () => void;
  isCreatingVariation?: boolean;
  variationState?: VariationLoadingState;
  variationError?: string | null;
  onRetryVariation?: () => void;
  onDismissVariationError?: () => void;
  onDeleteDeployment?: (deploymentId: string) => void;
  deletingId?: string | null;
  onCreateVariationFrom?: (deploymentId: string) => void;
  // Access control props
  canCreateVariation?: boolean;
  accessDenialReason?: string;
  repoType?: "personal" | "organization" | "template" | "unknown";
  repoOwner?: string;
  // Empty project state props
  isEmpty?: boolean;
  onAddBranch?: () => void;
  // New prototype props
  onNewPrototype?: () => void;
  isCreatingPrototype?: boolean;
  // Current user for permission checks
  currentUserId?: string;
  isDemo?: boolean;
}

export function NewTabView({
  availableDeployments,
  openTabIds,
  onSelectDeployment,
  onCreateVariation: _onCreateVariation,
  isCreatingVariation = false,
  variationState = "idle",
  variationError,
  onRetryVariation,
  onDismissVariationError,
  onDeleteDeployment,
  deletingId,
  onCreateVariationFrom,
  canCreateVariation = true,
  accessDenialReason,
  repoType: _repoType,
  repoOwner,
  isEmpty = false,
  onAddBranch: _onAddBranch,
  onNewPrototype,
  isCreatingPrototype = false,
  currentUserId,
  isDemo = false,
}: NewTabViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deployingBranches, setDeployingBranches] = useState<Set<string>>(new Set());

  const deleteConfirmDeployment = availableDeployments.find(
    (d) => d.id === deleteConfirmId
  );

  // Clear deployed branches from deploying set when they appear in availableDeployments
  useEffect(() => {
    const deployedBranchNames = new Set(
      availableDeployments.map((d) => d.branch)
    );
    setDeployingBranches((prev) => {
      const updated = new Set(prev);
      for (const branch of prev) {
        if (deployedBranchNames.has(branch)) {
          updated.delete(branch);
        }
      }
      return updated.size !== prev.size ? updated : prev;
    });
  }, [availableDeployments]);

  // Filter by search query (include all deployments, even open ones for preview)
  const filteredDeployments = availableDeployments.filter((dep) => {
    const searchLower = searchQuery.toLowerCase();
    const name = dep.name || dep.branch;
    const repo = dep.repoFullName || "";
    return name.toLowerCase().includes(searchLower) || repo.toLowerCase().includes(searchLower);
  });

  // Show empty project state UI - same buttons as non-empty state
  if (isEmpty) {
    return (
      <div className="p-8 pt-12 pb-16">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          <div className="flex gap-3">
            {onNewPrototype && (
              <button
                onClick={onNewPrototype}
                disabled={isCreatingPrototype}
                className="group flex-1 flex items-center justify-center gap-2 bg-card border border-solid border-border rounded-xl hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden cursor-pointer p-6"
              >
                <div className="font-medium text-foreground">New prototype</div>
                {isCreatingPrototype ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show loading UI when creating variation
  if (isCreatingVariation && variationState !== "idle") {
    const getStatusMessage = () => {
      switch (variationState) {
        case "connecting":
          return "Connecting to Superhands...";
        case "cloning":
          return "Setting up repository...";
        case "starting":
          return "Waiting for dev server...";
        case "ready":
          return "Ready!";
        case "error":
          return variationError || "An error occurred";
      }
    };

    const getStatusDescription = () => {
      switch (variationState) {
        case "connecting":
          return "Opening Cursor and preparing your workspace";
        case "cloning":
          return "Cloning repository and creating your variation prototype";
        case "starting":
          return "Starting the development server on localhost:3001";
        case "ready":
          return "Your variation is ready for editing!";
        case "error":
          return "Please try again or check if the menubar app is running";
      }
    };

    const steps = ["connecting", "cloning", "starting", "ready"];
    const currentIndex = steps.indexOf(variationState);

    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="relative max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="text-center space-y-6">
            {/* Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                {variationState !== "error" && variationState !== "ready" && (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
                {variationState === "ready" && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {variationState === "error" && (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <h2
                  className={`text-lg font-medium ${variationState === "error" ? "text-destructive" : "text-foreground"}`}
                >
                  {getStatusMessage()}
                </h2>
              </div>

              <p className="text-muted-foreground text-sm">
                {getStatusDescription()}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center gap-2">
              {steps.map((step, index) => {
                const isError = variationState === "error";
                const isComplete = !isError && index < currentIndex;
                const isCurrent = !isError && index === currentIndex;

                function getStepColorClass(): string {
                  if (isComplete) return "bg-primary";
                  if (isCurrent) return "bg-primary/50";
                  return "bg-muted";
                }

                return (
                  <div
                    key={step}
                    className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${getStepColorClass()}`}
                  />
                );
              })}
            </div>

            {/* Error Actions */}
            {variationState === "error" && (
              <div className="flex gap-3 justify-center pt-2">
                {onRetryVariation && (
                  <Button
                    onClick={onRetryVariation}
                    variant="default"
                    size="sm"
                  >
                    Try Again
                  </Button>
                )}
                {onDismissVariationError && (
                  <Button
                    onClick={onDismissVariationError}
                    variant="outline"
                    size="sm"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pt-12 pb-16">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Prototype buttons - full width at top */}
        {onNewPrototype && !isDemo && (
          <div className="flex gap-3">
            {onNewPrototype && (
              <button
                onClick={onNewPrototype}
                disabled={isCreatingPrototype}
                className="group flex-1 flex items-center justify-center gap-2 bg-card border border-solid border-border rounded-xl hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden cursor-pointer p-6"
              >
                <div className="font-medium text-foreground">New prototype</div>
                {isCreatingPrototype ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Demo CTA - full width at top */}
        {isDemo && (
          <Link
            to="/new"
            className="group w-full flex items-center justify-center gap-3 bg-primary/5 border border-dashed border-primary/30 rounded-xl hover:border-primary/50 hover:bg-primary/10 transition-all overflow-hidden cursor-pointer p-6"
          >
            <Sparkles className="h-6 w-6 text-primary" />
            <div className="font-medium text-foreground">
              Ready to build your own?
            </div>
            <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* Search input */}
        <div className="relative w-full py-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search prototypes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (searchQuery) {
                  setSearchQuery("");
                } else {
                  e.currentTarget.blur();
                }
              }
            }}
            className="w-full pl-10 pr-10 py-2.5 bg-card border border-solid border-border rounded-xl text-sm hover:border-primary/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Access denied message */}
        {!canCreateVariation && !isDemo && (
          <AccessDeniedCard
            reason={accessDenialReason}
            repoOwner={repoOwner}
          />
        )}

        {/* Prototypes list */}
        {(filteredDeployments.length > 0 || Array.from(deployingBranches).length > 0) && (
          <div className="space-y-3">
            {/* Deploying prototypes */}
            {Array.from(deployingBranches).map((branchName) => (
              <div
                key={`deploying-${branchName}`}
                className="flex items-center gap-4 p-4 bg-card border border-solid border-border rounded-xl hover:border-primary/50 transition-all"
              >
                <div className="w-20 h-12 rounded bg-secondary/50 flex items-center justify-center shrink-0">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {branchName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Deploying...
                  </div>
                </div>
              </div>
            ))}

            {/* Prototype list items */}
            {filteredDeployments.map((dep) => {
              const name = dep.name || dep.branch;
              const isOpen = openTabIds.includes(dep.id);
              const isDeleting = deletingId === dep.id;
              return (
                <PrototypeListItem
                  key={dep.id}
                  name={name}
                  branchName={dep.branch}
                  previewUrl={dep.preview_url}
                  status={dep.status}
                  isOpen={isOpen}
                  isDeleting={isDeleting}
                  createdAt={dep.created_at}
                  updatedAt={dep.updated_at}
                  onClick={() => onSelectDeployment(dep)}
                  onDelete={
                    onDeleteDeployment && !isDemo && currentUserId && dep.created_by_id === currentUserId
                      ? () => setDeleteConfirmId(dep.id)
                      : undefined
                  }
                  onFork={
                    onCreateVariationFrom && canCreateVariation && !isDemo
                      ? () => onCreateVariationFrom(dep.branch)
                      : undefined
                  }
                  creatorInfo={dep.created_by_user}
                  repoFullName={dep.repoFullName}
                />
              );
            })}
          </div>
        )}

        {/* Show message if no prototypes match search */}
        {filteredDeployments.length === 0 && Array.from(deployingBranches).length === 0 && searchQuery && (
          <div className="text-sm text-muted-foreground text-center py-8">
            No prototypes found
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prototype?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteConfirmDeployment?.name ||
                  deleteConfirmDeployment?.branch}
              </span>
              {" "}and its deployment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Capture the ID before any state changes from dialog closing
                const idToDelete = deleteConfirmId;
                if (idToDelete && onDeleteDeployment) {
                  onDeleteDeployment(idToDelete);
                }
                setDeleteConfirmId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PrototypeListItem({
  name,
  branchName: _branchName,
  previewUrl,
  status,
  isOpen,
  isDeleting,
  createdAt,
  updatedAt,
  onClick,
  onDelete: _onDelete,
  onFork: _onFork,
  creatorInfo,
  repoFullName: _repoFullName,
}: {
  name: string;
  branchName: string;
  previewUrl: string | null;
  status?: "pending" | "building" | "deployed" | "failed";
  isOpen: boolean;
  isDeleting?: boolean;
  createdAt?: string;
  updatedAt?: string;
  onClick: () => void;
  onDelete?: () => void;
  onFork?: () => void;
  creatorInfo?: CreatorInfo | null;
  repoFullName?: string;
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  // Just show the prototype name, not the full repo path
  const displayName = name;
  const maxDisplayLength = 48;
  const truncatedDisplayName =
    displayName.length > maxDisplayLength
      ? `${displayName.substring(0, maxDisplayLength)}...`
      : displayName;

  const cardContent = (
    <div
      className={`group relative flex items-center gap-4 p-4 border border-solid border-border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer ${
        isOpen ? "bg-secondary/30" : "bg-card"
      } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Thumbnail - scaled iframe preview */}
      <div className="w-20 h-12 rounded bg-secondary/50 overflow-hidden shrink-0 relative">
        {previewUrl && status === "deployed" ? (
          <>
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
              </div>
            )}
            <iframe
              src={previewUrl}
              title={`Preview of ${name}`}
              className="w-[1280px] h-[800px] origin-top-left border-0 pointer-events-none"
              style={{ transform: "scale(0.0625)" }}
              onLoad={() => setIframeLoaded(true)}
              loading="lazy"
            />
          </>
        ) : status === "building" || status === "pending" ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <GitBranch className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
        {/* Deleting indicator */}
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Name and metadata */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <div className="text-sm font-medium text-foreground truncate" title={displayName}>
            {truncatedDisplayName}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Timestamps */}
            {(createdAt || updatedAt) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {updatedAt ? (
                  <span>{formatTimeAgo(updatedAt)}</span>
                ) : createdAt ? (
                  <span>{formatTimeAgo(createdAt)}</span>
                ) : null}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {/* Creator avatar/initial icon */}
          {creatorInfo && (creatorInfo.name || creatorInfo.avatar_url) && (
            <div className="flex items-center">
              {creatorInfo.avatar_url ? (
                <img
                  src={creatorInfo.avatar_url}
                  alt={creatorInfo.name || "Creator"}
                  className="h-5 w-5 rounded-full shrink-0"
                />
              ) : creatorInfo.name ? (
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-medium text-primary">
                    {creatorInfo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : null}
            </div>
          )}
          {/* Creator name */}
          {creatorInfo && creatorInfo.name && (
            <span className="text-xs text-muted-foreground">
              {creatorInfo.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isOpen) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {cardContent}
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Already open</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
}

function AccessDeniedCard({
  reason,
  repoOwner,
}: {
  reason?: string;
  repoOwner?: string;
}) {
  const getIcon = () => {
    switch (reason) {
      case "personal_repo_not_owner":
        return <Lock className="h-10 w-10 text-muted-foreground" />;
      case "org_not_member":
        return <Building2 className="h-10 w-10 text-muted-foreground" />;
      case "installation_suspended":
      case "installation_not_found":
        return <Github className="h-10 w-10 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-10 w-10 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (reason) {
      case "personal_repo_not_owner":
        return "Owner Access Required";
      case "org_not_member":
        return "Organization Access Required";
      case "installation_suspended":
        return "GitHub Disconnected";
      case "installation_not_found":
        return "Repository Not Found";
      case "no_team_access":
        return "Team Access Required";
      default:
        return "Cannot Create Variation";
    }
  };

  const getDescription = () => {
    switch (reason) {
      case "personal_repo_not_owner":
        return repoOwner
          ? `This project uses a personal GitHub repository. Only ${repoOwner} can create variations.`
          : "This project uses a personal GitHub repository. Only the owner can create variations.";
      case "org_not_member":
        return repoOwner
          ? `Connect your GitHub account to verify your membership in the ${repoOwner} organization.`
          : "Connect your GitHub account to verify your organization membership.";
      case "installation_suspended":
        return "The GitHub connection for this project has been disconnected. Contact the project owner.";
      case "installation_not_found":
        return "The repository for this project could not be found. It may have been deleted or moved.";
      case "no_team_access":
        return "You need to be a member of the project team to create variations.";
      default:
        return "You do not have permission to create variations for this project.";
    }
  };

  return (
    <div className="flex flex-col bg-card border border-dashed border-border rounded-xl overflow-hidden opacity-75">
      <div className="flex-1 flex items-center justify-center p-8 bg-secondary/20">
        {getIcon()}
      </div>
      <div className="p-4 border-t border-border">
        <div className="font-medium text-foreground">{getTitle()}</div>
        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {getDescription()}
        </div>
      </div>
    </div>
  );
}
