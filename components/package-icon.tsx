import { SVGProps } from "react";

export default function PackageIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={800}
      height={800}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
      className={className}
    >
      <path
        stroke="#1C274C"
        strokeLinecap="round"
        strokeWidth={1.5}
        d="M21.984 10c-.037-1.311-.161-2.147-.581-2.86-.598-1.015-1.674-1.58-3.825-2.708l-2-1.05C13.822 2.461 12.944 2 12 2s-1.822.46-3.578 1.382l-2 1.05C4.271 5.56 3.195 6.125 2.597 7.14 2 8.154 2 9.417 2 11.94v.117c0 2.525 0 3.788.597 4.802.598 1.015 1.674 1.58 3.825 2.709l2 1.049C10.178 21.539 11.056 22 12 22s1.822-.46 3.578-1.382l2-1.05c2.151-1.129 3.227-1.693 3.825-2.708.42-.713.544-1.549.581-2.86M21 7.5 12 12m0 0L3 7.5m9 4.5v9.5"
      />
    </svg>
  );
}
