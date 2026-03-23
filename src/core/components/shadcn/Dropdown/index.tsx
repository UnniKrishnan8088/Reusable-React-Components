/**
 * SearchableDropdown
 *
 * A fully accessible, type-safe, reusable combobox/dropdown component.
 * Supports single and multi-select, async loading, custom rendering,
 * sizes, variants, and error states.
 *
 * @example — Single select
 * <SearchableDropdown
 *   items={countries}
 *   value={selected}
 *   onChange={setSelected}
 *   getItemLabel={(item) => item.label}
 *   getItemValue={(item) => item.code}
 * />
 *
 * @example — Multi select
 * <SearchableDropdown
 *   multiple
 *   items={countries}
 *   value={selected}        // string[]
 *   onChange={setSelected}  // (values: string[]) => void
 *   getItemLabel={(item) => item.label}
 *   getItemValue={(item) => item.code}
 *   maxCount={3}
 * />
 */

import React, { useId } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Loader2, AlertCircle, ChevronDown, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DropdownSize = "sm" | "md" | "lg";
export type DropdownVariant = "outline" | "ghost" | "filled";

/** Shared props that apply to both single and multi select. */
interface SearchableDropdownBaseProps<T = unknown> {
  /** The list of items to display. */
  items: T[];

  /**
   * Extracts a human-readable label from an item.
   * @default (item) => String(item)
   */
  getItemLabel?: (item: T) => string;

  /**
   * Extracts a unique string key/value from an item.
   * @default (item) => String(item)
   */
  getItemValue?: (item: T) => string;

  /**
   * Optionally render custom content inside each list item.
   * Falls back to `getItemLabel` when omitted.
   */
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode;

  /** Placeholder shown in the trigger when nothing is selected. */
  placeholder?: string;

  /** Placeholder inside the search input. */
  searchPlaceholder?: string;

  /** Message shown when the filtered list is empty. */
  emptyMessage?: string;

  /** When true, the trigger and input are non-interactive. */
  disabled?: boolean;

  /** Shows a spinner inside the trigger and disables interaction. */
  isLoading?: boolean;

  /** When provided, renders an error message below the trigger. */
  errorMessage?: string;

  /** Controls the visual weight of the trigger button. */
  variant?: DropdownVariant;

  /** Controls the height / text size of the trigger button. */
  size?: DropdownSize;

  /**
   * Width class applied to the trigger and popover.
   * Accepts any Tailwind width utility, e.g. "w-64", "w-full".
   * @default "w-64"
   */
  width?: string;

  /** Additional class names forwarded to the trigger button. */
  className?: string;

  /** Accessible label for the dropdown (used when no visible label exists). */
  "aria-label"?: string;

  /** Associates the dropdown with a visible `<label>` element. */
  "aria-labelledby"?: string;

  /** Associates a description element with the dropdown. */
  "aria-describedby"?: string;

  /** Whether the field is required. */
  required?: boolean;

  /** Ref forwarded to the trigger button (React 19 ref-as-prop). */
  ref?: React.Ref<HTMLButtonElement>;
}

/** Single-select variant. */
export interface SingleSelectProps<T = unknown>
  extends SearchableDropdownBaseProps<T> {
  multiple?: false;
  /** Currently selected value. Pass `null` for no selection. */
  value: string | null;
  /** Called with the newly selected value, or `null` when cleared. */
  onChange: (value: string | null) => void;
}

/** Multi-select variant. */
export interface MultiSelectProps<T = unknown>
  extends SearchableDropdownBaseProps<T> {
  multiple: true;
  /** Currently selected values. */
  value: string[];
  /** Called with the full updated selection array. */
  onChange: (value: string[]) => void;
  /**
   * Max number of selected pills shown in the trigger before collapsing
   * to a "+N more" badge. Set to `0` to always show all.
   * @default 3
   */
  maxCount?: number;
}

export type SearchableDropdownProps<T = unknown> =
  | SingleSelectProps<T>
  | MultiSelectProps<T>;

