import type { Metadata } from "next";
import { Inter, Karla, Hammersmith_One } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const hammersmithOne = Hammersmith_One({
  subsets: ["latin"],
  variable: "--font-hammersmith",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Minibits — Bitcoin Lightning & Ecash Wallet",
  description:
    "Minibits is a Bitcoin Lightning and ecash wallet for Android and iOS that enables instant, low-cost, and private value transfers using the Cashu protocol.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${karla.variable} ${hammersmithOne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
