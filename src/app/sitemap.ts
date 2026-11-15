import type { MetadataRoute } from 'next';
import { TOPICS } from '@/lib/topics';

const BASE = 'https://gcse.business';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ['', '/demo', '/pricing', '/topics', '/legal'];
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
  ];
}
