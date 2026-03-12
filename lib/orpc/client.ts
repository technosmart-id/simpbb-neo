import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'

const link = new RPCLink({
  url: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/rpc`,
  headers: async () => {
    if (typeof window !== 'undefined') {
      return {}
    }

    const { headers } = await import('next/headers')
    const h = await headers()
    return h
  },
})

export const orpcClient = createORPCClient(link)
