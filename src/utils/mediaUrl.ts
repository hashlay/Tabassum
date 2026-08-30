export const getMediaUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : (typeof window !== 'undefined' ? window.location.origin : '');
  const cleanBase = baseUrl.replace(/\/$/, '');
  let cleanPath = url.startsWith('/') ? url : `/${url}`;

  // If path starts with /data/uploads/, ensure it routes cleanly
  if (cleanPath.startsWith('/data/uploads/')) {
    cleanPath = `/api${cleanPath}`;
  } else if (cleanPath.startsWith('/uploads/')) {
    cleanPath = `/api/data${cleanPath}`;
  }

  return `${cleanBase}${cleanPath}`;
};
