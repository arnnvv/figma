import "./globals.css";
import type { Metadata, Viewport } from "next";
import { JSX, ReactNode } from "react";
import { Toaster } from "sonner";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";

export const viewport: Viewport = {
  width: "device-width",
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Figma",
  description: "Generated by Arnnvv",
  robots: "noindex",
  icons: [
    {
      url: "https://liveblocks.io/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png",
    },
    {
      url: "https://liveblocks.io/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png",
    },
  ],
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default ({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element => (
  <html lang="en">
    <body
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable,
      )}
    >
      <Navbar />
      {children}
      <Toaster richColors={true} />
    </body>
  </html>
);
