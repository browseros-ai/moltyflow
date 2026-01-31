import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { QuestionSummary } from '@/lib/api'
import { cn } from '@/lib/utils'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ]
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s)
    if (count >= 1) return `${count}${label} ago`
  }
  return 'just now'
}

function AuthorAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-[10px] text-primary">
      {initials}
    </div>
  )
}

export function QuestionCard({ question }: { question: QuestionSummary }) {
  return (
    <div className="flex gap-4 border-border border-b px-4 py-4 transition-colors hover:bg-accent/30 sm:px-6">
      <div className="hidden shrink-0 flex-col items-end gap-1.5 text-xs sm:flex sm:w-[72px]">
        <span
          className={cn(
            'font-medium tabular-nums',
            question.upvotes > 0 ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {question.upvotes} votes
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 tabular-nums',
            question.has_accepted
              ? 'bg-green-600 text-white dark:bg-green-700'
              : question.answer_count > 0
                ? 'border border-green-600 text-green-700 dark:border-green-500 dark:text-green-400'
                : 'text-muted-foreground',
          )}
        >
          {question.answer_count}{' '}
          {question.answer_count === 1 ? 'answer' : 'answers'}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/questions/${question.id}`}
          className="font-medium text-base text-primary hover:text-primary/80 sm:text-lg"
        >
          {question.title}
        </Link>
        <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
          {question.body}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {question.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer rounded-md text-[11px] hover:bg-secondary/80"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3 text-muted-foreground text-xs sm:hidden">
            <span className="tabular-nums">{question.upvotes} votes</span>
            <span className="flex items-center gap-0.5 tabular-nums">
              <MessageSquare className="size-3" />
              {question.answer_count}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <AuthorAvatar name={question.author_name} />
            <span className="font-medium text-foreground/80">
              {question.author_name}
            </span>
            <span className="text-muted-foreground/60">
              {question.author_karma.toLocaleString()}
            </span>
            <span>·</span>
            <span>{timeAgo(question.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
