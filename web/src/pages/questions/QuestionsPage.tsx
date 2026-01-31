import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CheckCircle2, Flame, Loader2 } from 'lucide-react'
import { api, type QuestionSummary } from '@/lib/api'
import { timeAgo } from '@/lib/time'

const SORT_MAP = { newest: 'new', active: 'new', hot: 'hot', unanswered: 'unanswered' } as const

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center w-[54px]">
      <span className={cn(
        'text-[15px] font-semibold tabular-nums',
        value > 0 ? 'text-foreground' : 'text-muted-foreground/40'
      )}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground/60 leading-none mt-0.5">{label}</span>
    </div>
  )
}

function QuestionRow({ question }: { question: QuestionSummary }) {
  const { upvotes, answer_count, has_accepted } = question

  return (
    <Link
      to={`/questions/${question.id}`}
      className="question-row flex gap-5 py-4 px-5 group block no-underline text-inherit"
    >
      <div className="flex gap-1 shrink-0 pt-1">
        <StatCell value={upvotes} label="votes" />
        <div className="relative">
          <StatCell value={answer_count} label={answer_count === 1 ? 'answer' : 'answers'} />
          {has_accepted && (
            <CheckCircle2 className="h-3.5 w-3.5 text-success absolute -top-0.5 -right-1" />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <span className="text-[15px] font-semibold text-foreground group-hover:text-primary leading-snug mb-1 block transition-colors duration-150">
          {question.title}
        </span>
        <p className="text-[13px] text-muted-foreground line-clamp-1 mb-3 leading-relaxed">
          {question.body}
        </p>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:bg-muted-foreground/10 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-0.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
                  {(question.author_name || '??').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] font-medium text-foreground/70">{question.author_name}</span>
              <span className="text-[10px] text-muted-foreground">{question.author_karma}</span>
            </div>
            <span className="text-[11px] text-muted-foreground/50">{timeAgo(question.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function QuestionsPage() {
  const [sort, setSort] = useState<keyof typeof SORT_MAP>('newest')
  const [questions, setQuestions] = useState<QuestionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.questions.list(SORT_MAP[sort])
      .then((data) => setQuestions(data.questions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [sort])

  return (
    <div className="max-w-3xl mx-auto py-6 px-6">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Questions</h1>
          {!loading && (
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {questions.length} questions
            </p>
          )}
        </div>
        <Tabs value={sort} onValueChange={(v) => setSort(v as keyof typeof SORT_MAP)}>
          <TabsList className="h-8">
            <TabsTrigger value="newest" className="text-xs h-7 px-3">Newest</TabsTrigger>
            <TabsTrigger value="active" className="text-xs h-7 px-3">Active</TabsTrigger>
            <TabsTrigger value="hot" className="text-xs h-7 px-3 gap-1">
              <Flame className="h-3 w-3" />
              Hot
            </TabsTrigger>
            <TabsTrigger value="unanswered" className="text-xs h-7 px-3">Unanswered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Separator />

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && questions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">No questions yet.</p>
        </div>
      )}

      {!loading && !error && questions.length > 0 && (
        <div className="divide-y divide-border/60">
          {questions.map((q) => (
            <QuestionRow key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  )
}
