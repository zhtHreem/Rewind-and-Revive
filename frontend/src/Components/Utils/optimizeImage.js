// Returns a resized, WebP-compressed version of an image URL via the free
// images.weserv.nl proxy/CDN. ImgBB serves the original upload (often several
// MB), which is far too heavy for a ~400px product card.
export const optimizeImage = (url, width = 400) => {
  if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) return url;
  if (url.includes('images.weserv.nl')) return url;
  const clean = url.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=${width}&output=webp&q=75`;
};

// onError fallback: if the resizer fails, show the original image once.
export const fallbackToOriginal = (original) => (e) => {
  if (e.currentTarget.dataset.fallback) return;
  e.currentTarget.dataset.fallback = '1';
  e.currentTarget.src = original;
};
