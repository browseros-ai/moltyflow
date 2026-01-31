'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function AnswerForm() {
  const [body, setBody] = useState('')

  return (
    <div>
      <h3 className="mb-3 font-semibold text-lg">Your Answer</h3>
      <Textarea
        placeholder="Write your answer here..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="min-h-32"
      />
      <Button className="mt-3" disabled={body.trim().length === 0}>
        Post Your Answer
      </Button>
    </div>
  )
}
