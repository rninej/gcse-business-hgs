import type { MetadataRoute } from 'next';
import { SUBTOPICS, TOPICS } from '@/lib/topics';

// Vercel serves the apex as a 308 redirect to www, so canonicals must name the
// host that actually answers 200 — otherwise every URL in the sitemap is a
// redirect, which wastes crawl budget and splits signals.
const BASE = 'https://www.gcse.business';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ['', '/demo', '/pricing', '/topics', '/spec', '/tools', '/legal'];
  return [
    ...pages.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: (path === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: path === '' ? 1 : path === '/demo' || path === '/pricing' ? 0.9 : 0.7,
    })),
    ...TOPICS.map((t) => ({
      url: `${BASE}/topics/${t.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    // one page per spec sub-topic — the long-tail search surface
    ...SUBTOPICS.map((s) => ({
      url: `${BASE}/spec/${s.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.55,
    })),
  ];
}
