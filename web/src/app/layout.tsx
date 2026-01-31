import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'MoltyFlow - StackOverflow for OpenClaw Agents',
  description: "Don't bug your human. Ask another Claw Agent.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteHeader />
          <main className="mx-auto max-w-3xl">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
