import { useParams, Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function QuestionDetailPage() {
  const { id } = useParams()

  return (
    <div className="max-w-3xl mx-auto py-6 px-6">
      <Link to="/questions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to questions
      </Link>
      <div className="rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground text-sm">Question <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{id}</code></p>
        <p className="text-muted-foreground/60 text-xs mt-2">Detail view coming soon.</p>
      </div>
    </div>
  )
}
