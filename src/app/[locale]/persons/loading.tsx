import Image from "next/image";
import { PersonsListSkeleton } from "@/components/skeletons/persons-list-skeleton";
import { StavnetHeader } from "@/components/stavnet/header";

export default function PersonsLoading() {
  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-95 saturate-[1.08]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName="Liste personnes"
          title="Littérature israélienne"
          subtitle="Base de données bibliographiques et biographiques"
        />
        <section className="mt-6 min-w-0 flex flex-col gap-4 md:absolute md:left-1/2 md:top-[178px] md:bottom-[72px] md:w-[min(1320px,96vw)] md:-translate-x-1/2">
          <div className="flex items-center justify-center">
            <div className="rounded-full border border-[#9aa8b0] bg-[#fff6a8] px-4 py-1 text-[12px] font-bold uppercase tracking-[0.08em] text-[#34444d] shadow-[2px_2px_4px_rgba(0,0,0,0.12)]">
              Chargement des fiches personnes
            </div>
          </div>
          <PersonsListSkeleton />
        </section>
      </div>
    </main>
  );
}
