import { useId } from "react";

export function BrandMark() {
  const gradientId = useId().replaceAll(":", "");

  return (
    <svg
      className="brand-mark"
      viewBox="0 0 64 58"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gradientId}-left`} x1="7" y1="48" x2="30" y2="8">
          <stop stopColor="#7B3FF2" />
          <stop offset="1" stopColor="#984AF0" />
        </linearGradient>
        <linearGradient id={`${gradientId}-right`} x1="35" y1="8" x2="56" y2="48">
          <stop stopColor="#2181F4" />
          <stop offset="1" stopColor="#2767F2" />
        </linearGradient>
      </defs>
      <path
        d="M27 9 9 47h17"
        fill="none"
        stroke={`url(#${gradientId}-left)`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="10"
      />
      <path
        d="m37 9 18 38H38"
        fill="none"
        stroke={`url(#${gradientId}-right)`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="10"
      />
      <circle cx="32" cy="35" r="7" fill="#27BFAF" />
    </svg>
  );
}
