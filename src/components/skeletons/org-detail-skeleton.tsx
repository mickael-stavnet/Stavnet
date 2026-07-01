import { Skeleton } from "@/components/ui/skeleton";

export function OrgDetailSkeleton() {
  return (
    <div className="grid gap-4 md:min-h-0 md:flex-1">
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
          <Skeleton className="mx-auto h-8 w-[92px] bg-[#dff3f8]/80 md:h-9 md:w-[96px]" />
        </aside>

        <div className="min-w-0 flex-1 px-[12px] py-[12px] md:px-[16px] md:py-[16px]">
          <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-y-[14px] md:gap-y-[16px]">
            <div className="grid gap-[10px] lg:grid-cols-[2.28fr_1fr]">
              <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                  <Skeleton className="h-3 w-[112px] bg-[#efe6ab]" />
                </div>
                <div className="border-b border-[#7aa8b7] px-3 py-[10px]">
                  <Skeleton className="h-7 w-[228px] bg-white/55" />
                </div>

                <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                  <Skeleton className="h-3 w-[84px] bg-[#efe6ab]" />
                </div>
                <div className="px-3 py-[10px]">
                  <Skeleton className="h-7 w-[68%] bg-white/55" />
                </div>

                <div className="grid md:grid-cols-3">
                  <div>
                    <div className="border-y border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                      <Skeleton className="h-3 w-[84px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-3 py-[10px]">
                      <Skeleton className="h-7 w-[80px] bg-white/55" />
                    </div>
                  </div>
                  <div>
                    <div className="border-y border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                      <Skeleton className="h-3 w-[44px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-3 py-[10px]">
                      <Skeleton className="h-7 w-[96px] bg-white/55" />
                    </div>
                  </div>
                  <div>
                    <div className="border-y border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                      <Skeleton className="h-3 w-[58px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-3 py-[10px]">
                      <Skeleton className="h-7 w-[112px] bg-white/55" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2">
                  <div>
                    <div className="border-y border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                      <Skeleton className="h-3 w-[96px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-3 py-[10px]">
                      <Skeleton className="h-7 w-[118px] bg-white/55" />
                    </div>
                  </div>
                  <div>
                    <div className="border-y border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                      <Skeleton className="h-3 w-[52px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-3 py-[10px]">
                      <Skeleton className="h-7 w-[90px] bg-white/55" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2">
                  <div>
                    <div className="border-y border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                      <Skeleton className="h-3 w-[90px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-3 py-[10px]">
                      <Skeleton className="h-7 w-[132px] bg-white/55" />
                    </div>
                  </div>
                  <div>
                    <div className="border-y border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                      <Skeleton className="h-3 w-[58px] bg-[#efe6ab]" />
                    </div>
                    <div className="px-3 py-[10px]">
                      <Skeleton className="h-7 w-[122px] bg-white/55" />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex min-h-0 flex-col space-y-[8px]">
                <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                  <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                    <Skeleton className="h-3 w-[132px] bg-[#efe6ab]" />
                  </div>
                  <div className="border-b border-[#7aa8b7] px-3 py-[10px]">
                    <Skeleton className="h-6 w-[156px] bg-white/55" />
                  </div>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className={index < 3 ? "h-[42px] border-b border-[#7aa8b7]" : "h-[42px]"} />
                  ))}
                </section>

                <section className="border border-[#7aa8b7] bg-[#fff15a]">
                  <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-3 py-[7px]">
                    <Skeleton className="h-3 w-[74px] bg-[#efe6ab]" />
                  </div>
                  <div className="px-3 py-[10px]">
                    <Skeleton className="h-6 w-[138px] bg-white/55" />
                  </div>
                </section>
              </div>
            </div>

            <section className="flex h-full min-h-0 flex-col space-y-[8px]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 pt-1">
                <Skeleton className="h-6 w-[142px] bg-[#dff3f8]/80" />
                <Skeleton className="h-6 w-6 bg-white/55" />
                <Skeleton className="h-6 w-[110px] bg-[#dff3f8]/80" />
                <Skeleton className="h-6 w-6 bg-white/55" />
                <Skeleton className="h-6 w-[128px] bg-[#dff3f8]/80" />
              </div>

              <section className="hidden min-h-0 flex-1 overflow-hidden border border-[#7aa8b7] bg-[#a7dcee] md:flex md:flex-col">
                <div className="grid w-full min-w-0 grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_72px] border-b border-[#7aa8b7] bg-[#fff8c8]">
                  {["w-[164px]", "w-[140px]", "w-[44px]"].map((width, index) => (
                    <div key={index} className={index < 2 ? "border-r border-[#7aa8b7] px-3 py-[7px]" : "px-3 py-[7px]"}>
                      <Skeleton className={`h-3 ${width} bg-[#efe6ab]`} />
                    </div>
                  ))}
                </div>

                <div className="grid w-full min-w-0 grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_72px]">
                  {["w-[72%]", "w-[62%]", "w-[36px]"].map((width, index) => (
                    <div key={index} className={index < 2 ? "flex h-[32px] items-center border-r border-t border-[#7aa8b7] px-3" : "flex h-[32px] items-center border-t border-[#7aa8b7] px-3"}>
                      <Skeleton className={`h-4 ${width} bg-white/55`} />
                    </div>
                  ))}
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_72px]">
                  <div className="border-r border-t border-[#7aa8b7]" />
                  <div className="border-r border-t border-[#7aa8b7]" />
                  <div className="border-t border-[#7aa8b7]" />
                </div>
              </section>
            </section>
          </div>
        </div>

        <aside className="absolute bottom-0 left-[calc(100%+4px)] top-0 hidden w-[34px] items-center justify-start md:flex">
          <div className="flex h-full flex-col items-center justify-between py-[96px]">
            <Skeleton className="h-[176px] w-[14px] bg-[#dff3f8]/80" />
            <Skeleton className="h-[56px] w-[16px] bg-white/55" />
            <Skeleton className="h-[170px] w-[14px] bg-[#dff3f8]/80" />
            <Skeleton className="h-[56px] w-[16px] bg-white/55" />
          </div>
        </aside>
      </div>
    </div>
  );
}
