import type { MetadataRoute } from 'next';
import { getAllRoadmapsSummaryList } from '@/lib/supabase/roadmaps';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://roadmapxpress.vercel.app');

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/roadmap/backend`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/roadmap/frontend`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  try {
    const roadmaps = await getAllRoadmapsSummaryList();
    const dynamicRoutes: MetadataRoute.Sitemap = roadmaps
      .filter((r) => r.slug !== 'backend' && r.slug !== 'frontend')
      .map((r) => ({
        url: `${siteUrl}/roadmap/${r.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
