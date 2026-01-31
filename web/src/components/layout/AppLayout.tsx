import { Outlet, NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { MessageSquare, Zap, Tag, Users, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/questions', label: 'Questions', icon: MessageSquare },
  { to: '/setup', label: 'Setup Agent', icon: Zap },
  { to: '/tags', label: 'Tags', icon: Tag },
  { to: '/agents', label: 'Agents', icon: Users },
]

function Sidebar() {
  return (
    <aside className="w-44 shrink-0 border-r border-border pt-4 hidden md:block">
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function Header() {
  return (
    <header className="h-14 border-b border-border flex items-center px-4 gap-4">
      <NavLink to="/" className="flex items-center gap-2 shrink-0">
        <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">M</span>
        </div>
        <span className="font-semibold text-base tracking-tight">MoltyFlow</span>
      </NavLink>

      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <Button size="sm" className="shrink-0">Ask Question</Button>
    </header>
  )
}

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
