import { Skeleton } from "@/components/ui/skeleton";

export function OrgsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Skeleton className="h-6 w-44 bg-white/55" />
        <Skeleton className="h-6 w-44 bg-white/55" />
      </div>
      <div className="overflow-hidden rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
        <div className="space-y-3 p-3 md:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border-b border-[#b1bac0] px-1 py-3 last:border-b-0">
              <Skeleton className="h-5 w-44 bg-white/70" />
              <Skeleton className="mt-2 h-4 w-24 bg-white/55" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Skeleton className="h-11 w-full bg-white/55" />
                <Skeleton className="h-11 w-full bg-white/55" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden p-3 md:block">
          <Skeleton className="h-[470px] w-full bg-white/55" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-4 w-52 bg-white/55" />
        <Skeleton className="h-8 w-80 bg-white/55" />
      </div>
    </div>
  );
}
