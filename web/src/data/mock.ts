export interface Author {
  name: string
  avatarUrl: string
  reputation: number
}

export interface Answer {
  id: string
  body: string
  votes: number
  author: Author
  createdAt: string
  accepted: boolean
}

export interface Question {
  id: string
  title: string
  body: string
  excerpt: string
  tags: string[]
  votes: number
  answers: Answer[]
  views: number
  author: Author
  createdAt: string
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

const authors: Author[] = [
  { name: 'Sarah Chen', avatarUrl: '', reputation: 4218 },
  { name: 'Marcus Webb', avatarUrl: '', reputation: 1053 },
  { name: 'Priya Sharma', avatarUrl: '', reputation: 8721 },
  { name: 'Alex Kim', avatarUrl: '', reputation: 312 },
  { name: 'Jordan Liu', avatarUrl: '', reputation: 2190 },
]

export const questions: Question[] = [
  {
    id: '1',
    title: 'How to handle server-side authentication in Next.js App Router?',
    body: `I'm building a Next.js 15 app and need to protect certain routes. I'm using the App Router and want to verify JWT tokens on the server side before rendering pages.\n\nI've tried using middleware but I'm not sure if that's the right approach for checking auth tokens. Should I use middleware, server components, or route handlers for this?\n\n\`\`\`typescript\n// middleware.ts\nimport { NextResponse } from 'next/server'\nimport type { NextRequest } from 'next/server'\n\nexport function middleware(request: NextRequest) {\n  const token = request.cookies.get('auth-token')\n  if (!token) {\n    return NextResponse.redirect(new URL('/login', request.url))\n  }\n}\n\nexport const config = {\n  matcher: ['/dashboard/:path*'],\n}\n\`\`\`\n\nIs this the recommended pattern, or should I handle this differently?`,
    excerpt:
      "I'm building a Next.js 15 app and need to protect certain routes. I'm using the App Router and want to verify JWT tokens on the server side before rendering pages...",
    tags: ['nextjs', 'typescript', 'react'],
    votes: 12,
    views: 234,
    author: authors[0],
    createdAt: '2025-01-28T14:30:00Z',
    answers: [
      {
        id: 'a1',
        body: `The middleware approach is good for redirects, but you should also validate tokens in your server components for defense in depth.\n\n\`\`\`typescript\n// app/dashboard/layout.tsx\nimport { cookies } from 'next/headers'\nimport { redirect } from 'next/navigation'\nimport { verifyToken } from '@/lib/auth'\n\nexport default async function DashboardLayout({ children }) {\n  const cookieStore = await cookies()\n  const token = cookieStore.get('auth-token')?.value\n  \n  if (!token || !await verifyToken(token)) {\n    redirect('/login')\n  }\n  \n  return <>{children}</>\n}\n\`\`\`\n\nUse middleware for fast redirects (no token = redirect), and server component layouts for full token verification. This gives you both speed and security.`,
        votes: 8,
        author: authors[2],
        createdAt: '2025-01-28T15:45:00Z',
        accepted: true,
      },
      {
        id: 'a2',
        body: `You might also want to look into next-auth (now Auth.js) which handles a lot of this for you out of the box with the App Router. It provides session management, middleware helpers, and server-side session access.\n\nBut if you're rolling your own, the middleware + layout approach above is solid.`,
        votes: 3,
        author: authors[4],
        createdAt: '2025-01-28T16:20:00Z',
        accepted: false,
      },
    ],
  },
  {
    id: '2',
    title: 'Why does useEffect fire twice in React 19 strict mode?',
    body: `I noticed my useEffect cleanup runs and the effect re-fires when the component mounts. Is this expected behavior in React 19?\n\n\`\`\`tsx\nuseEffect(() => {\n  console.log('mounted')\n  return () => console.log('cleanup')\n}, [])\n// Output: mounted, cleanup, mounted\n\`\`\``,
    excerpt:
      'I noticed my useEffect cleanup runs and the effect re-fires when the component mounts. Is this expected behavior in React 19?',
    tags: ['react', 'javascript'],
    votes: 24,
    views: 1892,
    author: authors[1],
    createdAt: '2025-01-27T09:15:00Z',
    answers: [
      {
        id: 'a3',
        body: `Yes, this is intentional. React Strict Mode in development deliberately double-invokes effects to help you find bugs with missing cleanup. Your effects should be resilient to being called multiple times. This does NOT happen in production builds.\n\nThe React team introduced this to catch common issues like event listeners not being cleaned up or subscriptions being duplicated.`,
        votes: 31,
        author: authors[2],
        createdAt: '2025-01-27T09:45:00Z',
        accepted: true,
      },
    ],
  },
  {
    id: '3',
    title: 'Implementing a rate limiter in Rust using token bucket algorithm',
    body: 'I need to implement a rate limiter for my API gateway in Rust. Looking for a clean token bucket implementation that works with tokio.',
    excerpt:
      'I need to implement a rate limiter for my API gateway in Rust. Looking for a clean token bucket implementation that works with tokio...',
    tags: ['rust', 'docker'],
    votes: 7,
    views: 445,
    author: authors[3],
    createdAt: '2025-01-26T18:00:00Z',
    answers: [],
  },
  {
    id: '4',
    title: 'CSS container queries not working with Tailwind v4',
    body: "I'm trying to use @container queries with Tailwind v4 but the responsive styles aren't applying. I've added the @container class to the parent element.",
    excerpt:
      "I'm trying to use @container queries with Tailwind v4 but the responsive styles aren't applying...",
    tags: ['css', 'react', 'nextjs'],
    votes: 5,
    views: 312,
    author: authors[4],
    createdAt: '2025-01-29T11:30:00Z',
    answers: [
      {
        id: 'a4',
        body: 'In Tailwind v4, container queries work differently. You need to use the `@container` variant prefix directly. Make sure your parent has `@container` class and children use `@sm:`, `@md:` etc. as variant prefixes.',
        votes: 4,
        author: authors[0],
        createdAt: '2025-01-29T12:15:00Z',
        accepted: false,
      },
    ],
  },
  {
    id: '5',
    title: 'Best practices for error boundaries in React Server Components?',
    body: "With the shift to RSC in Next.js, I'm unclear on how error boundaries should work. Can I use error.tsx files as the primary error handling mechanism?",
    excerpt:
      "With the shift to RSC in Next.js, I'm unclear on how error boundaries should work...",
    tags: ['react', 'nextjs', 'typescript'],
    votes: 18,
    views: 890,
    author: authors[2],
    createdAt: '2025-01-25T07:45:00Z',
    answers: [
      {
        id: 'a5',
        body: "Yes, `error.tsx` files in the App Router act as error boundaries. They must be client components (add 'use client' at the top). They catch errors from the corresponding page.tsx and all nested child segments. You can also add a `global-error.tsx` at the app root for catching errors in the root layout.",
        votes: 14,
        author: authors[0],
        createdAt: '2025-01-25T08:30:00Z',
        accepted: true,
      },
    ],
  },
  {
    id: '6',
    title: 'How to set up Docker multi-stage builds for a Go microservice?',
    body: "I want to minimize my Go container image size. Currently it's over 1GB. How do I use multi-stage builds effectively?",
    excerpt:
      "I want to minimize my Go container image size. Currently it's over 1GB...",
    tags: ['go', 'docker'],
    votes: 9,
    views: 567,
    author: authors[1],
    createdAt: '2025-01-24T16:20:00Z',
    answers: [],
  },
  {
    id: '7',
    title:
      'TypeScript discriminated unions vs class hierarchy for domain modeling?',
    body: "I'm modeling a payment system and debating between using discriminated unions or a class hierarchy. What are the trade-offs in a TypeScript codebase?",
    excerpt:
      "I'm modeling a payment system and debating between using discriminated unions or a class hierarchy...",
    tags: ['typescript', 'javascript'],
    votes: 32,
    views: 2103,
    author: authors[0],
    createdAt: '2025-01-23T13:00:00Z',
    answers: [
      {
        id: 'a6',
        body: "Discriminated unions are generally preferred in TypeScript. They give you exhaustive pattern matching with switch statements, work well with the type system, and don't require instantiation. Classes add runtime overhead and are harder to serialize. Use unions for data, classes for behavior-heavy objects.",
        votes: 28,
        author: authors[2],
        createdAt: '2025-01-23T14:00:00Z',
        accepted: true,
      },
      {
        id: 'a7',
        body: "I'd add that discriminated unions compose better. You can easily create union types from other unions. With classes, you're locked into a rigid inheritance tree that's hard to refactor later.",
        votes: 11,
        author: authors[4],
        createdAt: '2025-01-23T15:30:00Z',
        accepted: false,
      },
    ],
  },
  {
    id: '8',
    title: 'Python asyncio vs threading for I/O-bound web scraping?',
    body: "I'm building a web scraper that fetches ~10k pages. Should I use asyncio with aiohttp or threading with requests? What are the practical differences?",
    excerpt:
      "I'm building a web scraper that fetches ~10k pages. Should I use asyncio with aiohttp or threading...",
    tags: ['python', 'node'],
    votes: 15,
    views: 1240,
    author: authors[3],
    createdAt: '2025-01-22T20:15:00Z',
    answers: [
      {
        id: 'a8',
        body: 'For 10k pages, asyncio with aiohttp will be significantly more efficient. Threading creates OS-level threads with higher memory overhead. asyncio uses a single thread with cooperative multitasking, which is perfect for I/O-bound work. You can easily handle thousands of concurrent connections without the memory cost of threads.',
        votes: 12,
        author: authors[0],
        createdAt: '2025-01-22T21:00:00Z',
        accepted: true,
      },
    ],
  },
]

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id)
}

export function getQuestionsByTag(tag: string): Question[] {
  return questions.filter((q) => q.tags.includes(tag))
}
