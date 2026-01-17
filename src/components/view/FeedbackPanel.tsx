import { MessageSquare } from "lucide-react";

interface FeedbackPanelProps {
  deploymentId: string;
}

// Mock feedback panel for the design playground
export function FeedbackPanel({ deploymentId: _deploymentId }: FeedbackPanelProps) {
  // Mock feedback data
  const mockFeedback = [
    {
      id: "1",
      visitor: { name: "Alex Chen", initials: "AC" },
      message: "The header looks great! Can we make the primary button a bit larger?",
      timestamp: "2h ago",
    },
    {
      id: "2",
      visitor: { name: "Sarah Kim", initials: "SK" },
      message: "Love the new color scheme. The orange works really well with the dark mode.",
      timestamp: "5h ago",
    },
    {
      id: "3",
      visitor: { name: "Mike Johnson", initials: "MJ" },
      message: "The tab bar feels intuitive. Nice work on the drag-and-drop reordering.",
      timestamp: "1d ago",
    },
  ];

  if (mockFeedback.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">No feedback yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Share your prototype to collect feedback
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {mockFeedback.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-primary">
              {item.visitor.initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {item.visitor.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {item.timestamp}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {item.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
