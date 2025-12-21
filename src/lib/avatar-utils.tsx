

import ReactDOMServer from 'react-dom/server';

// A map of avatar IDs to their corresponding image paths and background colors.
const avatarComponents = {
    avatar1: { imagePath: '/images/avatar1.png', bgColor: '#e9d5ff' }, // bg-purple-200
    avatar2: { imagePath: '/images/avatar2.png', bgColor: '#fbcfe8' },   // bg-pink-200
    avatar3: { imagePath: '/images/avatar3.png', bgColor: '#fed7aa' }, // bg-orange-200
    avatar4: { imagePath: '/images/avatar4.png', bgColor: '#fecaca' },   // bg-rose-200
    avatar5: { imagePath: '/images/avatar5.png', bgColor: '#d9f99d' },   // bg-green-200
    avatar6: { imagePath: '/images/avatar6.png', bgColor: '#bae6fd' },   // bg-blue-200
};

/**
 * This function is now simplified. Since we are using direct image paths,
 * we no longer need to generate data URIs from SVGs. This function
 * can be deprecated or modified if server-side image processing is needed later.
 * For now, we'll keep it but it won't be actively used in the avatar selection flow.
 * @param avatarId The ID of the avatar (e.g., 'avatar1').
 * @returns A promise that resolves to the image path string.
 */
export async function getAvatarDataUri(avatarId: keyof typeof avatarComponents): Promise<string | null> {
  const avatarInfo = avatarComponents[avatarId];
  if (!avatarInfo) {
    console.error(`Avatar with id ${avatarId} not found.`);
    return null;
  }
  
  // Directly return the path to the image
  return avatarInfo.imagePath;
}
