import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuiRuntime } from "@/components/assistant-ui/aui-runtime";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "PAGES",
  description: "Prompt-based AI generation engine for sites",
  icons: ["/favicon.svg"],
};

export const viewport = {
  maximumScale: 1,
};

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="overflow-hidden antialiased">
        <ThemeProvider attribute="class">
          <Suspense fallback="Loading...">
            <AuiRuntime>
              <TooltipProvider>{children}</TooltipProvider>
            </AuiRuntime>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
