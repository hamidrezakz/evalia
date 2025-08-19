//handy
import * as React from "react";

import { cn } from "@/lib/utils";

function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn(
        "bg-muted/60 dark:bg-muted/50 text-card-foreground flex flex-col gap-6 rounded-xl py-5",
        className
      )}
      {...props}
    />
  );
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn(
        "@container/panel-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 has-data-[slot=panel-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function PanelTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function PanelDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function PanelAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-content"
      className={cn("px-5 text-sm", className)}
      {...props}
    />
  );
}

function PanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-footer"
      className={cn("flex items-center px-5 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Panel,
  PanelHeader,
  PanelFooter,
  PanelTitle,
  PanelAction,
  PanelDescription,
  PanelContent,
};
