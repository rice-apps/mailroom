"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const DateRangePickerDropdown = ({
  onDatesChange,
  initialDateRange,
}: {
  onDatesChange?: (range: DateRange | null) => void;
  initialDateRange?: DateRange | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    initialDateRange?.startDate || null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialDateRange?.endDate || null,
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Notify parent about date changes
  useEffect(() => {
    if (startDate && endDate) {
      onDatesChange?.({ startDate, endDate });
    } else {
      onDatesChange?.(null);
    }
  }, [startDate, endDate, onDatesChange]);

  // Generate calendar grid
  const getDaysGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Date[] = [];
    const startDay = firstDay.getDay();
    const endDate = lastDay.getDate();

    // Previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // Current month
    for (let i = 1; i <= endDate; i++) {
      days.push(new Date(year, month, i));
    }

    // Next month
    const nextDays = 42 - days.length;
    for (let i = 1; i <= nextDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(new Date(date.setHours(0, 0, 0, 0)));
      setEndDate(null);
    } else if (date > startDate) {
      setEndDate(new Date(date.setHours(23, 59, 59, 999)));
    } else {
      setEndDate(new Date(date.setHours(23, 59, 59, 999)));
      setStartDate(new Date(date.setHours(0, 0, 0, 0)));
    }
  };

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isStart = (date: Date) =>
    startDate?.toDateString() === date.toDateString();

  const isEnd = (date: Date) => endDate?.toDateString() === date.toDateString();

  const formatDate = (date: Date | null) =>
    date
      ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "";

  return (
    <div className="relative w-fit" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-4 py-2 text-left border rounded-lg bg-white hover:bg-gray-50",
          "transition-colors duration-200 w-64 flex justify-between items-center",
          "text-gray-700 focus:outline-none",
          isOpen && "ring-2 ring-blue-500 border-blue-500",
        )}
      >
        {startDate && endDate ? (
          <span className="flex items-center">
            {formatDate(startDate)}
            <span className="mx-1">–</span>
            {formatDate(endDate)}
          </span>
        ) : (
          <span className="text-gray-400">Select date range</span>
        )}
        <svg
          className={`w-5 h-5 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute mt-2 origin-top-right z-50">
          <div className="p-4 border rounded-lg bg-white shadow-lg space-y-4">
            {/* Month Navigation */}
            <div className="flex justify-between items-center px-2">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                    ),
                  )
                }
                className="p-2 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <div className="font-medium">
                {currentMonth.toLocaleString("default", { month: "long" })}{" "}
                {currentMonth.getFullYear()}
              </div>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                    ),
                  )
                }
                className="p-2 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 h-8"
                >
                  {day}
                </div>
              ))}

              {getDaysGrid().map((date, index) => {
                const isCurrentMonth =
                  date.getMonth() === currentMonth.getMonth();
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      "h-8 w-8 rounded-full text-sm transition-colors",
                      "hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                      !isCurrentMonth && "text-gray-400",
                      isToday && "font-bold bg-gray-100",
                      isInRange(date) && "bg-blue-200",
                      isStart(date) &&
                        "bg-blue-500 text-white hover:bg-blue-600",
                      isEnd(date) && "bg-blue-500 text-white hover:bg-blue-600",
                    )}
                    disabled={!isCurrentMonth}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePickerDropdown;
