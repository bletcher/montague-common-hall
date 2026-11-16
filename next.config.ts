import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

/**
 * Permanent redirects from the old RocketFusion site, so bookmarks, search results, and links
 * elsewhere keep working. Old pages used /p/<id>/<title>, /d/<id>/<title> (events),
 * /n/<id>/<title> (news), /index.cfm?p=p.<id>, and /files/<name>.pdf.
 */
const oldPages: Record<string, string> = {
  '63': '/about',
  '53': '/rent',
  '56': '/directions',
  '54': '/get-involved',
  '55': '/calendar',
  '60': '/donate',
}

// Old news posts (/n/<id>/<title>), loaded into News by src/seed/old-news.ts.
const oldNews: Record<string, string> = {
  '28': 'mch-fall-2017-newsletter',
  '29': 'mch-winter-2018-newsletter',
  '30': 'mch-spring-2018-newsletter',
  '31': 'mch-fall-2018-newsletter',
  '32': 'mch-spring-2019-newsletter',
  '36': 'summer-2020-newsletter',
  '1036': 'mch-spring-newsletter-2021',
  '1041': 'mch-thanksgiving-2023-and-giving-tuesday',
  '1042': 'mch-spring-2024-newsletter',
  '1044': 'concert-this-saturday-dayna-kurtz-with-robert-mach',
  '1046': 'fall-2024-newsletter',
}

async function redirects() {
  return [
    ...Object.entries(oldPages).flatMap(([id, destination]) => [
      { source: `/p/${id}`, destination, permanent: true },
      { source: `/p/${id}/:title*`, destination, permanent: true },
      {
        source: '/index.cfm',
        has: [{ type: 'query' as const, key: 'p', value: `p.${id}` }],
        destination,
        permanent: true,
      },
    ]),
    ...Object.entries(oldNews).map(([id, slug]) => ({
      source: `/n/${id}/:title*`,
      destination: `/news/${slug}`,
      permanent: true,
    })),
    { source: '/n/:id/:title*', destination: '/news', permanent: true },
    { source: '/d/:id/:title*', destination: '/calendar', permanent: true },
    { source: '/index.cfm', destination: '/', permanent: true },
    { source: '/files/:name', destination: '/api/media/file/:name', permanent: true },
  ]
}

const nextConfig: NextConfig = {
  redirects,
  images: {
    // Next's image optimizer isn't available on Cloudflare Workers; photos are served as uploaded.
    unoptimized: true,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare'],

  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
