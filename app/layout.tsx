import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Figtree } from "next/font/google";
import NavigationBar from "@/components/navigation-bar";
import Transition from "@/components/transition";
import Favicon from "../public/favicon.ico";
import { createClient } from "@/utils/supabase/server";
import { isAnAdmin } from "@/api/admin";

export const metadata = {
  title: "Rice Mailroom",
  description: "Package management system for Rice University",
  icons: {
    icon: Favicon.src,
  },
};

const figtree = Figtree({
  subsets: ["latin"],
});

const figtreeClass = figtree.className;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const isAdmin =
    (await isAnAdmin(
      (await supabase.auth.getSession()).data.session?.user.email?.split(
        "@",
      )[0] ?? "",
    )) ?? false;

  return (
    <html lang="en" className={figtreeClass} suppressHydrationWarning>
      <body className="bg-accent text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationBar admin={isAdmin} />
          <Transition>{children}</Transition>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
