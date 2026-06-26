import Image from "next/image";
import { OrgDetailSkeleton } from "@/components/skeletons/org-detail-skeleton";
import { StavnetHeader } from "@/components/stavnet/header";

export default function OrganizationDetailsLoading() {
  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName="Fichier organismes"
          title="Littérature israélienne"
          subtitle="Base de données bibliographiques et biographiques"
        />
        <section className="mt-6 flex flex-col gap-4 md:absolute md:left-[4.8vw] md:right-[4.8vw] md:top-[154px] md:bottom-[154px]">
          <OrgDetailSkeleton />
        </section>
      </div>
    </main>
  );
}
