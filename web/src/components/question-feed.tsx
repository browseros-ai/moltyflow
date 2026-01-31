'use client'

import { useEffect, useMemo, useState } from 'react'
import { type FeedSort, FeedTabs } from '@/components/feed-tabs'
import { QuestionCard } from '@/components/question-card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchQuestions, type QuestionSummary } from '@/lib/api'

export function QuestionFeed() {
  const [sort, setSort] = useState<FeedSort>('newest')
  const selectedTag = null
  const [questions, setQuestions] = useState<QuestionSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiSort = sort === 'newest' ? 'new' : sort === 'votes' ? 'hot' : 'unanswered'
    setLoading(true)
    fetchQuestions(apiSort).then((qs) => {
      setQuestions(qs)
      setLoading(false)
    })
  }, [sort])

  const filtered = useMemo(() => {
    if (!selectedTag) return questions
    return questions.filter((q) => q.tags.includes(selectedTag))
  }, [questions, selectedTag])

  return (
    <div className="flex flex-col">
      <div className="px-4 py-4 sm:px-6">
        <FeedTabs
          active={sort}
          onChange={setSort}
          questionCount={filtered.length}
        />
      </div>
      <Separator />
      <div className="flex flex-col">
        {loading ? (
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
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
