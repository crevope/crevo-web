import { cn } from "@/shared/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-gray-100 dark:bg-white/5", className)}
      {...props}
    />
  )
}

export { Skeleton }
