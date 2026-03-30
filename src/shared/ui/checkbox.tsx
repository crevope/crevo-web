"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer w-4 h-4 shrink-0 rounded-[4px] border border-gray-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] transition-colors cursor-pointer",
        "data-checked:bg-[#0A192F] data-checked:border-[#0A192F]",
        "dark:data-checked:bg-[#D4AF37] dark:data-checked:border-[#D4AF37]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]/30 dark:focus-visible:ring-[#D4AF37]/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "flex items-center justify-center",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white dark:text-[#0A192F]">
        <CheckIcon className="w-3 h-3 stroke-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
