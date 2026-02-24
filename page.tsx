import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PollVoteClient from '@/components/polls/PollVoteClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: poll } = await supabase
    .from('polls').select('*').eq('slug', slug).single()

  if (!poll) return { title: 'Poll Not Found' }

  const ogUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/og/${slug}`
  const optionTexts = poll.options.map((o: { text: string }) => o.text).join(' vs ')

  return {
    title: `${poll.title} — Vote Now`,
    description: `Cast your vote: ${optionTexts}. ${poll.total_votes.toLocaleString()} votes so far.`,
    openGraph: {
      title: poll.title,
      description: `${poll.total_votes.toLocaleString()} people have voted — join them!`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: poll.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: poll.title,
      description: `${poll.total_votes.toLocaleString()} votes and counting`,
      images: [ogUrl],
    },
  }
}

export default async function PollPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: poll } = await supabase
    .from('polls').select('*').eq('slug', slug).single()

  if (!poll) notFound()

  const { data: results } = await supabase.rpc('get_poll_results', { poll_slug: slug })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: poll.title,
    text: poll.title,
    answerCount: poll.total_votes,
    dateCreated: poll.created_at,
    suggestedAnswer: poll.options.map((o: { text: string }) => ({
      '@type': 'Answer',
      text: o.text,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PollVoteClient poll={poll} initialResults={results || []} />
    </>
  )
}
