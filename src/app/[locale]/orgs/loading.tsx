import Image from "next/image";
import { OrgsListSkeleton } from "@/components/skeletons/orgs-list-skeleton";
import { StavnetHeader } from "@/components/stavnet/header";

export default function OrgsLoading() {
  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName="Liste organismes"
          title="Littérature israélienne"
          subtitle="Base de données bibliographiques et biographiques"
          headerClassName="md:h-[146px]"
          badgeClassName="md:h-[112px] md:w-[236px]"
          titleBlockClassName="md:right-[4.7vw] md:left-auto md:w-[44vw]"
          titleClassName="text-[28px] md:text-[32px]"
          subtitleClassName="text-[17px]"
        />
        <section className="mt-6 min-w-0 flex flex-col gap-4 md:absolute md:left-1/2 md:top-[154px] md:bottom-[128px] md:w-[min(1240px,94vw)] md:-translate-x-1/2">
          <OrgsListSkeleton />
        </section>
      </div>
    </main>
  );
}
