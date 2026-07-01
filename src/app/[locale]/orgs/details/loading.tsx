import Image from "next/image";
import { OrgDetailSkeleton } from "@/components/skeletons/org-detail-skeleton";
import { StavnetHeader } from "@/components/stavnet/header";

export default function OrganizationDetailsLoading() {
  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName="Fichier organismes"
          title="Littérature israélienne"
          subtitle="Base de données bibliographiques et biographiques"
        />
        <section className="mt-6 flex flex-col gap-4 md:absolute md:left-1/2 md:top-[172px] md:bottom-[118px] md:w-[min(1580px,97vw)] md:-translate-x-1/2">
          <OrgDetailSkeleton />
        </section>
      </div>
    </main>
  );
}
