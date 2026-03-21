import { Button as ShadcnButton } from "@/components/ui/button"
import { Loader } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export interface ButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  isLoading?: boolean
  loadingText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  iconOnly?: boolean
}

export default function Button({
  isLoading = false,
  loadingText = "Loading…",
  leftIcon,
  rightIcon,
  iconOnly = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <ShadcnButton
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn("flex items-center gap-1", className)}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader className="shrink-0 animate-spin" aria-hidden="true" />
          {!iconOnly && <span>{loadingText}</span>}
        </>
      ) : (
        <>
          {!iconOnly && leftIcon && (
            <span aria-hidden="true" className="shrink-0">
              {leftIcon}
            </span>
          )}
          {children}
          {!iconOnly && rightIcon && (
            <span aria-hidden="true" className="shrink-0">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </ShadcnButton>
  )
}
