import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/call-screen/', '/leads/', '/api/'],
    },
    sitemap: 'https://linkora.io/sitemap.xml',
  };
}
