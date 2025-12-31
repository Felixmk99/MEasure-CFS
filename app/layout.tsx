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
  title: "MEasure-CFS",
  description: "Privacy-focused health dashboard for Long Covid and ME/CFS",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <LanguageProvider>
          <UserProvider>
            <UploadProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <Analytics />
              <SpeedInsights />
            </UploadProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
