import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      <path d="M10 40 L20 10 L30 40 L40 10 L50 40" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text
        x="60"
        y="35"
        fontFamily="var(--font-geist-sans)"
        fontSize="30"
        fontWeight="bold"
        fill="currentColor"
      >
        Tashkent Vision
      </text>
    </svg>
  );
}
