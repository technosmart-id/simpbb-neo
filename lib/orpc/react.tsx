'use client'

import { createORPCReactQueryUtils, type RouterUtils } from '@orpc/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useState, ReactNode } from 'react'
import { orpcClient, type AppRouter } from './client'
import type { RouterClient } from '@orpc/server'

// Workaround for circular type dependency issues
// The types are inferred at runtime, so we use 'any' here
// but the runtime behavior is fully type-safe
let _utils: any = null

function getUtils(): RouterUtils<RouterClient<AppRouter>> {
	if (!_utils) {
		_utils = createORPCReactQueryUtils(orpcClient)
	}
	return _utils
}

// Export the utils with correct type to restore type safety in the UI
export const ORPCContext = createContext<RouterUtils<RouterClient<AppRouter>> | undefined>(undefined)

export function useORPC() {
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
	const [orpc] = useState(() => getUtils())

	return (
		<ORPCContext.Provider value={orpc}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</ORPCContext.Provider>
	)
}

// Helper types for components to use for type assertions
export type InferRouterClient<T> = T extends { ___brand: infer R } ? R : never

