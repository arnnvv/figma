import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Figma",
  description: "Created by Arnav",
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
