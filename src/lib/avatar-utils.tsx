
import { Avatar1Icon } from '@/components/icons/Avatar1Icon';
import { Avatar2Icon } from '@/components/icons/Avatar2Icon';
import { Avatar3Icon } from '@/components/icons/Avatar3Icon';
import { Avatar4Icon } from '@/components/icons/Avatar4Icon';
import { Avatar5Icon } from '@/components/icons/Avatar5Icon';
import ReactDOMServer from 'react-dom/server';

// A map of avatar IDs to their corresponding React components and background colors.
const avatarComponents = {
    avatar1: { component: Avatar1Icon, bgColor: '#e9d5ff' }, // bg-purple-200
    avatar2: { component: Avatar2Icon, bgColor: '#fbcfe8' },   // bg-pink-200
    avatar3: { component: Avatar3Icon, bgColor: '#fed7aa' }, // bg-orange-200
    avatar4: { component: Avatar4Icon, bgColor: '#fecaca' },   // bg-rose-200
    avatar5: { component: Avatar5Icon, bgColor: '#d9f99d' },   // bg-green-200
};

/**
 * Generates an SVG string for a given avatar ID, renders it to a string,
 * and then creates a Base64 data URI for it. This allows preset SVG icons
 * to be treated like uploaded images (e.g., for setting as a profile picture).
 * @param avatarId The ID of the avatar (e.g., 'avatar1').
 * @returns A promise that resolves to a data URI string (e.g., 'data:image/svg+xml;base64,...').
 */
export async function getAvatarDataUri(avatarId: keyof typeof avatarComponents): Promise<string | null> {
  const avatarInfo = avatarComponents[avatarId];
  if (!avatarInfo) {
    console.error(`Avatar with id ${avatarId} not found.`);
    return null;
  }

  const { component: AvatarComponent, bgColor } = avatarInfo;

  // Render the SVG component to an HTML string on the server.
  // We wrap it in an SVG tag and apply the background color to the head/path.
  const svgString = ReactDOMServer.renderToString(
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20,60 C 10,40 25,25 50,25 C 75,25 90,40 80,60 C 90,80 70,95 50,95 C 30,95 10,80 20,60 Z" fill={bgColor} />
        <AvatarComponent />
    </svg>
  );

  // In a browser environment, we can use btoa to encode the string.
  if (typeof window !== 'undefined') {
    const base64 = window.btoa(svgString);
    return `data:image/svg+xml;base64,${base64}`;
  }
  
  // In a Node.js/server environment, we would use Buffer.
  const base64 = Buffer.from(svgString).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
