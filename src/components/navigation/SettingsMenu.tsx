import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/mock-auth";
import { LogOut, Monitor } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

export function SettingsMenu() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open && settingsButtonRef.current) {
          settingsButtonRef.current.blur();
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          ref={settingsButtonRef}
          className="h-8 px-3 rounded-[8px] flex items-center justify-center gap-1 text-foreground hover:bg-foreground/10 active:bg-foreground/15 data-[state=open]:bg-foreground/10 focus:outline-none transition-all duration-200 cursor-pointer shrink-0"
          aria-label="Settings menu"
        >
          <span className="text-sm font-medium capitalize">
            {user?.email?.split("@")[0] || "User"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-popover border-border"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal py-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground capitalize">
              {user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer gap-2">
            <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Appearance</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border-border">
            <DropdownMenuCheckboxItem
              checked={theme === "system"}
              onCheckedChange={(checked) => {
                if (checked) setTheme("system");
              }}
              onSelect={(e) => e.preventDefault()}
            >
              Use system setting
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={theme === "light"}
              onCheckedChange={(checked) => {
                if (checked) setTheme("light");
              }}
              onSelect={(e) => e.preventDefault()}
            >
              Light
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={theme === "dark"}
              onCheckedChange={(checked) => {
                if (checked) setTheme("dark");
              }}
              onSelect={(e) => e.preventDefault()}
            >
              Dark
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
