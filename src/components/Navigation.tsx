"use client";

import { Link, usePathname } from "@/i18n/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Company Ranking" },
  { href: "/company-details", label: "Company Details" },
] as const;

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
