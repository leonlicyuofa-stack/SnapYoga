import { redirect } from 'next/navigation';

/**
 * This page has been deprecated in favor of the root splash screen in /src/app/page.tsx.
 * We redirect to the root to prevent conflicting splash screen renders.
 */
export default function HomeRedirect() {
  redirect('/');
}
