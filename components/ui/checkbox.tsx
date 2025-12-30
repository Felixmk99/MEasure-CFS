"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, ...props }, ref) => {
        return (
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    ref={ref}
                    className={cn(
                        "peer h-4 w-4 shrink-0 rounded-sm border border-muted-foreground/30 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-muted/30 checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer",
                        className
                    )}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    {...props}
                />
                <Check className="absolute h-3 w-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 transition-opacity" />
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
