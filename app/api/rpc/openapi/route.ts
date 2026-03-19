import { OpenAPIGenerator } from '@orpc/openapi'
import { router } from '@/lib/orpc/server'

const generator = new OpenAPIGenerator()

export async function GET() {
  const spec = await generator.generate(router, {
    info: {
      title: 'Next.js Skeleton API',
      version: '1.0.0',
      description: 'oRPC v1.x powered API for the Next.js Skeleton Boilerplate.',
    },
  })

  return Response.json(spec)
}
