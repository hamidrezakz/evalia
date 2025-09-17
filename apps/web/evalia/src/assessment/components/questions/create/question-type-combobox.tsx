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
import { CheckIcon, ChevronsUpDownIcon, HelpCircle } from "lucide-react";
import { QuestionTypeEnum } from "@/lib/enums";

interface QuestionTypeComboboxProps {
  value: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const QuestionTypeCombobox: React.FC<QuestionTypeComboboxProps> = ({
  value,
  onChange,
  placeholder = "نوع سوال...",
  disabled,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const all = QuestionTypeEnum.options();
  const filtered = search
    ? all.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          o.rawLabel.toLowerCase().includes(search.toLowerCase())
      )
    : all;
  const selected = all.find((o) => o.value === value) || null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between w-full", className)}
          disabled={disabled}>
          <span className="flex items-center gap-2 truncate">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDownIcon className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start">
        <Command>
          <CommandInput
            placeholder="جستجوی نوع..."
            value={search}
            onValueChange={(v) => setSearch(v)}
          />
          <CommandList>
            <CommandEmpty>موردی یافت نشد</CommandEmpty>
            <CommandGroup>
              {filtered.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.value}
                  onSelect={() => {
                    const next = o.value === value ? null : (o.value as any);
                    onChange(next);
                    setOpen(false);
                  }}>
                  <div className="flex w-full flex-row justify-between items-center">
                    <span className="truncate flex-1">{o.label}</span>
                    <span className="flex-shrink-0">
                      <CheckIcon
                        className={cn(
                          "ml-2 h-4 w-4",
                          value === o.value ? "opacity-100" : "opacity-0"
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
