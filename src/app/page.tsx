import Image from "next/image";
import { LanguageTable } from "@/components/home/language-table";
import { Navbar } from "@/components/home/navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container max-w-5xl mx-auto py-16 flex flex-col items-center text-center gap-6">
          <div className="relative w-32 h-12 mb-4">
            <Image
              src="/icons/logo/logo-stavnet.png"
              alt="STAVNET"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-[#1e1e1e]">
            The Literature Database
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl leading-relaxed">
            A comprehensive repository of global literature, accessible for researchers and professionals. Documenting history, culture, and art.
          </p>
          <div className="flex flex-col text-sm font-medium text-muted-foreground italic gap-1 mt-2">
            <span>قاعدة المعطيات للاداب</span>
            <span dir="rtl">מאגר מידע לספרות</span>
          </div>
        </section>

        {/* Content Section - No Padding X, Large Max Width */}
        <section className="container max-w-[90rem] mx-auto pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-stretch">
            {/* Left side: Language Selection */}
            <div className="flex flex-col">
              <LanguageTable />
            </div>

            {/* Right side: Visual Display - Clean & Matched Height */}
            <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
              <Image
                src="/images/ancient-books.png"
                alt="Ancient Books Collection"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-slate-50/50">
        <div className="container max-w-[90rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-[#1e1e1e] uppercase tracking-wider">STAVNET Database</p>
            <p className="text-sm text-muted-foreground">Built for professionals and academic researchers.</p>
          </div>
          <div className="flex items-center">
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.3em] font-black">
              Academic Access Only
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
