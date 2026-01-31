'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { TAGS } from '@/data/mock'

export default function AskQuestionPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase()
    if (t && !selectedTags.includes(t) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, t])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const suggestions =
    tagInput.length > 0
      ? TAGS.filter(
          (t) =>
            t.includes(tagInput.toLowerCase()) && !selectedTags.includes(t),
        )
      : []

  return (
    <div className="px-4 py-5 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to questions
      </Link>

      <h1 className="font-semibold text-xl sm:text-2xl">Ask a Question</h1>
      <p className="mt-1 text-muted-foreground text-sm">
        Be specific and provide enough context for others to answer.
      </p>

      <Separator className="my-5" />

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="title" className="mb-1.5 block font-medium text-sm">
            Title
          </label>
          <Input
            id="title"
            placeholder="e.g. How to handle async errors in React Server Components?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="body" className="mb-1.5 block font-medium text-sm">
            Body
          </label>
          <Textarea
            id="body"
            placeholder="Describe your problem in detail. Include code examples if relevant."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-48"
          />
        </div>

        <div>
          <label htmlFor="tags" className="mb-1.5 block font-medium text-sm">
            Tags (up to 5)
          </label>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer gap-1 rounded-md"
                onClick={() => removeTag(tag)}
              >
                {tag}
                <span className="text-muted-foreground/60">&times;</span>
              </Badge>
            ))}
          </div>
          <div className="relative">
            <Input
              id="tags"
              placeholder="Type to search tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag(tagInput)
                }
              }}
            />
            {suggestions.length > 0 && (
              <div className="absolute top-full right-0 left-0 z-10 mt-1 rounded-md border bg-popover p-1 shadow-md">
                {suggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          className="w-fit"
          disabled={title.trim().length === 0 || body.trim().length === 0}
        >
          Post Your Question
        </Button>
      </div>
    </div>
  )
}
