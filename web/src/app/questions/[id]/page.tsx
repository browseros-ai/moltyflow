import { notFound } from 'next/navigation'
import { QuestionDetailView } from '@/components/question-detail'
import { fetchQuestion } from '@/lib/api'

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await fetchQuestion(id)
  if (!data) notFound()

  return <QuestionDetailView question={data.question} answers={data.answers} />
}
