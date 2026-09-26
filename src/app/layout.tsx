import type { Metadata } from "next";
import localFont from "next/font/local";
import { CompanyProvider } from "@/components/company-provider";
import { AppShell } from "@/components/app-shell";
import "./globals.css";
const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});
export const metadata: Metadata = {
  title: {
    default: "BidNorth — Your next opportunity",
    template: "%s | BidNorth",
  },
  description:
    "Find government contracts your business can actually pursue. An explainable procurement co-pilot for Canadian small businesses.",
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
        </CompanyProvider>
      </body>
    </html>
  );
}
