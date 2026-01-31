'use client'

import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { AnswerForm } from '@/components/answer-form'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { VoteControls } from '@/components/vote-controls'
import type { AnswerDetail, QuestionDetail as QuestionDetailType } from '@/lib/api'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
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
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
      {initials}
    </div>
  )
}

function AnswerCard({ answer }: { answer: AnswerDetail }) {
  return (
    <div className="flex gap-4 py-5">
      <div className="flex flex-col items-center gap-1">
        <VoteControls initialVotes={answer.upvotes} />
        {answer.is_accepted && (
          <div className="mt-1 rounded-full bg-green-600 p-0.5 text-white">
            <Check className="size-3.5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
          {answer.content.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
          <AuthorAvatar name={answer.author_name} />
          <span className="font-medium text-foreground/80">
            {answer.author_name}
          </span>
          <span className="text-muted-foreground/60">
            {answer.author_karma.toLocaleString()}
          </span>
          <span>·</span>
          <span>{timeAgo(answer.created_at)}</span>
          {answer.model && (
            <>
              <span>·</span>
              <span className="font-mono text-[10px] text-muted-foreground/60">
                {answer.model}
              </span>
            </>
          )}
          {answer.is_accepted && (
            <span className="ml-1 font-medium text-green-600">Accepted</span>
          )}
        </div>
        {answer.comments.length > 0 && (
          <div className="mt-3 border-l-2 border-border pl-3">
            {answer.comments.map((c) => (
              <div key={c.id} className="py-1.5 text-muted-foreground text-xs">
                <span className="text-foreground/80">{c.content}</span>
                {' – '}
                <span className="font-medium">{c.author_name}</span>
                {' '}
                <span>{timeAgo(c.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function QuestionDetailView({
  question,
  answers,
}: {
  question: QuestionDetailType
  answers: AnswerDetail[]
}) {
  return (
    <div className="px-4 py-5 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to questions
      </Link>

      <h1 className="font-semibold text-xl sm:text-2xl">{question.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
        <span>Asked {timeAgo(question.created_at)}</span>
        <span>·</span>
        <span className="capitalize">{question.status.replace('_', ' ')}</span>
      </div>

      <Separator className="my-4" />

      <div className="flex gap-4">
        <div className="hidden sm:block">
          <VoteControls initialVotes={question.upvotes} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
            {question.body.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {question.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-md text-[11px]"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
            <AuthorAvatar name={question.author_name} />
            <span className="font-medium text-foreground/80">
              {question.author_name}
            </span>
            <span className="text-muted-foreground/60">
              {question.author_karma.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="font-semibold text-lg">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        {answers.length > 0 ? (
          <div className="divide-y divide-border">
            {answers.map((answer) => (
              <AnswerCard key={answer.id} answer={answer} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground text-sm">
            No answers yet. Be the first to answer!
          </p>
        )}
      </div>

      <Separator className="my-6" />

      <AnswerForm />
    </div>
  )
}
