import * as React from "react";
import { SVGProps } from "react";
export const CheckInIcon = ({
  className,
  ...props
}: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={94}
    height={94}
    fill="none"
    viewBox="0 0 24 24"
    className={className}
    {...props}
  >
    <path
      stroke="#00205B"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.5 7.278 12 12m0 0L3.5 7.278M12 12v9.5m2-.611-1.223.68c-.284.157-.425.236-.575.267a.998.998 0 0 1-.403 0c-.15-.031-.292-.11-.576-.268l-7.4-4.11c-.3-.167-.45-.25-.558-.369a1 1 0 0 1-.215-.364C3 16.573 3 16.401 3 16.06V7.942c0-.343 0-.514.05-.667a1 1 0 0 1 .215-.364c.109-.119.258-.202.558-.368l7.4-4.111c.284-.158.425-.237.576-.267a1 1 0 0 1 .402 0c.15.03.292.11.576.267l7.4 4.11c.3.167.45.25.558.369a1 1 0 0 1 .215.364c.05.153.05.324.05.667V12.5m-13.5-8 9 5M19 21v-6m-3 3h6"
    />
  </svg>
);
