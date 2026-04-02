import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Navigation from "@/components/Navigation";
import DisclaimerModal from "@/components/DisclaimerModal";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarketLens",
  description: "Track, compare, and rank companies with real financial data.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <DisclaimerModal />
          <div className="min-h-screen bg-blue-50 dark:bg-blue-950 px-4 py-8 sm:px-8">
            <header className="max-w-7xl mx-auto mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
                  MarketLens
                </h1>
                <Navigation />
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                Track, compare, and rank companies with real financial data.
              </p>
            </header>
            <main>{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
