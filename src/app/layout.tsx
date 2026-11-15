import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gcse.business"),
  title: "gcsebusiness — self-marking homework & revision",
  description:
    "Quizzes, homework and instant marking for Edexcel GCSE (9-1) Business. Built for teachers and students.",
  keywords: ["GCSE Business", "Edexcel", "gcsebusiness", "quizzes", "homework", "revision"],
  openGraph: {
    siteName: "gcsebusiness",
    locale: "en_GB",
    type: "website",
    title: "gcsebusiness — GCSE Business homework that marks itself",
    description:
      "Edexcel GCSE (9-1) Business (1BS0) quizzes that mark themselves. £250 a year for the whole school.",
    url: "https://gcse.business",
  },
  twitter: {
    card: "summary",
    title: "gcsebusiness — GCSE Business homework that marks itself",
    description: "Edexcel 1BS0 quizzes with instant marking, £250 a year for the whole school.",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "gcsebusiness",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfdfb" },
    { media: "(prefers-color-scheme: dark)", color: "#121713" },
  ],
};

// Applied before first paint so the theme never flashes. A saved choice wins;
// first-time visitors follow their device's colour scheme.
const themeBoot = `(function(){try{var t=localStorage.getItem('hgs.theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var c=document.documentElement.classList;if(d)c.add('dark');document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
