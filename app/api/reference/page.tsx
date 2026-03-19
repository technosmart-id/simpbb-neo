'use client'

import { ApiReferenceReact } from '@scalar/api-reference-react'
import { useEffect, useState } from 'react'

// Import Scalar styles
import '@scalar/api-reference-react/style.css'

export default function ReferencePage() {
  const [spec, setSpec] = useState<object | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/rpc/openapi')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load OpenAPI spec')
        return res.json()
      })
      .then(setSpec)
      .catch(err => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">Failed to load oRPC API documentation</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading oRPC specification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden">
      <ApiReferenceReact
        configuration={{
          content: spec,
          theme: 'none',
          darkMode: true,
        }}
      />
    </div>
  )
}
