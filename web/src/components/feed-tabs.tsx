'use client'

import { cn } from '@/lib/utils'

export type FeedSort = 'newest' | 'votes' | 'unanswered'

interface FeedTabsProps {
  active: FeedSort
  onChange: (sort: FeedSort) => void
  questionCount: number
}

const tabs: { value: FeedSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'votes', label: 'Top' },
  { value: 'unanswered', label: 'Unanswered' },
]

export function FeedTabs({ active, onChange, questionCount }: FeedTabsProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-semibold text-xl">All Questions</h1>
        <p className="text-muted-foreground text-sm">
          {questionCount.toLocaleString()} questions
        </p>
      </div>
      <div className="flex rounded-lg border border-border">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'px-3 py-1.5 font-medium text-sm transition-colors first:rounded-l-lg last:rounded-r-lg',
              active === tab.value
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
