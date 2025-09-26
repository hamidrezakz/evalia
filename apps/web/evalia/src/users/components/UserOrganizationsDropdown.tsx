"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Shield, ChevronDown } from "lucide-react";
import { OrgRoleEnum } from "@/lib/enums";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
import { cn } from "@/lib/utils";

export interface UserOrganizationsDropdownProps {
  orgs: Array<{ orgId: number; roles: string[] }>;
  className?: string;
}

export function UserOrganizationsDropdown({
  orgs,
  className,
}: UserOrganizationsDropdownProps) {
  const count = orgs?.length || 0;
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };
  const handleMouseLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  if (count === 0) {
    return (
      <Button variant="outline" size="sm" className={className} disabled>
        بدون سازمان
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("inline-flex items-center gap-1", className)}
            aria-expanded={open}>
            <Building2 className="h-4 w-4 ms-1" />
            <span className="text-xs">عضویت در {count} سازمان</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                open ? "rotate-180" : "rotate-0"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-64" sideOffset={6}>
          <DropdownMenuLabel>سازمان‌های عضو</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {orgs.map((o) => (
            <DropdownMenuItem key={o.orgId} className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex flex-col text-[12px]">
                <span className="font-medium">
                  <OrgName orgId={o.orgId} />
                </span>
                {o.roles?.length ? (
                  <span className="flex flex-wrap gap-1 mt-1">
                    {o.roles.map((r, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px]">
                        <Shield className="h-3 w-3" /> {OrgRoleEnum.t(r as any)}
                      </span>
                    ))}
                  </span>
                ) : null}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
}

export default UserOrganizationsDropdown;

function OrgName({ orgId }: { orgId: number }) {
  const { data } = useOrganization(orgId);
  return <>{data?.name || `سازمان #${orgId}`}</>;
}
