import { Noto_Sans_TC, Geist_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const sans = Noto_Sans_TC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "蘇屋排球隊Stat App",
  description: "蘇屋排球隊比賽記錄與分析。用簡化代碼記每一球，賽後立刻看數據。",
  applicationName: "蘇屋排球隊Stat App",
  appleWebApp: {
    capable: true,
    title: "蘇屋排球隊Stat App",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1a14",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`dark ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
