import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://linkora.io';

  const routes = [
    '',
    '/de/leads-verkaufen-deutschland',
    '/de/photovoltaik-leads',
    '/de/waermepumpen-leads',
    '/de/deutschsprachiges-callcenter',
    '/de/impressum',
    '/de/datenschutz',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
}
