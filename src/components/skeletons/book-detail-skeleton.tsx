import { Skeleton } from "@/components/ui/skeleton";

export function BookDetailSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 md:mx-0 md:grid md:grid-cols-[92px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[10px] md:overflow-visible md:px-0 md:pb-0">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            className={index === 0 ? "h-11 min-w-[128px] shrink-0 rounded-t-[8px] bg-[#91d3ea] md:h-[58px] md:min-w-0" : "h-11 min-w-[128px] shrink-0 rounded-t-[8px] bg-[#ffea56]/85 md:h-[52px] md:min-w-0"}
          />
        ))}
      </div>

      <div className="mt-[2px] flex min-h-[420px] min-w-0 flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[660px] md:flex-row">
        <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[128px] md:border-b-0 md:border-r">
          <Skeleton className="h-6 w-[84px] bg-white/50" />
          <Skeleton className="mt-2 h-5 w-[96px] bg-white/50" />
        </aside>

        <div className="min-w-0 flex-1 px-3 py-3 md:px-[16px] md:py-[10px]">
          <div className="grid h-full gap-y-[14px] md:grid-rows-[auto_auto_auto_1fr]">
            <section className="border border-[#7aa8b7] bg-[#a7dcee]">
              <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px]">
                <Skeleton className="h-3 w-[164px] bg-[#efe6ab]" />
              </div>
              <div className="border-b border-[#7aa8b7] px-2 py-3">
                <Skeleton className="h-6 w-[72%] bg-white/55" />
              </div>
              <div className="grid md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className={index < 2 ? "border-b border-[#7aa8b7] md:border-b-0 md:border-r" : "border-b border-[#7aa8b7] md:border-b-0"}>
                    <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px]">
                      <Skeleton className="h-3 w-[120px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-2 py-3">
                      <Skeleton className="h-6 w-[78%] bg-white/55" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-[14px]">
              {Array.from({ length: 3 }).map((_, sectionIndex) => (
                <section key={sectionIndex} className="border border-[#7aa8b7] bg-[#a7dcee]">
                  <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px]">
                    <Skeleton className="h-3 w-[168px] bg-[#efe6ab]" />
                  </div>
                  <div className="hidden md:block">
                    <div className="grid min-w-[520px] grid-cols-3 border-b border-[#7aa8b7]">
                      {Array.from({ length: 3 }).map((__, columnIndex) => (
                        <div key={columnIndex} className="border-r border-[#7aa8b7] px-2 py-3 last:border-r-0">
                          <Skeleton className="h-5 w-[72%] bg-white/55" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 p-3 md:hidden">
                    {Array.from({ length: 2 }).map((__, rowIndex) => (
                      <div key={rowIndex} className="rounded-[4px] border border-[#7aa8b7] bg-[#b2e0ef] p-3">
                        <Skeleton className="h-4 w-[78%] bg-white/55" />
                        <Skeleton className="mt-3 h-4 w-[54%] bg-white/55" />
                        <Skeleton className="mt-3 h-4 w-[48%] bg-white/55" />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <section className="border border-[#7aa8b7] bg-[#a7dcee]">
              <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px]">
                <Skeleton className="h-3 w-[188px] bg-[#efe6ab]" />
              </div>
              <div className="px-2 py-3">
                <Skeleton className="h-6 w-[84%] bg-white/55" />
              </div>
            </section>

            <div className="grid gap-[12px] self-end sm:grid-cols-2 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <section key={index} className="border border-[#7aa8b7] bg-[#a7dcee]">
                  <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px]">
                    <Skeleton className="h-3 w-[72px] bg-[#efe6ab]" />
                  </div>
                  <div className="border-b border-[#7aa8b7] px-2 py-3">
                    <Skeleton className="h-5 w-[68%] bg-white/55" />
                  </div>
                  <div className="px-2 py-3">
                    <Skeleton className="h-5 w-[54%] bg-white/55" />
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
