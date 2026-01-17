import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DropdownItem {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

interface SplitButtonProps {
  primaryLabel: string
  primaryLoadingLabel?: string
  isLoading?: boolean
  disabled?: boolean
  onPrimaryClick: () => void
  dropdownItems: DropdownItem[]
  className?: string
}

function SplitButton({
  primaryLabel,
  primaryLoadingLabel,
  isLoading = false,
  disabled = false,
  onPrimaryClick,
  dropdownItems,
  className,
}: SplitButtonProps) {
  const isDisabled = disabled || isLoading
  const displayLabel = isLoading && primaryLoadingLabel ? primaryLoadingLabel : primaryLabel

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {/* Primary button */}
      <button
        type="button"
        onClick={() => {
          console.log("SplitButton: Primary button clicked, disabled:", isDisabled)
          if (!isDisabled) {
            onPrimaryClick()
          }
        }}
        disabled={isDisabled}
        className="px-2.5 py-1 rounded-md bg-secondary text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {displayLabel}
      </button>

      {/* Dropdown trigger - ghost style */}
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isDisabled}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/10 active:bg-foreground/15 data-[state=open]:bg-foreground/10 focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {dropdownItems.map((item, index) => (
            <DropdownMenuItem key={index} onClick={item.onClick}>
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { SplitButton }
export type { SplitButtonProps, DropdownItem }
