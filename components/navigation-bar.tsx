"use client";

import { ArrowLeft, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(true);

  // Paths where we don't want to show the navigation bar
  const hiddenPaths = [
    "/sign-in",
    "/unauthorized",
    "/login",
    "/register",
    "/auth",
    "/auth/callback",
    "/kiosk"
  ];

  // Determine if settings icon should be shown (hide on settings page)
  const showSettingsIcon = !pathname.includes("/settings");
  const showBackButton =
    !pathname.includes("/admin") &&
    !pathname.includes("/home");

  // Check for overlaps with other elements
  useEffect(() => {
    const checkForOverlaps = () => {
      // Get elements that might overlap with our nav
      const elementsNearTop = Array.from(
        document.querySelectorAll('h1, h2, .card, [role="heading"]'),
      ).filter((el) => {
        const rect = el.getBoundingClientRect();
        // Check if element is close to the top
        return rect.top < 60;
      });

      // Check if we should hide the navigation bar
      if (hiddenPaths.some((path) => pathname.startsWith(path))) {
        setShouldRender(false);
      } else {
        setShouldRender(elementsNearTop.length === 0);
      }
    };

    // Run initial check
    checkForOverlaps();

    // Set up observer to detect layout changes
    const observer = new MutationObserver(checkForOverlaps);
    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up
    return () => observer.disconnect();
  }, [pathname, hiddenPaths]);

  // Don't render if we detected overlapping elements
  if (!shouldRender) return null;

  return (
    <div
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 h-14 pointer-events-none flex justify-between items-center px-4"
    >
      {/* Left side - Back button */}
      <div>
        {showBackButton && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
            className="pointer-events-auto rounded-full w-10 h-10 bg-transparent border-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Right side - Settings button */}
      <div>
        {showSettingsIcon && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/settings")}
            aria-label="Settings"
            className="pointer-events-auto rounded-full w-10 h-10 bg-transparent border-0"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
