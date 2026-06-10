'use client';

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useDateTime } from "@/hooks/use-datetime";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const { date, time } = useDateTime();
  const t = useTranslations("Home");

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden bg-[#e6f2f8] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative z-10 flex min-h-[100svh] w-full flex-col justify-center px-6 py-10 md:block md:min-h-screen md:p-0">
        <header className="relative z-10 flex w-full shrink-0 flex-col items-center gap-4 md:absolute md:left-0 md:top-0 md:block md:h-[22.2vh]">
          <Image
            src="/icons/logo/logo-stavnet.png"
            alt="STAVNET"
            width={295}
            height={75}
            priority
            className="relative h-auto w-[132px] sm:w-[165px] md:absolute md:left-[5.1vw] md:top-[3.4vh] md:w-[22vw] md:max-w-[350px]"
          />

          <section className="absolute left-1/2 top-0 hidden h-[136px] w-[190px] -translate-x-1/2 flex-col items-center justify-center overflow-hidden rounded-bl-[12px] rounded-br-[12px] bg-[radial-gradient(circle_at_68%_24%,#fff46c_0%,#ffe32d_24%,#ffa51a_51%,#c93623_74%,#3f2f7f_100%)] text-center shadow-[8px_2px_9px_rgba(0,0,0,0.45)] sm:w-[240px] md:flex md:h-[14.55vh] md:w-[19.7vw] md:min-w-[210px]">
            <h2 className="w-full translate-x-[-1px] text-center font-serif text-[26px] font-bold italic leading-[0.86] text-[#0300c7] sm:text-[32px] md:text-[clamp(22px,2.75vw,36px)]">
              {t("coverTitleLine1")}
              <br />
              {t("coverTitleLine2")}
            </h2>
            <p className="mt-[8px] w-full text-center text-[11px] font-bold leading-none text-black md:text-[clamp(10px,1.17vw,14px)]">
              {date}
            </p>
            <p className="mt-[3px] w-full text-center text-[11px] font-bold leading-none text-black md:text-[clamp(10px,1.1vw,14px)]">
              {time}
            </p>
          </section>

          <section className="relative w-full max-w-[330px] text-center md:absolute md:right-[5.7vw] md:top-[4.7vh] md:w-[36vw] md:max-w-none md:text-right">
            <h1 className="text-[30px] font-bold leading-[0.95] text-[#0000c8] sm:text-[34px] md:text-[clamp(25px,2.55vw,38px)] md:leading-none">
              {t("coverMainTitle")}
            </h1>
            <div className="mx-auto mt-[7px] h-[3px] w-[88%] bg-[#e5cf00] md:ml-auto md:mr-0 md:w-[91.5%]" />
            <p className="mt-[8px] text-[14px] font-bold leading-[1.1] text-[#00008a] sm:text-[15px] md:mt-[9px] md:text-[clamp(13px,1.25vw,18px)] md:leading-none">
              {t("coverSubtitle")}
            </p>
          </section>
        </header>

        <section className="mt-9 flex w-full flex-col items-center md:mt-0 md:block">
        <Image
          src="/images/home/home-image-banner.png"
          alt="Paysage architectural en Israël"
          width={896}
          height={424}
          priority
          sizes="(max-width: 767px) 82vw, 80vw"
          className="relative z-10 h-auto w-[82vw] max-w-[520px] object-contain md:absolute md:left-[10vw] md:top-[22.05vh] md:mt-0 md:h-[60.15vh] md:w-[80vw] md:max-w-none md:object-fill"
        />

        <p className="relative z-10 mt-7 w-[min(86vw,520px)] text-center text-[15px] leading-[1.35] text-black md:absolute md:left-[14.7vw] md:top-[86.05vh] md:mt-0 md:w-[70.7vw] md:text-[clamp(14px,1.55vw,20px)] md:leading-[1.48]">
          {t("coverDescriptionLine1")}
          <br />
          {t("coverDescriptionLine2")}
          <br />
          {t("coverDescriptionLine3")}
        </p>

        <nav className="relative z-10 mt-6 flex w-[min(86vw,520px)] items-end justify-between md:absolute md:bottom-[3.1vh] md:left-[5.1vw] md:mt-0 md:w-[89.3vw] md:px-0">
          <Link href="/home" className="group flex flex-col items-start text-black">
            <Image
              src="/images/home/home-arrow-left.png"
              alt=""
              width={56}
              height={36}
              className="h-auto w-[56px] transition-opacity group-hover:opacity-80 md:w-[clamp(56px,5.58vw,82px)]"
            />
            <span className="mt-[5px] text-[16px] font-bold leading-none md:text-[clamp(16px,1.55vw,22px)]">
              {t("back")}
            </span>
          </Link>

          <Link href="/home" className="group flex flex-col items-end text-black">
            <Image
              src="/images/home/home-arrow-right.png"
              alt=""
              width={49}
              height={36}
              className="h-auto w-[49px] transition-opacity group-hover:opacity-80 md:w-[clamp(49px,4.88vw,74px)]"
            />
            <span className="mt-[5px] text-[16px] font-bold leading-none md:text-[clamp(16px,1.55vw,22px)]">
              {t("next")}
            </span>
          </Link>
        </nav>
        </section>
      </div>
    </main>
  );
}
