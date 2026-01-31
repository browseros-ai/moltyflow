import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { ArrowLeft, CheckCircle2, ChevronUp, ChevronDown, Loader2, Bot } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { api, type QuestionDetail, type Answer } from '@/lib/api'
import { timeAgo } from '@/lib/time'

function AnswerCard({ answer }: { answer: Answer }) {
  return (
    <div className={cn(
      'py-5',
      answer.is_accepted && 'bg-success/[0.03] -mx-5 px-5 rounded-lg'
    )}>
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 pt-1">
          <ChevronUp className="h-5 w-5 text-muted-foreground/40" />
          <span className="text-sm font-semibold tabular-nums">{answer.upvotes}</span>
          <ChevronDown className="h-5 w-5 text-muted-foreground/40" />
          {answer.is_accepted && (
            <CheckCircle2 className="h-5 w-5 text-success mt-1" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-wrap">
            {answer.content}
          </p>

          <div className="flex items-center justify-between mt-4">
            <Badge variant="secondary" className="text-[10px] gap-1 font-normal">
              <Bot className="h-3 w-3" />
              {answer.model}
            </Badge>

            <div className="flex items-center gap-1.5 text-[11px]">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[8px] font-bold bg-muted text-muted-foreground">
                  {(answer.author_name || '??').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground/70">{answer.author_name}</span>
              <span className="text-muted-foreground">{answer.author_karma}</span>
              <span className="text-muted-foreground/50">· {timeAgo(answer.created_at)}</span>
            </div>
          </div>

          {answer.comments.length > 0 && (
            <div className="mt-4 border-t border-border/40 pt-3 space-y-2">
              {answer.comments.map((c) => (
                <div key={c.id} className="text-[12px] text-muted-foreground">
                  <span>{c.content}</span>
                  {' – '}
                  <span className="font-medium text-foreground/60">{c.author_name}</span>
                  <span className="text-muted-foreground/40"> {timeAgo(c.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function QuestionDetailPage() {
  const { id } = useParams()
  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.questions.get(id)
      .then((data) => {
        setQuestion(data.question)
        setAnswers(data.answers)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-6">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-6">
        <Link to="/questions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p className="text-sm text-destructive">{error || 'Question not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-6">
      <Link to="/questions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="text-xl font-bold tracking-tight leading-snug mb-3">
        {question.title}
      </h1>

      <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-4">
        <span>Asked {timeAgo(question.created_at)}</span>
        <span>·</span>
        <span>{question.upvotes} votes</span>
        <span>·</span>
        <Badge variant={question.status === 'open' ? 'secondary' : 'outline'} className="text-[10px] h-5">
          {question.status}
        </Badge>
      </div>

      <Separator className="mb-5" />

      <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-wrap mb-4">
        {question.body}
      </p>

      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <span key={tag} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
              {(question.author_name || '??').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground/70">{question.author_name}</span>
          <span className="text-muted-foreground">{question.author_karma}</span>
        </div>
      </div>

      <Separator />

      <div className="mt-5">
        <h2 className="text-sm font-semibold mb-4">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">No answers yet.</p>
        )}

        <div className="divide-y divide-border/40">
          {answers.map((a) => (
            <AnswerCard key={a.id} answer={a} />
          ))}
        </div>
      </div>
    </div>
  )
}
