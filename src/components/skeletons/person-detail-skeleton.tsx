import { Skeleton } from "@/components/ui/skeleton";

const PERSON_BIBLIOGRAPHY_GRID =
  "md:grid-cols-[minmax(0,0.84fr)_minmax(0,1.14fr)_minmax(0,2.58fr)_72px_84px_84px]";

export function PersonDetailSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 md:mx-0 md:grid md:grid-cols-[108px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[12px] md:overflow-visible md:px-0 md:pb-0">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            className={index === 0 ? "h-11 min-w-[128px] shrink-0 rounded-t-[8px] bg-[#91d3ea] md:h-[68px] md:min-w-0" : "h-11 min-w-[128px] shrink-0 rounded-t-[8px] bg-[#ffea56]/85 md:h-[60px] md:min-w-0"}
          />
        ))}
      </div>

      <div className="relative flex min-h-[660px] flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:min-h-0 md:flex-1 md:flex-row">
        <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[126px] md:border-b-0 md:border-r md:px-4 md:py-5">
          <Skeleton className="mx-auto h-8 w-[82px] bg-[#dff3f8]/80 md:h-9 md:w-[90px]" />
        </aside>

        <div className="min-w-0 flex-1 px-[12px] py-[12px] md:px-[16px] md:py-[16px]">
          <div className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)] gap-y-[14px] md:gap-y-[16px]">
            <div className="grid gap-[10px] lg:grid-cols-[2.1fr_0.98fr]">
              <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                  <Skeleton className="h-3 w-[172px] bg-[#efe6ab]" />
                </div>
                <div className="border-b border-[#7aa8b7] px-3 py-[10px]">
                  <Skeleton className="h-7 w-[220px] bg-white/55" />
                </div>

                <div className="grid md:grid-cols-3">
                  <div className="md:col-span-2">
                    <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                      <Skeleton className="h-3 w-[182px] bg-[#efe6ab]" />
                    </div>
                    <div className="border-b border-[#7aa8b7] px-3 py-[10px] md:border-b-0">
                      <Skeleton className="h-7 w-[96px] bg-white/55" />
                    </div>
                  </div>

                  <div>
                    <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                      <Skeleton className="h-3 w-[90px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-3 py-[10px]">
                      <Skeleton className="h-7 w-[52px] bg-white/55" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-[1.6fr_1fr]">
                  <div>
                    <div className="border-y border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px] md:border-t md:border-b">
                      <Skeleton className="h-3 w-[176px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-3 py-[10px]">
                      <Skeleton className="h-7 w-[286px] max-w-full bg-white/55" />
                    </div>
                  </div>

                  <div>
                    <div className="border-y border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px] md:border-t md:border-b">
                      <Skeleton className="h-3 w-[124px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-3 py-[10px]">
                      <Skeleton className="h-7 w-[84px] bg-white/55" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                  <Skeleton className="h-3 w-[132px] bg-[#efe6ab]" />
                </div>
                <div className="grid h-full grid-rows-[42px_repeat(4,1fr)]">
                  <div className="border-b border-[#7aa8b7] px-3 py-[10px]">
                    <Skeleton className="h-6 w-[156px] bg-white/55" />
                  </div>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className={index < 3 ? "border-b border-[#7aa8b7]" : ""} />
                  ))}
                </div>
              </section>
            </div>

            <section className="border border-[#7aa8b7] bg-[#a7dcee]">
              <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                <Skeleton className="h-3 w-[104px] bg-[#efe6ab]" />
              </div>
              <div className="space-y-3 px-3 py-3 md:h-[128px]">
                <Skeleton className="h-4 w-full bg-white/50" />
                <Skeleton className="h-4 w-[97%] bg-white/50" />
                <Skeleton className="h-4 w-[93%] bg-white/50" />
                <Skeleton className="h-4 w-[89%] bg-white/50" />
              </div>
            </section>

            <section className="flex h-full min-h-0 flex-col space-y-[8px]">
              <div className="grid gap-2 sm:grid-cols-3 md:hidden">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2">
                    <Skeleton className="h-3 w-[120px] bg-[#dff3f8]/80" />
                    <Skeleton className="mt-3 h-7 w-8 bg-white/55" />
                  </div>
                ))}
              </div>

              <div className="hidden flex-wrap items-center gap-x-7 gap-y-2 px-1 pt-1 md:flex">
                <Skeleton className="h-6 w-[146px] bg-[#dff3f8]/80" />
                <Skeleton className="h-6 w-6 bg-white/55" />
                <Skeleton className="h-6 w-[140px] bg-[#dff3f8]/80" />
                <Skeleton className="h-6 w-6 bg-white/55" />
                <Skeleton className="h-6 w-[116px] bg-[#dff3f8]/80" />
                <Skeleton className="h-6 w-6 bg-white/55" />
                <Skeleton className="h-6 w-[210px] bg-[#dff3f8]/80" />
              </div>

              <section className="hidden min-h-0 flex-1 overflow-hidden border border-[#7aa8b7] bg-[#a7dcee] md:flex md:flex-col">
                <div className={`grid w-full border-b border-[#7aa8b7] bg-[#fff8c8] px-0 py-0 ${PERSON_BIBLIOGRAPHY_GRID}`}>
                  {["w-[88px]", "w-[132px]", "w-[214px]", "w-[44px]", "w-[48px]", "w-[52px]"].map((width, index) => (
                    <div key={index} className={index < 5 ? "border-r border-[#7aa8b7] px-3 py-[7px]" : "px-3 py-[7px]"}>
                      <Skeleton className={`h-3 ${width} bg-[#efe6ab]`} />
                    </div>
                  ))}
                </div>

                {Array.from({ length: 2 }).map((_, rowIndex) => (
                  <div key={rowIndex} className={`grid w-full ${PERSON_BIBLIOGRAPHY_GRID}`}>
                    {["w-[74px]", "w-[94px]", "w-[280px]", "w-[36px]", "w-[34px]", "w-[30px]"].map((width, index) => (
                      <div key={index} className={index < 5 ? "flex h-[46px] items-center border-r border-t border-[#7aa8b7] px-3" : "flex h-[46px] items-center border-t border-[#7aa8b7] px-3"}>
                        <Skeleton className={`h-4 ${width} bg-white/50`} />
                      </div>
                    ))}
                  </div>
                ))}

                <div className={`grid min-h-0 flex-1 ${PERSON_BIBLIOGRAPHY_GRID}`}>
                  <div className="border-r border-t border-[#7aa8b7]" />
                  <div className="border-r border-t border-[#7aa8b7]" />
                  <div className="border-r border-t border-[#7aa8b7]" />
                  <div className="border-r border-t border-[#7aa8b7]" />
                  <div className="border-t border-[#7aa8b7]" />
                  <div className="border-t border-[#7aa8b7]" />
                </div>
              </section>
            </section>
          </div>
        </div>

        <aside className="absolute bottom-0 left-[calc(100%+4px)] top-0 hidden w-[34px] items-center justify-start md:flex">
          <div className="flex h-full flex-col items-center justify-between py-[96px]">
            <Skeleton className="h-[164px] w-[14px] bg-[#dff3f8]/80" />
            <Skeleton className="h-[56px] w-[16px] bg-white/55" />
            <Skeleton className="h-[170px] w-[14px] bg-[#dff3f8]/80" />
            <Skeleton className="h-[56px] w-[16px] bg-white/55" />
          </div>
        </aside>
      </div>
    </div>
  );
}