// ---------------------------------------------------------------------------
// Size & variant maps
// ---------------------------------------------------------------------------

const sizeClasses: Record<DropdownSize, string> = {
  sm: "h-8 px-2 text-xs",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};

const variantMap: Record<DropdownVariant, "outline" | "ghost" | "secondary"> = {
  outline: "outline",
  ghost: "ghost",
  filled: "secondary",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Pill shown for each selected value in multi-select mode. */
function SelectionPill({
  label,
  onRemove,
  disabled,
}: {
  label: string;
  onRemove: (e: React.MouseEvent) => void;
  disabled: boolean;
}) {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-normal"
    >
      <span className="max-w-[80px] truncate">{label}</span>
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SearchableDropdown<T = unknown>(
  props: SearchableDropdownProps<T>
) {
  const {
    items,
    getItemLabel = (item: T) => String(item),
    getItemValue = (item: T) => String(item),
    renderItem,
    placeholder = "Select an option",
    searchPlaceholder = "Search…",
    emptyMessage = "No items found.",
    disabled = false,
    isLoading = false,
    errorMessage,
    variant = "outline",
    size = "md",
    width = "w-64",
    className,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    required = false,
    ref,
  } = props;

  const isMultiple = props.multiple === true;
  const errorId = useId();
  const isInteractive = !disabled && !isLoading;

  const comboboxItems = items.map((item) => ({
    label: getItemLabel(item),
    value: getItemValue(item),
    raw: item,
  }));

  // Normalise to a Set for O(1) selected lookups
  const selectedSet = isMultiple
    ? new Set(props.value)
    : new Set(props.value ? [props.value] : []);

  const describedBy =
    [ariaDescribedby, errorMessage ? errorId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  // ---- Single-select handler ----
  function handleSingleChange(val: string | null) {
    if (!isMultiple) {
      (props as SingleSelectProps<T>).onChange(val === "" ? null : val);
    }
  }

  // ---- Multi-select: toggle an item in/out of the selection ----
  function handleMultiToggle(val: string) {
    if (!isMultiple) return;
    const current = (props as MultiSelectProps<T>).value;
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    (props as MultiSelectProps<T>).onChange(next);
  }

  // ---- Multi-select: remove a single pill ----
  function handleRemovePill(val: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!isMultiple) return;
    const current = (props as MultiSelectProps<T>).value;
    (props as MultiSelectProps<T>).onChange(current.filter((v) => v !== val));
  }

  // ---- Multi-select: clear all ----
  function handleClearAll(e: React.MouseEvent) {
    e.stopPropagation();
    if (isMultiple) {
      (props as MultiSelectProps<T>).onChange([]);
    }
  }

  // ---- Trigger label for multi-select ----
  const maxCount = isMultiple ? ((props as MultiSelectProps<T>).maxCount ?? 3) : 0;

  const selectedValues = isMultiple ? (props as MultiSelectProps<T>).value : [];

  const visiblePills =
    maxCount > 0 ? selectedValues.slice(0, maxCount) : selectedValues;

  const overflowCount =
    maxCount > 0 ? Math.max(0, selectedValues.length - maxCount) : 0;

  // ---- Trigger content ----
  function renderTriggerContent() {
    if (isLoading) {
      return (
        <span className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading…
        </span>
      );
    }

    if (!isMultiple) {
      return <ComboboxValue placeholder={placeholder} />;
    }

    if (selectedValues.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    return (
      <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">
        {visiblePills.map((val) => {
          const found = comboboxItems.find((i) => i.value === val);
          return (
            <SelectionPill
              key={val}
              label={found?.label ?? val}
              disabled={!isInteractive}
              onRemove={(e) => handleRemovePill(val, e)}
            />
          );
        })}
        {overflowCount > 0 && (
          <Badge variant="secondary" className="px-1.5 py-0.5 text-xs font-normal">
            +{overflowCount} more
          </Badge>
        )}
      </div>
    );
  }

  // ---- Shared trigger button ----
  const triggerButton = (
    <Button
      ref={ref}
      variant={variantMap[variant]}
      disabled={!isInteractive}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={describedBy}
      aria-required={required}
      aria-invalid={!!errorMessage}
      aria-multiselectable={isMultiple}
      className={cn(
        width,
        "justify-between font-normal",
        // Allow the trigger to grow taller when pills wrap
        isMultiple && selectedValues.length > 0 ? "h-auto min-h-10 py-1.5" : sizeClasses[size],
        errorMessage &&
          "border-destructive ring-1 ring-destructive focus-visible:ring-destructive",
        className
      )}
    >
      {renderTriggerContent()}

      <div className="ml-2 flex shrink-0 items-center gap-1">
        {/* Clear-all button for multi-select */}
        {isMultiple && selectedValues.length > 0 && isInteractive && (
          <button
            type="button"
            onClick={handleClearAll}
            aria-label="Clear all selections"
            className="rounded-full p-0.5 text-muted-foreground outline-none ring-offset-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
      </div>
    </Button>
  );

  // ---------------------------------------------------------------------------
  // Single-select render
  // ---------------------------------------------------------------------------
  if (!isMultiple) {
    return (
      <div className="flex flex-col gap-1">
        <Combobox
          items={comboboxItems}
          value={(props as SingleSelectProps<T>).value ?? ""}
          onValueChange={(val: string | null) => handleSingleChange(val)}
          disabled={!isInteractive}
        >
          <ComboboxTrigger render={triggerButton} />
          <ComboboxContent className={width}>
            <ComboboxInput
              showTrigger={false}
              placeholder={searchPlaceholder}
              aria-label={`Search ${ariaLabel ?? "options"}`}
            />
            <ComboboxEmpty role="status" aria-live="polite">
              {emptyMessage}
            </ComboboxEmpty>
            <ComboboxList>
              {(item: (typeof comboboxItems)[number]) => (
                <ComboboxItem key={item.value} value={item.value}>
                  {renderItem
                    ? renderItem(item.raw, selectedSet.has(item.value))
                    : item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {errorMessage && <ErrorMessage id={errorId} message={errorMessage} />}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Multi-select render
  // Multi-select is fully self-managed: the Combobox stays open after each
  // pick and we toggle the item in/out of the selection array ourselves.
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-1">
      <Combobox
        items={comboboxItems}
        // Keep value uncontrolled / empty so Combobox doesn't close on pick
        value=""
        onValueChange={(val: string | null) => {
          if (val) handleMultiToggle(val);
        }}
        disabled={!isInteractive}
      >
        <ComboboxTrigger render={triggerButton} />
        <ComboboxContent className={width}>
          <ComboboxInput
            showTrigger={false}
            placeholder={searchPlaceholder}
            aria-label={`Search ${ariaLabel ?? "options"}`}
          />
          <ComboboxEmpty role="status" aria-live="polite">
            {emptyMessage}
          </ComboboxEmpty>
          <ComboboxList>
            {(item: (typeof comboboxItems)[number]) => {
              const isSelected = selectedSet.has(item.value);
              return (
                <ComboboxItem
                  key={item.value}
                  value={item.value}
                  // Communicate checked state to assistive tech
                  aria-selected={isSelected}
                  className={cn(
                    "flex items-center justify-between gap-2",
                    isSelected && "bg-accent"
                  )}
                >
                  {renderItem
                    ? renderItem(item.raw, isSelected)
                    : item.label}
                  {/* Checkmark for visual feedback */}
                  {isSelected && (
                    <Check
                      className="h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {errorMessage && <ErrorMessage id={errorId} message={errorMessage} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared error message sub-component
// ---------------------------------------------------------------------------

function ErrorMessage({ id, message }: { id: string; message: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1 text-xs text-destructive"
    >
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export default SearchableDropdown;