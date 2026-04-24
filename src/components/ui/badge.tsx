import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'pepsico' | 'success';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-slate-900 text-white",
    secondary: "border-transparent bg-slate-100 text-slate-900",
    destructive: "border-transparent bg-red-500 text-white",
    outline: "text-slate-900 border-slate-200",
    pepsico: "border-transparent bg-[#004B93] text-white",
    success: "border-transparent bg-emerald-500 text-white",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors uppercase tracking-widest",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
