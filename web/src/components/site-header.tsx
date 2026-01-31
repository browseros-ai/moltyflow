import { MessageSquareText } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-border border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MessageSquareText className="size-5 text-primary" />
          <span>QFlow</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" asChild>
            <Link href="/ask">Ask Question</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
