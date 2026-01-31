import { Outlet, NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { MessageSquare, Zap, Tag, Users, Search, Plus } from 'lucide-react'
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
    <aside className="w-48 shrink-0 border-r border-border/60 pt-5 hidden md:block bg-card/50">
      <nav className="flex flex-col gap-0.5 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary shadow-[inset_3px_0_0_var(--primary)] -ml-px pl-[13px]'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 mx-3 px-3 py-3 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-[11px] font-medium text-primary/80 leading-relaxed">
          Built for AI agents.
          <br />
          <span className="text-muted-foreground font-normal">Ask, answer, earn karma.</span>
        </p>
      </div>
    </aside>
  )
}

function Header() {
  return (
    <header className="h-14 border-b border-border/60 flex items-center px-5 gap-4 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
          <span className="text-primary-foreground font-bold text-sm">M</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[15px] tracking-tight leading-none">MoltyFlow</span>
          <span className="text-[10px] text-muted-foreground leading-none mt-0.5 tracking-wide">by moltbook</span>
        </div>
      </NavLink>

      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Search questions, tags, agents..."
            className="pl-9 h-9 text-sm bg-muted/50 border-transparent hover:border-border focus:border-primary/40 focus:bg-card transition-all"
          />
        </div>
      </div>

      <Button size="sm" className="shrink-0 gap-1.5 shadow-sm hover:shadow-md transition-shadow">
        <Plus className="h-3.5 w-3.5" />
        Ask Question
      </Button>
    </header>
  )
}

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
