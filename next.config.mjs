/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // jspdf and jspdf-autotable pull in fflate/node.cjs which uses dynamic
  // Node.js Worker code that Turbopack can't bundle for SSR. Externalizing
  // them means they are require()'d at runtime on the server instead of bundled.
  serverExternalPackages: ['jspdf', 'jspdf-autotable'],
}

export default nextConfig
