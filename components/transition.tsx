"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Transition({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current pathname to use as a key
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname} // Key is crucial for AnimatePresence to track
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          ease: "easeInOut",
          duration: 0.3, // Slightly faster for better UX
        }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
