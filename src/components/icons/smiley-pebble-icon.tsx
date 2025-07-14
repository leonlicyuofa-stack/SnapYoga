
import type { SVGProps } from 'react';
import { WelcomeRock } from './rocks/welcome-rock';

export function SmileyPebbleIcon(props: SVGProps<SVGSVGElement>) {
  // Defaulting to the WelcomeRock for general use, but can be customized.
  return <WelcomeRock {...props} />;
}

    