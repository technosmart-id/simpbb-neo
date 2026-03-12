'use client'

import { useORPC } from "@/lib/orpc/react"
import { useQuery } from "@tanstack/react-query"

export function Greeting() {
  const orpc = useORPC()
  const { data, isLoading } = useQuery(
    orpc.hello.queryOptions({ input: { name: 'Ariefan' } })
  )

  if (isLoading) return <div className="text-sm text-muted-foreground animate-pulse">Checking oRPC connection...</div>

  type HelloResponse = { message: string }

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
      <h3 className="font-semibold text-lg mb-2">oRPC Test Result</h3>
      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
        {(data as HelloResponse | undefined)?.message ?? 'No response from server'}
      </div>
    </div>
  )
}
