import React, { PropsWithChildren, useMemo } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

export function ConvexClientProvider({ children }: PropsWithChildren) {
  const convex = useMemo(() => {
    return new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || 'https://happy-dragonfly-70.convex.cloud')
  }, [])

  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  )
}
