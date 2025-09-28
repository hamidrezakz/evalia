"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon, ListChecks } from "lucide-react";

export type ComboboxKey = string | number;

export interface ComboboxProps<T> {
  items: T[];
  value: ComboboxKey | null;
  onChange: (value: ComboboxKey | null, item?: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // Accessors
  getKey?: (item: T) => ComboboxKey;
  getLabel?: (item: T) => string;
  // Search
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filter?: (item: T, search: string) => boolean;
  // Icons
  leadingIcon?: React.ComponentType<{ className?: string }>;
  trailingIcon?: React.ComponentType<{ className?: string }>;
  // States
  emptyText?: string;
  loading?: boolean;
  /** Custom renderer for each dropdown item (advanced). Responsible only for the main body – check icon is appended automatically. */
  renderItem?: (ctx: { item: T; selected: boolean }) => React.ReactNode;
  /** Custom renderer for the selected value (inside the trigger button). */
  renderValue?: (ctx: { item: T }) => React.ReactNode;
}

function defaultKey<T extends Record<string, unknown>>(it: T): ComboboxKey {
  if (typeof it.id === "number" || typeof it.id === "string")
    return it.id as ComboboxKey;
  if (typeof it.value === "string" || typeof it.value === "number")
    return it.value as ComboboxKey;
  if (typeof it.code === "string") return it.code as ComboboxKey;
  return JSON.stringify(it);
}
function defaultLabel<T extends Record<string, unknown>>(it: T): string {
  if (typeof it.label === "string") return it.label as string;
  if (typeof it.name === "string") return it.name as string;
  if (typeof it.title === "string") return it.title as string;
  if (typeof it.text === "string") return it.text as string;
  if (typeof it.value === "string") return it.value as string;
  return String(defaultKey(it));
}

export function Combobox<T>(props: ComboboxProps<T>) {
  const {
    items,
    value,
    onChange,
    placeholder = "انتخاب کنید...",
    disabled,
    className,
    getKey,
    getLabel,
    searchable = true,
    searchValue,
    onSearchChange,
    filter,
    leadingIcon: LeadingIcon = ListChecks,
    trailingIcon: TrailingIcon = ChevronsUpDownIcon,
    emptyText = "موردی یافت نشد",
    loading,
    renderItem,
    renderValue,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [localSearch, setLocalSearch] = React.useState("");

  const labelOf = React.useCallback(
    (it: T) => {
      return getLabel ? getLabel(it) : defaultLabel(it as any);
    },
    [getLabel]
  );
  const keyOf = React.useCallback(
    (it: T) => {
      return getKey ? getKey(it) : defaultKey(it as any);
    },
    [getKey]
  );

  const selectedItem = React.useMemo(
    () => items.find((it) => keyOf(it) === value) || null,
    [items, keyOf, value]
  );
  const search = searchValue != null ? searchValue : localSearch;

  const filtered = React.useMemo(() => {
    if (!searchable) return items;
    const q = (search || "").toLowerCase();
    if (filter) return items.filter((it) => filter(it, q));
    return items.filter((it) => {
      const lbl = labelOf(it);
      const hay = (lbl ?? "").toString().toLowerCase();
      return hay.includes(q);
    });
  }, [items, search, searchable, filter, labelOf]);

  const setSearch = (val: string) => {
    if (onSearchChange) onSearchChange(val);
    else setLocalSearch(val);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between w-full", className)}
          disabled={disabled || !!loading}>
          <span className="flex items-center gap-2 truncate">
            {LeadingIcon ? (
              <LeadingIcon className="w-4 h-4 text-muted-foreground" />
            ) : null}
            {selectedItem ? (
              <span suppressHydrationWarning>
                {renderValue
                  ? renderValue({ item: selectedItem })
                  : labelOf(selectedItem)}
              </span>
            ) : (
              <span suppressHydrationWarning>{placeholder}</span>
            )}
          </span>
          {TrailingIcon ? (
            <TrailingIcon className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start">
        <Command shouldFilter={false}>
          {searchable ? (
            <CommandInput
              placeholder="جستجو..."
              value={search}
              onValueChange={setSearch}
            />
          ) : null}
          <CommandList>
            <CommandEmpty>
              {loading ? "در حال بارگذاری..." : emptyText}
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((it) => {
                const k = keyOf(it);
                const selected = k === value;
                return (
                  <CommandItem
                    key={String(k)}
                    value={String(k)}
                    onSelect={() => {
                      const next = selected ? null : k;
                      onChange(next, selected ? undefined : it);
                      setOpen(false);
                    }}>
                    {renderItem ? (
                      <div className="flex w-full flex-row justify-between items-center">
                        <div className="flex-1 min-w-0 truncate">
                          {renderItem({ item: it, selected })}
                        </div>
                        <span className="flex-shrink-0">
                          <CheckIcon
                            className={cn(
                              "ml-2 h-4 w-4",
                              selected ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </span>
                      </div>
                    ) : (
                      <div className="flex w-full flex-row justify-between items-center">
                        <span className="truncate flex-1">{labelOf(it)}</span>
                        <span className="flex-shrink-0">
                          <CheckIcon
                            className={cn(
                              "ml-2 h-4 w-4",
                              selected ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </span>
                      </div>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default Combobox;
