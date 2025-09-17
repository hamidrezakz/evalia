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
import { useOptionSets } from "../../../api/hooks";

interface OptionSetComboboxProps {
  value: number | null;
  onChange: (id: number | null, item?: { id: number; name: string }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const OptionSetCombobox: React.FC<OptionSetComboboxProps> = ({
  value,
  onChange,
  placeholder = "انتخاب دسته گزینه‌ها...",
  disabled,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const { data, isLoading } = useOptionSets({ search });
  const sets = data?.data || [];
  const selected = sets.find((s) => s.id === value) || null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between w-full", className)}
          disabled={disabled || isLoading}>
          <span className="flex items-center gap-2 truncate">
            <ListChecks className="w-4 h-4 text-muted-foreground" />
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDownIcon className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="جستجوی دسته..."
            value={search}
            onValueChange={(v) => setSearch(v)}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "در حال بارگذاری..." : "موردی یافت نشد"}
            </CommandEmpty>
            <CommandGroup>
              {sets.map((s) => (
                <CommandItem
                  key={s.id}
                  value={String(s.id)}
                  onSelect={() => {
                    const next = s.id === value ? null : s.id;
                    onChange(next, next ? s : undefined);
                    setOpen(false);
                  }}>
                  <div className="flex w-full flex-row justify-between items-center">
                    <span className="truncate flex-1">{s.name}</span>
                    <span className="flex-shrink-0">
                      <CheckIcon
                        className={cn(
                          "ml-2 h-4 w-4",
                          value === s.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
