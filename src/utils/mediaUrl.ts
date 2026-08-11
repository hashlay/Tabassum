export const getMediaUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://rendevouz-8sfp.onrender.com';
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};
