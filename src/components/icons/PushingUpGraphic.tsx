import type { SVGProps } from 'react';

export function PushingUpGraphic(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Yoga Pose Pushing Up Graphic</title>
        {/* Mat */}
        <path d="M 0 150 H 200 V 140 H 0 Z" fill="#F3F4F6" />

        {/* Figure in standing backbend pose */}
        <g fill="#1F2937">
            <path d="M100 140 V 110 C 100 90, 95 70, 110 50 C 120 35, 130 25, 120 15 L 110 25 C 110 50, 105 70, 100 110" />
            <path d="M120 15 C 115 10, 105 10, 100 15 L 110 25 Z" />
            <path d="M100 140 L 98 140 L 95 110 C 95 90, 90 70, 105 50 C 115 35, 125 25, 115 15 L 105 25 C 105 50, 100 70, 95 110 Z" />
        </g>
      </g>
    </svg>
  );
}
