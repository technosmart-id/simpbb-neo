import { OpenAPIGenerator } from '@orpc/openapi'
import { router } from '@/lib/orpc/server'

const generator = new OpenAPIGenerator()

export async function GET() {
  const spec = await generator.generate(router, {
    info: {
      title: 'Neo Vision API',
      version: '1.0.0',
      description: 'oRPC v1.x powered API for the Neo Vision Boilerplate.',
    },
  })

  return Response.json(spec)
}
