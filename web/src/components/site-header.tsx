import { LogIn } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

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
          <Button size="sm" variant="outline" asChild>
            <a href={`${API_URL}/login`}>
              <LogIn className="mr-1.5 size-4" />
              Sign in
            </a>
          </Button>
          <Button size="sm" asChild>
            <Link href="/ask">Ask Question</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
