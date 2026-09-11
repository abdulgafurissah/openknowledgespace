import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, Amiri } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Open Knowledge Space | Islamic Learning Platform",
  description: "A structured Islamic e-learning platform offering courses in Quran, Islamic studies, Arabic, and more. Free access for all learners.",
  keywords: ["Islamic learning", "Quran", "Arabic", "Islamic studies", "online courses"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${dmSans.variable} ${amiri.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

