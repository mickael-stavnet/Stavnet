import { Skeleton } from "@/components/ui/skeleton";

export function PersonsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Skeleton className="h-6 w-48 rounded-full bg-white/65" />
        <Skeleton className="h-6 w-48 rounded-full bg-white/65" />
      </div>
      <div className="overflow-hidden rounded-[8px] border border-[#9aa8b0] bg-[#d8dde2] shadow-[4px_4px_8px_rgba(0,0,0,0.12)]">
        <div className="space-y-3 p-3 md:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border-b border-[#b1bac0] px-1 py-3 last:border-b-0">
              <Skeleton className="h-5 w-52 bg-white/75" />
              <Skeleton className="mt-2 h-4 w-24 bg-white/60" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Skeleton className="h-11 w-full bg-white/60" />
                <Skeleton className="h-11 w-full bg-white/60" />
              </div>
              <Skeleton className="mt-3 h-4 w-20 bg-[#fff68f]/80" />
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          <div className="grid min-w-[1260px] grid-cols-[2.45fr_1.4fr_1.35fr_0.72fr_0.78fr_0.82fr_0.8fr_0.82fr_0.8fr_0.92fr] border-b border-[#9aa8b0] bg-[#fff68f] p-0">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="border-r border-[#9aa8b0] px-3 py-[9px] last:border-r-0">
                <Skeleton className="h-3 w-full bg-black/10" />
              </div>
            ))}
          </div>
          <div className="overflow-auto">
            {Array.from({ length: 15 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid min-w-[1260px] grid-cols-[2.45fr_1.4fr_1.35fr_0.72fr_0.78fr_0.82fr_0.8fr_0.82fr_0.8fr_0.92fr] border-b border-[#b1bac0] last:border-b-0"
              >
                {Array.from({ length: 10 }).map((__, columnIndex) => (
                  <div key={columnIndex} className="border-r border-[#b1bac0] px-3 py-[15px] last:border-r-0">
                    <Skeleton className={`h-4 bg-white/60 ${columnIndex === 0 ? "w-[78%]" : "w-full"}`} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-4 w-56 bg-white/60" />
        <Skeleton className="h-8 w-80 rounded-[8px] bg-[#fff6a8]/85" />
      </div>
    </div>
  );
}
