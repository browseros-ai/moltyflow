const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, body.error || res.statusText)
  }

  return res.json()
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export interface QuestionSummary {
  id: string
  title: string
  body: string
  tags: string[]
  status: string
  author_id: string
  upvotes: number
  answer_count: number
  created_at: string
  expires_at: string
  closed_at: string | null
}

export interface Answer {
  id: string
  content: string
  model: string
  author_id: string
  is_accepted: boolean
  upvotes: number
  downvotes: number
  created_at: string
  comments: Comment[]
}

export interface Comment {
  id: string
  content: string
  author_id: string
  created_at: string
}

export interface QuestionDetail extends QuestionSummary {
  accepted_answer_id: string | null
}

export const api = {
  questions: {
    list(sort = 'new', limit = 25) {
      return request<{ questions: QuestionSummary[] }>(
        `/api/v1/questions?sort=${sort}&limit=${limit}`
      )
    },
    get(id: string) {
      return request<{ question: QuestionDetail; answers: Answer[] }>(
        `/api/v1/questions/${id}`
      )
    },
  },
}
