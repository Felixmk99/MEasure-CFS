import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LanguageProvider } from "@/components/providers/language-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { UploadProvider } from "@/components/providers/upload-provider";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://measure-cfs.de"),
  title: "MEasure-CFS",
  description: "Privacy-focused health dashboard for Long Covid and ME/CFS",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "MEasure-CFS",
    description: "Privacy-focused health dashboard for Long Covid and ME/CFS",
    url: "https://measure-cfs.de",
    siteName: "MEasure-CFS",
    locale: "en_US",
    type: "website",
  },
};

import { Toaster } from "sonner";
import { headers } from "next/headers";
import { Locale } from "@/lib/i18n/types";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const initialLocale: Locale = host.toLowerCase().endsWith(".de") ? "de" : "en";

  return (
    <html lang={initialLocale}>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <LanguageProvider initialLocale={initialLocale}>
          <UserProvider>
            <UploadProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <Analytics />
              <SpeedInsights />
              <Toaster position="top-center" richColors />
            </UploadProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
