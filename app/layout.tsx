import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";

import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

import { Figtree } from "next/font/google";

export const metadata = {
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const figtree = Figtree({
  subsets: ["latin"],
});

const figtreeClass = figtree.className;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={figtreeClass} suppressHydrationWarning>
      <body className="bg-accent text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
