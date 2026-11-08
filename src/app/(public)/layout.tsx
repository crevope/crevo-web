import { PageViewTracker } from '@/features/analytics/ui/PageViewTracker'

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <PageViewTracker />
      {children}
    </>
  )
}
