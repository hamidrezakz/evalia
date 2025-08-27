import * as React from "react";
import { cn } from "@/lib/utils";

export type PageSectionProps = React.ComponentProps<"section"> & {
  container?: boolean;
};

/**
 * صفحه‌سکشن ساده و استاندارد برای بخش‌بندی صفحات عمومی
 * - container: اگر true باشد عرض را محدود و وسط‌چین می‌کند
 * - بقیه props مستقیماً روی <section> اعمال می‌شود
 */
export function PageSection({
  className,
  container = true,
  children,
  ...props
}: PageSectionProps) {
  return (
    <section
      className={cn("py-8 md:py-12", container && "container", className)}
      {...props}>
      {children ?? (
        <div className="text-muted-foreground text-sm">
          اینجا محتوای سکشن را قرار دهید…
        </div>
      )}
    </section>
  );
}
