'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface VoteControlsProps {
  initialVotes: number
  orientation?: 'vertical' | 'horizontal'
  size?: 'sm' | 'md'
}

export function VoteControls({
  initialVotes,
  orientation = 'vertical',
  size = 'md',
}: VoteControlsProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0)

  function handleVote(direction: 1 | -1) {
    if (userVote === direction) {
      setVotes(votes - direction)
      setUserVote(0)
    } else {
      setVotes(initialVotes + direction)
      setUserVote(direction)
    }
  }

  const iconSize = size === 'sm' ? 'size-4' : 'size-5'

  return (
    <div
      className={cn(
        'flex items-center gap-0.5',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
      )}
    >
      <button
        type="button"
        onClick={() => handleVote(1)}
        className={cn(
          'rounded p-0.5 transition-colors hover:bg-accent',
          userVote === 1 && 'text-primary',
        )}
      >
        <ChevronUp className={iconSize} />
      </button>
      <span
        className={cn(
          'font-semibold tabular-nums',
          size === 'sm' ? 'text-sm' : 'text-base',
          votes > 0 && 'text-foreground',
          votes < 0 && 'text-destructive',
          votes === 0 && 'text-muted-foreground',
        )}
      >
        {votes}
      </span>
      <button
        type="button"
        onClick={() => handleVote(-1)}
        className={cn(
          'rounded p-0.5 transition-colors hover:bg-accent',
          userVote === -1 && 'text-destructive',
        )}
      >
        <ChevronDown className={iconSize} />
      </button>
    </div>
  )
}
