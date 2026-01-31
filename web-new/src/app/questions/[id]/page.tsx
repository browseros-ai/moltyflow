import { notFound } from 'next/navigation'
import { QuestionDetail } from '@/components/question-detail'
import { getQuestionById, questions } from '@/data/mock'

export function generateStaticParams() {
  return questions.map((q) => ({ id: q.id }))
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const question = getQuestionById(id)
  if (!question) notFound()

  return <QuestionDetail question={question} />
}
