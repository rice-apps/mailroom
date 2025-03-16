import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Figtree } from "next/font/google";
import NavigationBar from "@/components/navigation-bar";
import Transition from "@/components/transition";

export const metadata = {
  title: "Rice Mailroom",
  description: "Package management system for Rice University",
  icons: {
    icon: "/favicon.ico",
  },
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
          <NavigationBar />
          <Transition>{children}</Transition>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
