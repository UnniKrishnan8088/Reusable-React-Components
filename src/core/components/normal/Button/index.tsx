import { cn } from "@/lib/utils"
import { Loader } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button */
  variant?: ButtonVariant
  /** Size of the button */
  size?: ButtonSize
  /** Shows a spinner and disables the button */
  isLoading?: boolean
  /** Accessible label announced by screen readers while loading */
  loadingText?: string
  /** Icon rendered before the label */
  leftIcon?: ReactNode
  /** Icon rendered after the label */
  rightIcon?: ReactNode
  /** Renders a square button for icon-only use (hides children) */
  iconOnly?: boolean
  /** Stretches the button to fill its container */
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2563eb] text-[#ffffff] hover:bg-[#1d4ed8] focus-visible:ring-[#2563eb]",

  secondary:
    "bg-[#e5e7eb] text-[#111827] hover:bg-[#d1d5db] focus-visible:ring-[#9ca3af]",

  ghost:
    "bg-transparent text-[#111827] hover:bg-[#f3f4f6] hover:text-[#111827] focus-visible:ring-[#e5e7eb]",

  danger:
    "bg-[#dc2626] text-[#ffffff] hover:bg-[#b91c1c] focus-visible:ring-[#dc2626]",
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
}

const ICON_ONLY_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 w-8 p-0",
  md: "h-10 w-10 p-0",
  lg: "h-12 w-12 p-0",
}

const SPINNER_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface SpinnerProps {
  size: ButtonSize
  label: string
  iconOnly: boolean
}

function Spinner({ size, label, iconOnly = false }: SpinnerProps) {
  return (
    <>
      <Loader
        className={cn("shrink-0 animate-spin", SPINNER_SIZE_CLASSES[size])}
        aria-hidden="true"
      />
      {!iconOnly && <span>{label}</span>}
    </>
  )
}

export default function Button({
  variant = "primary",
  size = "sm",
  isLoading = false,
  loadingText = "Loading…",
  leftIcon,
  rightIcon,
  iconOnly = false,
  fullWidth = false,
  disabled,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium",
        "transition-colors duration-150 ease-in-out",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASSES[variant],
        iconOnly ? ICON_ONLY_SIZE_CLASSES[size] : SIZE_CLASSES[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner size={size} label={loadingText} iconOnly={iconOnly} />
        </>
      ) : (
        <>
          {leftIcon && !iconOnly && (
            <span aria-hidden="true" className="shrink-0">
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && !iconOnly && (
            <span aria-hidden="true" className="shrink-0">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  )
}
