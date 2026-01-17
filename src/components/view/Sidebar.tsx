import { ArrowRight, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { FeedbackPanel } from "./FeedbackPanel";

interface Deployment {
  id: string;
  branch: string;
  preview_url: string | null;
  status: "pending" | "building" | "deployed" | "failed" | "deleted";
  name?: string | null;
  installation_projects: {
    project_name: string;
  };
}

interface SidebarProps {
  deployment: Deployment;
  collapsed: boolean;
  variationPreviewUrl?: string | null;
  isDemo?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  deployment,
  collapsed,
  variationPreviewUrl,
  isDemo = false,
  onClose,
}: SidebarProps) {
  return (
    <aside
      className={`border-l border-border bg-card flex flex-col shrink-0 transition-[width] duration-200 ease-in-out overflow-hidden relative z-10 h-full ${
        collapsed ? "w-0 border-l-0" : "w-80"
      }`}
    >
      {/* Feedback panel - hide for local variations */}
      {variationPreviewUrl !== "http://localhost:3001" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-10 border-b border-border">
            <span className="text-sm font-medium text-foreground">Feedback</span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Feedback content */}
          <div className="flex-1 overflow-y-auto scrollbar-dark">
            <FeedbackPanel deploymentId={deployment.id} />
          </div>
        </>
      )}

      {/* Spacer for local variations */}
      {variationPreviewUrl === "http://localhost:3001" && (
        <div className="flex-1" />
      )}

      {/* Demo CTA Banner */}
      {isDemo && (
        <div className="border-t border-border p-4 shrink-0 bg-primary/5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Ready to build your own?
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Create a project from your GitHub repo
            </p>
            <Link
              to="/new"
              className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Your Project
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
