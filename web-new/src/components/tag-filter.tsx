'use client'

import { cn } from '@/lib/utils'

interface TagFilterProps {
  tags: readonly string[]
  selected: string | null
  onSelect: (tag: string | null) => void
}

export function TagFilter({ tags, selected, onSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'rounded-md border px-2.5 py-1 font-medium text-xs transition-colors',
          selected === null
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(selected === tag ? null : tag)}
          className={cn(
            'rounded-md border px-2.5 py-1 font-medium text-xs transition-colors',
            selected === tag
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
