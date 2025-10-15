import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { MessageSquare, Users, User, Cpu } from "lucide-react";
import { ResponsePerspectiveEnum, type ResponsePerspective } from "@/lib/enums";
import type { ReactNode } from "react";

const ICONS: Record<ResponsePerspective, ReactNode> = {
  SELF: <User />,
  FACILITATOR: <MessageSquare />,
  PEER: <Users />,
  MANAGER: <User />,
  SYSTEM: <Cpu />,
};

const COLORS: Record<ResponsePerspective, string> = {
  SELF: "sky",
  FACILITATOR: "violet",
  PEER: "teal",
  MANAGER: "amber",
  SYSTEM: "zinc",
};

export function ResponsePerspectiveBadge({
  value,
  tone = "soft",
  size = "xs",
  className,
}: { value: ResponsePerspective } & BadgeStyleOptions) {
  const color = COLORS[value] || "zinc";
  return (
    <span className={composeBadgeClass(color, { tone, size, className })}>
      {ICONS[value]}
      {ResponsePerspectiveEnum.t(value)}
    </span>
  );
}

export function ResponsePerspectiveBadgeGroup({
  values,
  tone = "soft",
  size = "xs",
  className,
}: { values: ResponsePerspective[] } & BadgeStyleOptions) {
  if (!values || values.length === 0) return null;
  return (
    <span className="flex items-center gap-1 flex-wrap">
      {values.map((v) => (
        <ResponsePerspectiveBadge key={v} value={v} tone={tone} size={size} />
      ))}
    </span>
  );
}
