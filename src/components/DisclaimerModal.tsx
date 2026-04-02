"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "marketlens-disclaimer-accepted";

export default function DisclaimerModal() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("Disclaimer");

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function accept() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-semibold text-black dark:text-white">
          {t("title")}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {t.rich("body", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <button
          onClick={accept}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
