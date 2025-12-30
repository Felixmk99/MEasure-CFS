import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LanguageProvider } from "@/components/providers/language-provider";
import { UploadProvider } from "@/components/providers/upload-provider";
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MEasure-CFS",
  description: "Privacy-focused health dashboard for Long Covid and ME/CFS",
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
          <UploadProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Analytics />
          </UploadProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
