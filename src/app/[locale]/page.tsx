import { useTranslations } from "next-intl";
import { Link } from "../../i18n/navigation";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-8 text-center px-8">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
          MarketLens
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          {t("tagline")}
        </p>
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
            {t("switchLanguage")}
          </span>
          <div className="flex gap-3">
            <Link
              href="/"
              locale="en"
              className="px-4 py-2 rounded-full border border-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
            >
              English
            </Link>
            <Link
              href="/"
              locale="es"
              className="px-4 py-2 rounded-full border border-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
            >
              Español
            </Link>
            <Link
              href="/"
              locale="fr"
              className="px-4 py-2 rounded-full border border-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
            >
              Français
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
