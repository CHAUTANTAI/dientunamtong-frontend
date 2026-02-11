/**
 * Slug Generation Utilities
 * Vietnamese-friendly slug generation
 */

/**
 * Generate URL-friendly slug from Vietnamese text
 * Converts: "Điện Tử Máy Tính" -> "dien-tu-may-tinh"
 * 
 * @param text - Input text (Vietnamese or English)
 * @returns URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    // Replace Vietnamese characters
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
    .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
    .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
    .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
    .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
    .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
    .replace(/Đ/g, 'D')
    // Remove special characters (keep alphanumeric and spaces/hyphens)
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Replace spaces with hyphens
    .replace(/\s/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
};

/**
 * Validate slug format
 * Must be lowercase, alphanumeric with hyphens only
 * 
 * @param slug - Slug to validate
 * @returns true if valid slug format
 */
export const isValidSlug = (slug: string): boolean => {
  if (!slug) return false;
  
  // Must match: lowercase alphanumeric + hyphens, no leading/trailing hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Ensure slug uniqueness by appending number if needed
 * Note: This is client-side only. Backend should handle actual uniqueness check.
 * 
 * @param baseSlug - Base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export const ensureUniqueSlug = (
  baseSlug: string,
  existingSlugs: string[]
): string => {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Generate slug with uniqueness check
 * 
 * @param text - Input text
 * @param existingSlugs - Array of existing slugs
 * @returns Unique slug
 */
export const generateUniqueSlug = (
  text: string,
  existingSlugs: string[] = []
): string => {
  const baseSlug = generateSlug(text);
  return ensureUniqueSlug(baseSlug, existingSlugs);
};

/**
 * Examples:
 * 
 * generateSlug('Điện Tử Máy Tính') -> 'dien-tu-may-tinh'
 * generateSlug('Laptop Gaming') -> 'laptop-gaming'
 * generateSlug('iPhone 15 Pro Max!!!') -> 'iphone-15-pro-max'
 * generateSlug('Màn Hình 27"') -> 'man-hinh-27'
 */

