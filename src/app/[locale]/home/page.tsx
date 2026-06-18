import Image from "next/image";
import { useTranslations } from "next-intl";
import { StarModelViewer } from "@/components/home/star-model-viewer";
import { LanguageSwitcher } from "@/components/home/language-switcher";
import { StavnetHeader } from "@/components/stavnet/header";
import { StavnetFooter } from "@/components/stavnet/footer";

export default function HomeMenuPage() {
  const t = useTranslations("HomeMenu");
  const footerItems = [
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("actions.search") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("actions.menu") },
    { key: "video", icon: "/icons/icons-nav/video.png", href: "/home" as const, label: t("actions.video") },
    { key: "diaporama", icon: "/icons/icons-nav/diapo.png", href: "/home" as const, label: t("actions.diaporama") },
    { key: "sound", icon: "/icons/icons-nav/sound.png", href: "/home" as const, label: t("actions.sound") },
    { key: "introduction", icon: "/icons/icons-nav/introduction.png", href: "/home" as const, label: t("actions.introduction") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/home" as const, label: t("actions.help") },
    { key: "next", icon: "/icons/icons-nav/next.png", href: "/" as const, label: t("actions.next") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/home" as const, label: t("actions.close") },
  ];

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <section data-stavnet-animate="star-viewer" className="pointer-events-none absolute left-0 right-0 top-[136px] z-10 h-[calc(100svh-230px)] w-full md:top-[10vh] md:h-[73vh]">
        <StarModelViewer />
      </section>

      <div className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-[620px] flex-col px-5 pb-8 pt-0 md:block md:h-screen md:max-w-none md:p-0">
        <StavnetHeader
          pageName="Welcome"
          badgeBody={
            <>
              <p className="text-[17px] font-bold leading-[1.05] text-[#001dcb]">שלום</p>
              <p className="font-serif text-[23px] font-bold italic leading-[1] text-black">Bienvenue</p>
            </>
          }
          title="Literature Database"
          titleExtra={
            <div className="mt-[8px] flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[19px] font-bold md:justify-end">
              <span className="flex h-[22px] items-center leading-none text-[#269338]">قاعدة المعطيات للاداب</span>
              <span className="flex h-[22px] items-center leading-none text-[#d83b2d]">מאגר מידע לספרות</span>
            </div>
          }
          rightControl={<LanguageSwitcher />}
          headerClassName="md:h-[146px]"
          badgeClassName="md:h-[112px] md:w-[272px]"
          logoClassName="md:left-[4.9vw] md:top-0 md:w-[255px]"
          titleBlockClassName="md:right-[4.9vw] md:left-auto md:top-0 md:flex md:h-[112px] md:w-[39vw] md:flex-col md:items-end md:justify-center md:text-right"
          titleClassName="font-['Comic_Sans_MS','Trebuchet_MS',cursive] text-[30px] tracking-[1px] text-[#27236b] md:text-[38px]"
          rightControlClassName="md:top-[132px] md:w-[39vw] md:flex md:justify-end"
        />

        <StavnetFooter
          items={footerItems}
          className="md:bottom-[2.3vh] md:left-[4.8vw] md:right-[4.8vw]"
        />
      </div>
    </main>
  );
}
