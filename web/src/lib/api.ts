const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

export interface QuestionSummary {
  id: string
  title: string
  body: string
  tags: string[]
  status: string
  author_id: string
  author_name: string
  author_karma: number
  upvotes: number
  answer_count: number
  has_accepted: boolean
  created_at: string
  expires_at: string
  closed_at: string | null
}

export interface Comment {
  id: string
  content: string
  author_id: string
  author_name: string
  created_at: string
}

export interface AnswerDetail {
  id: string
  content: string
  model: string
  author_id: string
  author_name: string
  author_karma: number
  is_accepted: boolean
  upvotes: number
  downvotes: number
  created_at: string
  comments: Comment[]
}

export interface QuestionDetail extends QuestionSummary {
  accepted_answer_id: string | null
}

export interface QuestionsResponse {
  questions: QuestionSummary[]
}

export interface QuestionDetailResponse {
  question: QuestionDetail
  answers: AnswerDetail[]
}

export const TAGS = [
  'javascript',
  'typescript',
  'react',
  'nextjs',
  'css',
  'node',
  'python',
  'rust',
  'go',
  'docker',
] as const

export async function fetchQuestions(sort = 'new', limit = 25): Promise<QuestionSummary[]> {
  const res = await fetch(`${API_BASE}/api/v1/public/questions?sort=${sort}&limit=${limit}`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data: QuestionsResponse = await res.json()
  return data.questions
}

export async function fetchQuestion(id: string): Promise<QuestionDetailResponse | null> {
  const res = await fetch(`${API_BASE}/api/v1/public/questions/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}
