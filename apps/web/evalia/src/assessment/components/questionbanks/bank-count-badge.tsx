import React from "react";
import { motion } from "motion/react";
import { popIn } from "@/lib/motion/presets";
import { useQuestionBankCount } from "../../api/hooks";
import { Badge } from "@/components/ui/badge";

interface BankCountBadgeProps {
  bankId: number;
  className?: string;
}

export const BankCountBadge: React.FC<BankCountBadgeProps> = ({
  bankId,
  className,
}) => {
  const { data, isLoading } = useQuestionBankCount(bankId);
  const value = data?.questionsCount ?? 0;
  return (
    <motion.span
      key={isLoading ? "loading" : String(value)}
      {...popIn}
      className={className}
      aria-label={isLoading ? "در حال بارگذاری" : `تعداد سوالات: ${value}`}>
      <Badge
        variant="secondary"
        className="min-w-[1.75rem] h-5 px-1 text-[10px] leading-[18px] font-medium inline-flex items-center justify-center">
        {isLoading ? "…" : value.toLocaleString("fa-IR")}
      </Badge>
    </motion.span>
  );
};
