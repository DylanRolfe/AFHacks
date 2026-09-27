import type { Metadata } from "next";
import localFont from "next/font/local";
import { CompanyProvider } from "@/components/company-provider";
import { AppShell } from "@/components/app-shell";
import { VideoDemoController } from "@/components/video-demo-controller";
import { Suspense } from "react";
import "./globals.css";

const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: { default: "BidNorth - Pre-bid readiness", template: "%s | BidNorth" },
  description:
    "Know if you are ready before you bid. A pre-bid readiness check for Canadian small businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <CompanyProvider>
          <AppShell>{children}</AppShell>
          <Suspense fallback={null}><VideoDemoController /></Suspense>
        </CompanyProvider>
      </body>
    </html>
  );
}
