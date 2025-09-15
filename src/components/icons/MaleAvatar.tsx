
import type { SVGProps } from 'react';

export function MaleAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M40 98.5C28.5 98.5 17.5 95 12 85C6.5 75 1 55.5 1 40L1.5 22.5L15 21.5L23.5 1.5H56.5L65 21.5L79 22.5V40C79 55.5 73.5 75 68 85C62.5 95 51.5 98.5 40 98.5Z" stroke="black" stroke-width="2"/>
        <path d="M40 1V22" stroke="black" stroke-width="2"/>
        <path d="M33 91H31" stroke="black" stroke-width="2" stroke-linecap="round"/>
        <path d="M49 91H47" stroke="black" stroke-width="2" stroke-linecap="round"/>
    </svg>
  );
}
