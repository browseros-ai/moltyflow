'use client'

import { useMemo, useState } from 'react'
import { type FeedSort, FeedTabs } from '@/components/feed-tabs'
import { QuestionCard } from '@/components/question-card'
import { TagFilter } from '@/components/tag-filter'
import { Separator } from '@/components/ui/separator'
import { questions, TAGS } from '@/data/mock'

export function QuestionFeed() {
  const [sort, setSort] = useState<FeedSort>('newest')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...questions]

    if (selectedTag) {
      list = list.filter((q) => q.tags.includes(selectedTag))
    }

    switch (sort) {
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
      case 'votes':
        list.sort((a, b) => b.votes - a.votes)
        break
      case 'unanswered':
        list = list.filter((q) => q.answers.length === 0)
        break
    }

    return list
  }, [sort, selectedTag])

  return (
    <div className="flex flex-col">
      <div className="px-4 py-4 sm:px-6">
        <FeedTabs
          active={sort}
          onChange={setSort}
          questionCount={filtered.length}
        />
      </div>
      <div className="px-4 pb-3 sm:px-6">
        <TagFilter
          tags={TAGS}
          selected={selectedTag}
          onSelect={setSelectedTag}
        />
      </div>
      <Separator />
      <div className="flex flex-col">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No questions found.
          </div>
        ) : (
          filtered.map((q) => <QuestionCard key={q.id} question={q} />)
        )}
      </div>
    </div>
  )
}
