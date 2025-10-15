import * as React from "react";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { Phone } from "lucide-react";
import { formatIranPhone } from "@/lib/utils";

export interface PhoneBadgeProps extends BadgeStyleOptions {
  phone?: string | null | undefined;
  /**
   * If true, clicking opens the dialer using tel:+98...
   * Defaults to true.
   */
  clickable?: boolean;
  /**
   * Override displayed label; when omitted, formatted phone is shown.
   */
  label?: string;
}

/**
 * PhoneBadge
 * - Formats Iranian phone numbers consistently
 * - Shows a phone icon
 * - Optionally clickable to open the dialer (tel:)
 * - Uses composeBadgeClass for consistent badge styling
 */
export function PhoneBadge({
  phone,
  tone = "soft",
  size = "xs",
  className,
  clickable = true,
  label,
}: PhoneBadgeProps) {
  if (!phone) return null;
  const normalized = String(phone).trim();
  const formatted = formatIranPhone(normalized);
  const color = "teal"; // choose a fresh but readable color for contact info

  const content = (
    <span className={composeBadgeClass(color, { tone, size, className })}>
      <Phone />
      {label ?? formatted}
    </span>
  );

  if (!clickable) return content;

  // Ensure tel: has a + prefix; if missing, best-effort prepend +
  const telHref = normalized.startsWith("+") ? normalized : `+${normalized}`;

  return (
    <a
      href={`tel:${telHref}`}
      onClick={(e) => {
        // do nothing special; allow default tel handler
      }}
      className="inline-flex"
      dir="ltr">
      {content}
    </a>
  );
}

export default PhoneBadge;
