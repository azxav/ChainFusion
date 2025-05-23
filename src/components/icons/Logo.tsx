import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      // width and height attributes removed to allow CSS to control sizing via props.className
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      <text
        x="10" // Adjusted x-coordinate
        y="35"
        fontFamily="var(--font-geist-sans)"
        fontSize="30"
        fontWeight="bold"
        fill="currentColor"
      >
        ChainFusion
      </text>
    </svg>
  );
}
