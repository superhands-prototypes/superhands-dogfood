import { forwardRef, useState, useEffect, useRef } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DeviceType = "desktop" | "tablet" | "mobile";

interface PreviewFrameProps {
  url: string;
  device: DeviceType;
  deploymentName?: string;
  previewUrl?: string;
  onDeviceChange?: (device: DeviceType) => void;
  onToggleSidebar?: () => void;
  onOpenPanel?: (panel: "changes" | "feedback") => void;
  showNav?: boolean;
  onScrollChange?: (isScrollingDown: boolean) => void;
}

const DEVICE_DIMENSIONS = {
  mobile: { width: 375, height: 812 }, // iPhone X dimensions
  tablet: { width: 768, height: 1024 }, // iPad dimensions
  desktop: { width: "100%", height: "100%" },
};

// Device frame styles (reserved for future device frame UI)
// const DEVICE_FRAMES = {
//   mobile: { outerClass: "rounded-[40px] bg-black p-2 shadow-xl", innerClass: "rounded-[32px] overflow-hidden", notch: true },
//   tablet: { outerClass: "rounded-[20px] bg-black p-3 shadow-xl", innerClass: "rounded-[12px] overflow-hidden", notch: false },
//   desktop: { outerClass: "", innerClass: "h-full w-full", notch: false },
// };

export const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  function PreviewFrame({
    url,
    device,
    deploymentName,
    previewUrl,
    onDeviceChange,
    onToggleSidebar,
    onOpenPanel,
    showNav = true,
    onScrollChange,
  }, ref) {
    const dimensions = DEVICE_DIMENSIONS[device];
    const [copied, setCopied] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollTop = useRef(0);

    // Handle scroll detection on the preview container
    useEffect(() => {
      const container = containerRef.current;
      if (!container || !onScrollChange) return;

      const handleScroll = () => {
        const scrollTop = container.scrollTop;
        const isScrollingDown = scrollTop > lastScrollTop.current && scrollTop > 10;
        const isScrollingUp = scrollTop < lastScrollTop.current;

        if (isScrollingDown || (isScrollingUp && scrollTop <= 10)) {
          onScrollChange(isScrollingDown);
        }

        lastScrollTop.current = scrollTop;
      };

      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }, [onScrollChange]);

    const copyUrl = async () => {
      if (previewUrl) {
        await navigator.clipboard.writeText(previewUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    const handlePanelClick = () => {
      if (onToggleSidebar) {
        onToggleSidebar();
        // Open feedback panel when toggling
        if (onOpenPanel) {
          onOpenPanel("feedback");
        }
      }
    };

    const NavBar = () => {
      if (!showNav) return null;

      return (
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border shrink-0">
          <div className="grid grid-cols-3 items-center gap-2 px-4 h-10">
            {/* Left side: Deployment name */}
            <div className="flex items-center min-w-0">
              {deploymentName && (
                <>
                  {deploymentName.length > 40 ? (
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium text-foreground truncate cursor-help">
                          {deploymentName.substring(0, 40)}...
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs break-words">
                        {deploymentName}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-sm font-medium text-foreground truncate">
                      {deploymentName}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Center: Device dropdown */}
            <div className="flex items-center justify-center">
              {onDeviceChange && (
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
                      onCheckedChange={() => onDeviceChange("mobile")}
                      className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer"
                    >
                      Mobile
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={device === "tablet"}
                      onCheckedChange={() => onDeviceChange("tablet")}
                      className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer"
                    >
                      Tablet
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={device === "desktop"}
                      onCheckedChange={() => onDeviceChange("desktop")}
                      className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer"
                    >
                      Desktop
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Right side: Controls */}
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              {/* View link */}
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              {/* Copy link */}
              {previewUrl && (
                <button
                  onClick={copyUrl}
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}

              {/* Feedback panel button */}
              {onToggleSidebar && (
                <button
                  onClick={handlePanelClick}
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Feedback"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    };

    if (device === "desktop") {
      return (
        <div ref={containerRef} className="h-full w-full flex flex-col overflow-auto scrollbar-dark">
          <NavBar />
          <div className="flex-1 min-h-0 p-4">
            <iframe
              ref={ref}
              src={url}
              className="h-full w-full rounded-lg border border-border bg-white"
              title="Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="h-full w-full flex flex-col overflow-auto scrollbar-dark">
        <NavBar />
        <div className="flex-1 min-h-0 flex items-start justify-center p-4 pt-2 overflow-y-auto scrollbar-dark">
          <div
            className="rounded-lg border border-border bg-white overflow-hidden"
            style={{
              width: typeof dimensions.width === "number" ? dimensions.width : "100%",
              height: typeof dimensions.height === "number" ? dimensions.height : "100%",
              maxWidth: typeof dimensions.width === "number" ? dimensions.width : "100%",
              maxHeight: typeof dimensions.height === "number" ? dimensions.height : "100%",
            }}
          >
            <iframe
              ref={ref}
              src={url}
              className="h-full w-full bg-white"
              title="Preview"
              style={{
                width: typeof dimensions.width === "number" ? dimensions.width : "100%",
                height: typeof dimensions.height === "number" ? dimensions.height : "100%",
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      </div>
    );
  }
);
