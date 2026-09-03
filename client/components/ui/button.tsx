"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_4px_14px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
        default:
          "border-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_4px_14px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
        secondary:
          "border-border/60 bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:border-border hover:-translate-y-0.5 active:translate-y-0 shadow-xs cursor-pointer",
        tertiary:
          "border-transparent bg-secondary/40 text-foreground hover:bg-secondary/80 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer font-medium",
        outline:
          "border-border bg-card hover:bg-secondary text-foreground hover:text-foreground hover:-translate-y-0.5 active:translate-y-0 shadow-xs cursor-pointer",
        ghost:
          "border-transparent hover:bg-secondary/80 text-muted-foreground hover:text-foreground cursor-pointer font-medium",
        danger:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm cursor-pointer hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm cursor-pointer hover:-translate-y-0.5 active:translate-y-0",
        "danger-soft":
          "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
        "destructive-soft":
          "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
        link: "border-transparent text-primary underline-offset-4 hover:underline cursor-pointer",
      },
      size: {
        default: "h-10 gap-2 px-4 py-2 text-sm",
        md: "h-10 gap-2 px-4 py-2 text-sm",
        sm: "h-8 gap-1.5 px-3 text-xs rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 px-6 text-base font-semibold",
        xs: "h-7 gap-1 px-2.5 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3",
        icon: "size-10 rounded-xl p-0",
        "icon-sm": "size-8 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 rounded-xl p-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-7 rounded-md p-0 [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends Omit<ButtonPrimitive.Props, "size">,
    VariantProps<typeof buttonVariants> {
  isIconOnly?: boolean
  isPending?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  fullWidth?: boolean
  onPress?: React.MouseEventHandler<HTMLButtonElement>
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isIconOnly = false,
      isPending = false,
      isLoading = false,
      isDisabled = false,
      fullWidth = false,
      onPress,
      onClick,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const pending = isPending || isLoading
    const effectiveDisabled = isDisabled || disabled || pending

    // Map size if icon only
    let effectiveSize = size
    if (isIconOnly) {
      if (size === "sm" || size === "xs") effectiveSize = "icon-sm"
      else if (size === "lg") effectiveSize = "icon-lg"
      else effectiveSize = "icon"
    }

    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        data-pending={pending ? "true" : undefined}
        disabled={effectiveDisabled}
        onClick={onPress || onClick}
        className={cn(
          buttonVariants({
            variant: variant as VariantProps<typeof buttonVariants>["variant"],
            size: effectiveSize as VariantProps<typeof buttonVariants>["size"],
          }),
          fullWidth && "w-full",
          pending && "pointer-events-none opacity-80",
          className
        )}
        {...props}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin shrink-0" />
            {children}
          </>
        ) : (
          children
        )}
      </ButtonPrimitive>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
