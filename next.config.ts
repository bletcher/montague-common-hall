import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

/**
 * Permanent redirects from the old RocketFusion site, so bookmarks, search results, and links
 * elsewhere keep working. Old pages used /p/<id>/<title>, /d/<id>/<title> (events),
 * /index.cfm?p=p.<id>, and /files/<name>.pdf.
 */
const oldPages: Record<string, string> = {
  '63': '/about',
  '53': '/rent',
  '56': '/directions',
  '54': '/get-involved',
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
