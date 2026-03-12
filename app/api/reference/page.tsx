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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Failed to load API documentation</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading API documentation...</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh' }}>
      <ApiReferenceReact
        configuration={{
          content: spec,
        }}
      />
    </div>
  )
}
