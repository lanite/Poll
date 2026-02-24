'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { createClient } from '@/lib/supabase/client'
import { Poll, VoteResult, RawResult } from '@/types'
import ResultsBar from './ResultsBar'
import ShareDrawer from './ShareDrawer'
import LiveBadge from '@/components/ui/LiveBadge'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import Link from 'next/link'

function getFingerprint(): string {
  if (typeof window === 'undefined') return ''
  const stored = localStorage.getItem('vp_fid')
  if (stored) return stored
  const fid = Math.random().toString(36).slice(2) + Date.now().toString(36)
  localStorage.setItem('vp_fid', fid)
  return fid
}

function calculateResults(raw: RawResult[], totalOptions: number): VoteResult[] {
  const total = raw.reduce((sum, r) => sum + Number(r.vote_count), 0)
  return Array.from({ length: totalOptions }, (_, i) => {
    const match = raw.find((r) => r.option_index === i)
    const count = match ? Number(match.vote_count) : 0
    return {
      option_index: i,
      vote_count: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }
  })
}

export default function PollVoteClient({
  poll,
  initialResults,
}: {
  poll: Poll
  initialResults: RawResult[]
}) {
  const supabase = createClient()
  const [voted, setVoted] = useState<number | null>(null)
  const [results, setResults] = useState<VoteResult[]>(
    calculateResults(initialResults, poll.options.length)
  )
  const [totalVotes, setTotalVotes] = useState(poll.total_votes)
  const [loading, setLoading] = useState<number | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [recentActivity, setRecentActivity] = useState<string | null>(null)
  const [voteError, setVoteError] = useState('')

  // Check prior vote in localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`voted_${poll.id}`)
    if (stored !== null) setVoted(parseInt(stored))
  }, [poll.id])

  // Real-time vote subscription
  useEffect(() => {
    const channel = supabase
      .channel(`poll-${poll.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${poll.id}`,
        },
        async () => {
          const { data } = await supabase.rpc('get_poll_results', { poll_slug: poll.slug })
          if (data) {
            const updated = calculateResults(data, poll.options.length)
            setResults(updated)
            const newTotal = updated.reduce((s, r) => s + r.vote_count, 0)
            setTotalVotes(newTotal)
            setRecentActivity('Someone just voted!')
            setTimeout(() => setRecentActivity(null), 3000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [poll.id, poll.slug, supabase])

  const handleVote = useCallback(
    async (optionIndex: number) => {
      if (voted !== null || loading !== null) return
      setLoading(optionIndex)
      setVoteError('')

      const fid = getFingerprint()
      try {
        const res = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            poll_id: poll.id,
            option_index: optionIndex,
            voter_fingerprint: fid,
          }),
        })

        if (res.ok) {
          setVoted(optionIndex)
          localStorage.setItem(`voted_${poll.id}`, String(optionIndex))

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.65 },
            colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
          })

          const { data } = await supabase.rpc('get_poll_results', { poll_slug: poll.slug })
          if (data) {
            const updated = calculateResults(data, poll.options.length)
            setResults(updated)
            setTotalVotes(updated.reduce((s, r) => s + r.vote_count, 0))
          }

          setTimeout(() => setShowShare(true), 1800)
        } else if (res.status === 409) {
          setVoted(optionIndex)
          localStorage.setItem(`voted_${poll.id}`, String(optionIndex))
        } else {
          setVoteError('Could not record your vote. Try again.')
        }
      } catch {
        setVoteError('Network error. Please try again.')
      }
      setLoading(null)
    },
    [voted, loading, poll.id, poll.slug, supabase]
  )

  const hasVoted = voted !== null
  const showResults = hasVoted || poll.settings?.show_results_before_vote
  const maxPercentage = Math.max(...results.map((r) => r.percentage), 1)

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors font-medium">
            ViralPoll
          </Link>
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {recentActivity && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-sm text-green-400 font-medium"
                >
                  {recentActivity}
                </motion.div>
              )}
            </AnimatePresence>
            <LiveBadge />
          </div>
        </div>

        {/* Poll card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 rounded-3xl p-6 shadow-2xl border border-white/5"
        >
          <h1 className="text-2xl md:text-3xl font-black mb-2 leading-tight">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="text-gray-400 mb-4 text-sm">{poll.description}</p>
          )}

          <div className="flex items-center gap-3 mb-6 text-sm text-gray-400">
            <span>
              <AnimatedCounter value={totalVotes} />{' '}
              {totalVotes === 1 ? 'vote' : 'votes'}
            </span>
            <span>·</span>
            <span>{poll.options.length} options</span>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {poll.options.map((option, i) => {
              const result = results[i] ?? { option_index: i, vote_count: 0, percentage: 0 }
              const isWinning =
                showResults && result.percentage === maxPercentage && result.vote_count > 0
              const isMyVote = voted === i

              return (
                <motion.div key={option.id} layout>
                  {!showResults ? (
                    <motion.button
                      onClick={() => handleVote(i)}
                      disabled={loading !== null}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left px-5 py-4 rounded-2xl font-semibold text-lg border-2 transition-all relative overflow-hidden
                        ${
                          loading === i
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/10 bg-white/5 hover:border-purple-400 hover:bg-purple-500/10'
                        }`}
                    >
                      {loading === i && (
                        <motion.div
                          className="absolute inset-0 bg-purple-500/20"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          style={{ transformOrigin: 'left' }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      <span className="relative z-10">{option.text}</span>
                    </motion.button>
                  ) : (
                    <ResultsBar
                      option={option}
                      result={result}
                      isMyVote={isMyVote}
                      isWinning={isWinning}
                      animate={hasVoted}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Error */}
          <AnimatePresence>
            {voteError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-red-400 text-sm text-center"
              >
                {voteError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Post-vote CTA */}
          <AnimatePresence>
            {hasVoted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-white/5"
              >
                <p className="text-center text-gray-400 text-sm mb-4">
                  You voted for{' '}
                  <span className="text-white font-semibold">
                    {poll.options[voted]?.text}
                  </span>
                </p>
                <button
                  onClick={() => setShowShare(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-2xl text-base hover:opacity-90 transition-opacity"
                >
                  Share this poll 🚀
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Made with{' '}
          <Link href="/create" className="hover:text-gray-500 transition-colors">
            ViralPoll
          </Link>
        </p>
      </div>

      <ShareDrawer
        poll={poll}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        totalVotes={totalVotes}
      />
    </div>
  )
}
