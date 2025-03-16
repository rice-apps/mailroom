"use client";

import React, { useState, ReactNode, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface SliderProps {
  views: {
    id: string;
    content: ReactNode;
  }[];
  initialViewIndex?: number;
  className?: string;
  onViewChange?: (viewId: string) => void;
  resetTimeout?: number;
}

const Slider: React.FC<SliderProps> = ({
  views,
  initialViewIndex = 0,
  className = "",
  onViewChange,
  resetTimeout,
}) => {
  const [currentViewIndex, setCurrentViewIndex] = useState(initialViewIndex);
  const [direction, setDirection] = useState(0);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  useEffect(() => {
    setCurrentViewIndex(initialViewIndex);
  }, [initialViewIndex]);

  const handleViewChange = () => {
    const newIndex = currentViewIndex === 0 ? 1 : 0;
    if (resetTimeout) {
      if (newIndex != initialViewIndex) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setCurrentViewIndex(initialViewIndex);
          onViewChange?.(views[initialViewIndex].id);
        }, resetTimeout);
      } else {
        if (timeoutId) clearTimeout(timeoutId);
      }
    }
    setCurrentViewIndex(newIndex);
    onViewChange?.(views[newIndex].id);
  };

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      onClick={handleViewChange}
    >
      <motion.div
        className="absolute w-1/2 h-full bg-[#00205B] rounded-full pointer-events-none"
        animate={{
          x: currentViewIndex === 0 ? "0%" : "100%",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      />
      <div className="absolute inset-0 flex">
        <div className="flex-1 flex items-center justify-center">
          <motion.span
            animate={{
              color: currentViewIndex === 0 ? "#FFFFFF" : "#00205B",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            Check In
          </motion.span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <motion.span
            animate={{
              color: currentViewIndex === 1 ? "#FFFFFF" : "#00205B",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            Claim
          </motion.span>
        </div>
      </div>
    </div>
  );
};

export default Slider;
