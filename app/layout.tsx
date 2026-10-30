import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const SITE = "https://tester.famemaker.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Handled — Your office work, handled.",
  description:
    "Handled runs the office side of your service business: quotes out fast, jobs on the calendar, invoices sent, follow-ups done. You keep doing the work. We help with the rest.",
  openGraph: {
    title: "Handled — Less paperwork. More paid work.",
    description:
      "Managed office automation for plumbers, HVAC, electricians, landscapers, cleaners and other service businesses.",
    url: SITE,
    siteName: "Handled",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0A0F1E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
