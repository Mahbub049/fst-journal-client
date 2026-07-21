import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "sweetalert2/dist/sweetalert2.min.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Journal of FST",
  description: "BUP Faculty of Science & Technology Journal",
  icons: {
    icon: "/images/bup.png",
    shortcut: "/images/bup.png",
    apple: "/images/bup.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
