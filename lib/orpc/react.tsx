'use client'

import { createORPCReactQueryUtils, RouterUtils } from '@orpc/react-query'
import { RouterClient } from '@orpc/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useState, ReactNode } from 'react'
import { orpcClient } from './client'
import type { AppRouter } from './server'

type ORPCUtils = RouterUtils<RouterClient<AppRouter>>

export const ORPCContext = createContext<ORPCUtils | undefined>(undefined)

export function useORPC(): ORPCUtils {
  const orpc = useContext(ORPCContext)
  if (!orpc) {
    throw new Error('useORPC must be used within an RPCProvider')
  }
  return orpc
}

interface RPCProviderProps {
  children: ReactNode
}

export function RPCProvider({ children }: RPCProviderProps) {
  const [queryClient] = useState(() => new QueryClient())
  const [orpc] = useState(() =>
    createORPCReactQueryUtils(orpcClient as Parameters<typeof createORPCReactQueryUtils>[0]) as unknown as ORPCUtils
  )

  return (
    <ORPCContext.Provider value={orpc}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ORPCContext.Provider>
  )
}
