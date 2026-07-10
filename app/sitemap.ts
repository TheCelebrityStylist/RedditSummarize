import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://threadguide.app'
  const routes = ['', '/pricing', '/privacy', '/terms', '/disclaimer']
  return routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route ? 'monthly' : 'weekly', priority: route === '' ? 1 : .7 }))
}
