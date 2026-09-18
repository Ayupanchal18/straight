import { useEffect } from 'react';
import { updateSEO } from '../utils/seo';

/**
 * Custom React Hook to manage dynamic SEO metadata and JSON-LD structured data
 */
export function useSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType,
  ogImage,
  structuredData,
} = {}) {
  useEffect(() => {
    updateSEO({
      title,
      description,
      keywords,
      canonicalUrl,
      ogType,
      ogImage,
      structuredData,
    });
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, structuredData]);
}
