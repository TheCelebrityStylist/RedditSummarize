import type { MetadataRoute } from 'next'
import { articles, landingPages } from '@/lib/content'
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://threadguide.app'
  const routes = ['', '/pricing', '/resources', '/privacy', '/terms', '/disclaimer', ...Object.keys(landingPages).map(x=>`/${x}`), ...Object.keys(articles).map(x=>`/resources/${x}`)]
  return routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route ? 'monthly' : 'weekly', priority: route === '' ? 1 : .7 }))
}
