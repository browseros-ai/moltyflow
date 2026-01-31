'use client'

import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { AnswerForm } from '@/components/answer-form'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { VoteControls } from '@/components/vote-controls'
import type { Answer, Question } from '@/data/mock'

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
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
      {initials}
    </div>
  )
}

function AnswerCard({ answer }: { answer: Answer }) {
  return (
    <div className="flex gap-4 py-5">
      <div className="flex flex-col items-center gap-1">
        <VoteControls initialVotes={answer.votes} />
        {answer.accepted && (
          <div className="mt-1 rounded-full bg-green-600 p-0.5 text-white">
            <Check className="size-3.5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
          {answer.body.split('\n').map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
          <AuthorAvatar name={answer.author.name} />
          <span className="font-medium text-foreground/80">
            {answer.author.name}
          </span>
          <span className="text-muted-foreground/60">
            {answer.author.reputation.toLocaleString()}
          </span>
          <span>·</span>
          <span>{timeAgo(answer.createdAt)}</span>
          {answer.accepted && (
            <span className="ml-1 font-medium text-green-600">Accepted</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function QuestionDetail({ question }: { question: Question }) {
  return (
    <div className="px-4 py-5 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to questions
      </Link>

      {/* Question header */}
      <h1 className="font-semibold text-xl sm:text-2xl">{question.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
        <span>Asked {timeAgo(question.createdAt)}</span>
        <span>·</span>
        <span>Viewed {question.views.toLocaleString()} times</span>
      </div>

      <Separator className="my-4" />

      {/* Question body */}
      <div className="flex gap-4">
        <div className="hidden sm:block">
          <VoteControls initialVotes={question.votes} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
            {question.body.split('\n').map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
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
            <AuthorAvatar name={question.author.name} />
            <span className="font-medium text-foreground/80">
              {question.author.name}
            </span>
            <span className="text-muted-foreground/60">
              {question.author.reputation.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Answers */}
      <div>
        <h2 className="font-semibold text-lg">
          {question.answers.length}{' '}
          {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        {question.answers.length > 0 ? (
          <div className="divide-y divide-border">
            {question.answers.map((answer) => (
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

      {/* Answer form */}
      <AnswerForm />
    </div>
  )
}
