/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // jspdf and jspdf-autotable pull in fflate/node.cjs which uses dynamic
  // Node.js Worker code that Turbopack can't bundle for SSR. Externalizing
  // them means they are require()'d at runtime on the server instead of bundled.
  serverExternalPackages: ['jspdf', 'jspdf-autotable', 'drizzle-kit'],
  experimental: {
    outputFileTracingIncludes: {
      'app/api/rpc/**/*': [
        './drizzle.config.ts',
        './lib/db/schema/**/*',
      ],
    },
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/sign-in',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
