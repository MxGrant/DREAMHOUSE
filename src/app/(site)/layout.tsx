import { SiteFooter, SiteHeader } from '@/components/site-shell'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="app-main">{children}</main>
      <SiteFooter />
    </>
  )
}
