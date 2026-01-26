
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
 * This function now correctly fetches the avatar image from its path
 * and converts it into a data URI string, which is required for uploading
 * to Firebase Storage.
 * @param avatarId The ID of the avatar (e.g., 'avatar1').
 * @returns A promise that resolves to the data URI string of the image.
 */
export async function getAvatarDataUri(avatarId: keyof typeof avatarComponents): Promise<string | null> {
  const avatarInfo = avatarComponents[avatarId];
  if (!avatarInfo) {
    console.error(`Avatar with id ${avatarId} not found.`);
    return null;
  }
  
  try {
    const response = await fetch(avatarInfo.imagePath);
    if (!response.ok) {
        throw new Error(`Failed to fetch avatar image: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error converting avatar '${avatarId}' to data URI:`, error);
    return null;
  }
}
