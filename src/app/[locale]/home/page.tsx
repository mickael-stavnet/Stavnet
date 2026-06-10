import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const languages = [
  ["de", "Allemand", "German"],
  ["en", "Anglais", "English"],
  ["ar", "Arabe", "Arabic"],
  ["es", "Espagnol", "Spanish"],
  ["fr", "Français", "French"],
  ["he", "Hébreu", "Hebrew"],
] as const;

const fillerRows = Array.from({ length: 10 });

const actions = [
  ["search", "/images/home-menu/icon-search.png"],
  ["menu", "/images/home-menu/icon-menu.png"],
  ["close", "/images/home-menu/icon-close.png"],
  ["video", "/images/home-menu/icon-video.png"],
  ["diaporama", "/images/home-menu/icon-diaporama.png"],
  ["sound", "/images/home-menu/icon-sound.png"],
  ["introduction", "/images/home-menu/icon-introduction.png"],
  ["help", "/images/home-menu/icon-help.png"],
  ["next", "/images/home-menu/icon-next.png"],
] as const;

export default function HomeMenuPage() {
  const t = useTranslations("HomeMenu");

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

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[620px] flex-col px-5 py-8 md:block md:h-screen md:max-w-none md:p-0">
        <header className="relative flex flex-col items-center gap-3 md:absolute md:left-0 md:top-0 md:h-[24vh] md:w-full md:block">
          <div className="md:absolute md:left-[calc(50%-445px)] md:top-0 md:flex md:h-[102px] md:w-[295px] md:items-center">
            <Image
              src="/icons/logo/logo-stavnet.png"
              alt="STAVNET"
              width={295}
              height={75}
              priority
              className="h-auto w-[210px] md:w-full"
            />
          </div>

          <section className="flex h-[102px] w-[200px] flex-col items-center justify-center overflow-hidden rounded-bl-[12px] rounded-br-[12px] bg-[radial-gradient(circle_at_68%_24%,#fff46c_0%,#ffe32d_24%,#ffa51a_51%,#c93623_74%,#3f2f7f_100%)] text-center shadow-[8px_2px_9px_rgba(0,0,0,0.45)] md:absolute md:left-1/2 md:top-0 md:w-[250px] md:-translate-x-1/2">
            <p className="font-serif text-[24px] font-bold italic leading-[0.95] text-black">
              Welcome
            </p>
            <p className="text-[17px] font-bold leading-[1.05] text-[#001dcb]">
              שלום
            </p>
            <p className="font-serif text-[23px] font-bold italic leading-[1] text-black">
              Bienvenue
            </p>
          </section>

          <section className="text-center md:absolute md:left-[calc(50%+150px)] md:top-0 md:flex md:h-[102px] md:w-[calc(50vw-190px)] md:flex-col md:justify-center md:text-left">
            <h1 className="font-['Comic_Sans_MS','Trebuchet_MS',cursive] text-[36px] font-bold leading-none tracking-[1px] text-[#27236b] md:text-[38px]">
              Literature Database
            </h1>
            <div className="mt-[7px] flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[19px] font-bold leading-none md:justify-start">
              <span className="text-[#269338]">قاعدة المعطيات للاداب</span>
              <span className="text-[#d83b2d]">מאגר מידע לספרות</span>
            </div>
          </section>
        </header>

        <section className="mt-8 flex flex-col gap-5 md:mt-0 md:block">
          <div className="grid gap-2 text-center text-[17px] font-bold leading-none text-[#f0371d] md:absolute md:left-[5.5vw] md:top-[21.1vh] md:w-[89.8vw] md:grid-cols-[27%_19%_25%_20%] md:text-[18px]">
            <span>Choose the language you want to use</span>
            <span className="text-[#25a23e]">قاعدة المعطيات للاداب</span>
            <span>Choisissez la langue d'utilisation</span>
            <span className="text-[#363077]">בחר את שפת השימוש</span>
          </div>

          <section className="mx-auto w-[250px] md:absolute md:left-[5.8vw] md:top-[26vh]">
            <div className="h-[198px] overflow-hidden border border-[#8f9ca3] bg-[#edf5f8] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)] md:h-[51.9vh]">
              <div className="grid h-[29px] grid-cols-[36px_100px_1fr_12px] border-b border-[#9ca7a9] bg-[#fffed1] text-[10px] leading-[29px]">
                <span className="pl-[2px]">CHOSE</span>
                <span className="text-center">NAVIGATION</span>
                <span />
                <span className="border-l border-[#9ca7a9] text-center text-[9px]">⌂</span>
              </div>

              <div className="relative">
                {languages.map(([locale, fr, en]) => (
                  <Link
                    key={fr}
                    href="/home"
                    locale={locale}
                    className="grid h-[28px] grid-cols-[36px_100px_1fr_12px] border-b border-[#9ca7a9] text-[16px] leading-[28px] hover:bg-[#dce9f0]"
                  >
                    <span className="border-r border-[#b3bec1] text-center text-[19px] font-bold italic text-[#f04420]">
                      C
                    </span>
                    <span className="border-r border-[#9ca7a9] pl-[7px] font-bold">
                      {fr}
                    </span>
                    <span className="pl-[5px]">{en}</span>
                    <span className="border-l border-[#9ca7a9] bg-[#e3ebee]" />
                  </Link>
                ))}
                <div className="hidden md:block">
                  {fillerRows.map((_, index) => (
                    <div
                      key={index}
                      className="grid h-[27px] grid-cols-[36px_100px_1fr_12px] border-b border-[#c1cacd] bg-[#edf5f8]"
                    >
                      <span className="border-r border-[#d4dde0]" />
                      <span className="border-r border-[#c1cacd]" />
                      <span />
                      <span className="border-l border-[#9ca7a9] bg-[#e3ebee]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Image
            src="/images/home-menu/books-table.png"
            alt="Livres posés sur une table"
            width={625}
            height={367}
            priority
            sizes="(max-width: 767px) 90vw, 62vw"
            className="mx-auto h-auto w-full max-w-[625px] md:absolute md:left-[32.35vw] md:top-[26vh] md:h-[51.9vh] md:w-[62.4vw] md:max-w-none"
          />

          <p className="mx-auto max-w-[850px] border-y-[4px] border-dotted border-[#f04420] py-[7px] text-center text-[15px] font-bold italic leading-none text-[#f04420] md:absolute md:left-1/2 md:top-[82.55vh] md:w-[83.85vw] md:-translate-x-1/2">
            {t("continue")}
          </p>
        </section>

        <nav className="mt-7 grid grid-cols-3 gap-x-3 gap-y-5 pb-2 sm:grid-cols-5 md:absolute md:bottom-[3.1vh] md:left-[6.1vw] md:mt-0 md:flex md:w-[87.6vw] md:items-end md:justify-between md:pb-0">
          {actions.map(([label, icon]) => (
            <Link
              key={label}
              href={label === "next" ? "/" : "/home"}
              className="flex min-h-[64px] flex-col items-center justify-end text-center text-[16px] font-bold leading-none text-black"
            >
              <Image
                src={icon}
                alt=""
                width={74}
                height={47}
                className="h-[46px] w-auto object-contain"
              />
              <span className="mt-[7px]">{t(`actions.${label}`)}</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
