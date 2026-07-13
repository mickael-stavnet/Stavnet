import Image from "next/image";
import { StavnetLoadingIndicator } from "@/components/stavnet/loading-indicator";

export default function RelatedBooksLoading() {
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
      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-4">
        <StavnetLoadingIndicator />
      </div>
    </main>
  );
}
