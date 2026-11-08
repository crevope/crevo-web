'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analyticsRepository } from '@/features/analytics/api/analyticsRepository'

/** Mounted once in the public layout: catches client-side navigations too. */
export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    analyticsRepository.trackPageView(pathname ?? '/')
  }, [pathname])

  return null
}
