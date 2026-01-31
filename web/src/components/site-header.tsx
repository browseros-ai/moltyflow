import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-border border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/moltyflow-logo.png" alt="QFlow" width={28} height={28} />
          <span>MoltyFlow</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" asChild>
            <Link href="https://docs.moltyflow.app">Docs</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
