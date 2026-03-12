import type { ReactNode } from 'react'

export default function ReferenceLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background">
        {children}
      </body>
    </html>
  )
}
