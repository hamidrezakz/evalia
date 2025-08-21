import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-lg font-bold">ارسال بازخورد</h1>
      <div className="bg-muted/50 rounded-xl p-4 md:p-5 space-y-4">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-1/2 mb-2" />
        <Skeleton className="h-10 w-1/3 mb-2" />
        <Skeleton className="h-10 w-1/4 mb-2" />
      </div>
    </div>
  );
}
