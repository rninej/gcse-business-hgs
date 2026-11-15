import type { MetadataRoute } from 'next';

// Search engines can index everything except the internal cost model (/debug)
// and the JSON API. /debug shows supplier pricing and margin maths — useful to
// us, not something to rank for a competitor's search.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/debug'],
      },
    ],
    sitemap: 'https://www.gcse.business/sitemap.xml',
    host: 'https://www.gcse.business',
  };
}
