import type { SVGProps } from 'react';

export function PushingUpGraphic(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Yoga Pose Pushing Up Graphic</title>
        {/* Mat */}
        <path d="M 0 150 H 200 V 140 H 0 Z" fill="#F3F4F6" />

        {/* Figure */}
        <g fill="#1F2937">
          {/* Back Leg */}
          <path d="M125 140 C 120 120, 115 100, 110 85 L 115 85 C 120 100, 125 120, 135 140 Z" />
          {/* Front Leg */}
          <path d="M110 85 L 80 85 C 75 110, 75 125, 70 140 L 85 140 C 90 120, 100 100, 110 85 Z" />
          {/* Torso & Head */}
          <path d="M110 85 C 120 60, 120 30, 105 10 L 95 15 C 100 40, 100 65, 110 85 Z" />
          {/* Arms */}
          <path d="M105 10 L 90 0 L 85 15 L 100 20 Z" />
          <path d="M100 20 L 115 10 L 120 25 L 105 30 Z" />
        </g>
      </g>
    </svg>
  );
}
