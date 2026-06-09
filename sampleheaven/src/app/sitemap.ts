import { MetadataRoute } from 'next';
import { mockSamples, mockCreators } from '../data/mockData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:3000';

  // Dynamic sample paths
  const sampleUrls = mockSamples.map((sample) => ({
    url: `${baseUrl}/sample/${sample.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic creator paths
  const creatorUrls = mockCreators.map((creator) => ({
    url: `${baseUrl}/creator/${encodeURIComponent(creator.username)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Static paths
  const staticUrls = [
    '',
    '/browse',
    '/pricing',
    '/about',
    '/contact',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.9,
  }));

  return [...staticUrls, ...creatorUrls, ...sampleUrls];
}
