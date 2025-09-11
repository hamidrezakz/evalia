import * as React from "react";

export interface AppPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
  gutterWidth?: string; // e.g. "2.5rem"
  patternColor?: string; // e.g. "var(--color-black)"
  patternColorDark?: string; // e.g. "var(--color-white)"
  patternOpacity?: string; // e.g. "/5"
  patternOpacityDark?: string; // e.g. "/10"
}

/**
 * AppPageLayout
 * ساختار حرفه‌ای صفحه با grid، gutter و پس‌زمینه pattern کناری
 * children به عنوان main صفحه رندر می‌شود
 */
export function AppPageLayout({
  children,
  className = "",
  mainClassName = "w-full flex flex-col items-center space-y-8 md:space-y-16",
}: AppPageLayoutProps) {
  return (
    <div className="max-w-screen overflow-x-hidden">
      <div
        className={[
          "grid min-h-dvh grid-cols-1 grid-rows-1 justify-center pt-14.25 [--gutter-width:2.5rem] md:-mx-4 md:grid-cols-[var(--gutter-width)_minmax(0,var(--breakpoint-2xl))_var(--gutter-width)] lg:mx-0",
          className,
        ].join(" ")}>
        {/* Pattern right */}
        <div
          className={[
            "row-span-full row-start-1 hidden border-x border-x-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:block dark:[--pattern-fg:var(--color-white)]/10 md:col-start-1",
          ].join(" ")}></div>
        {/* Main content */}
        <main className={mainClassName}>{children}</main>
        {/* Pattern left */}
        <div
          className={[
            "row-span-full row-start-1 hidden border-x border-x-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:col-start-3 md:block dark:[--pattern-fg:var(--color-white)]/10",
          ].join(" ")}></div>
      </div>
    </div>
  );
}

export default AppPageLayout;
