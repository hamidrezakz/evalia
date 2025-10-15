import React from "react";
import { motion } from "motion/react";
import { popIn } from "@/lib/motion/presets";
import { useQuestionBankCount } from "../../api/hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { Badge } from "@/components/ui/badge";

interface BankCountBadgeProps {
  bankId: number;
  className?: string;
}

export const BankCountBadge: React.FC<BankCountBadgeProps> = ({
  bankId,
  className,
}) => {
  const { activeOrganizationId } = useOrgState();
  const { data, isLoading } = useQuestionBankCount(
    activeOrganizationId,
    bankId
  );
  const value = data?.questionsCount ?? 0;
  return (
    <motion.span
      key={isLoading ? "loading" : String(value)}
      {...popIn}
      className={className}
      aria-label={isLoading ? "در حال بارگذاری" : `تعداد سوالات: ${value}`}>
      <Badge variant="secondary" className="text-[10px]">
        {isLoading ? "…" : value.toLocaleString("fa-IR")}
        <span>سوال</span>
      </Badge>
    </motion.span>
  );
};
