import { Skeleton } from "@/components/ui/skeleton";

export function OrgDetailSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-32 bg-[#ffea56]/70" />
        ))}
      </div>
      <div className="rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] p-3 shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <Skeleton className="h-[246px] w-full bg-white/50" />
          <Skeleton className="h-[246px] w-full bg-white/50" />
        </div>
        <Skeleton className="mt-3 h-[194px] w-full bg-white/50" />
      </div>
    </div>
  );
}
