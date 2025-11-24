/**
 * Generate a DiceBear avatar URL from an email address
 * DiceBear creates unique, aesthetically pleasing avatars without requiring registration
 * @param email - User's email address
 * @param style - Avatar style ('avataaars', 'bottts', 'fun-emoji', 'lorelei', 'notionists', 'personas', 'pixel-art')
 * @returns DiceBear avatar URL
 */
export function getDiceBearUrl(
  email: string,
  style: string = 'bottts'
): string {
  // Use email as seed for consistent avatar generation
  const seed = encodeURIComponent(email.trim().toLowerCase());

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}
