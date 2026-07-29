import { getTranslations } from "next-intl/server";
import { NotFoundScreen } from "@/components/stavnet/not-found-screen";

export default async function NotFound() {
  const [t, tHome] = await Promise.all([
    getTranslations("Errors.notFound"),
    getTranslations("Home"),
  ]);

  return (
    <NotFoundScreen
      title={t("title")}
      message={t("message")}
      homeLabel={t("home")}
      menuLabel={t("menu")}
      backLabel={tHome("back")}
    />
  );
}
