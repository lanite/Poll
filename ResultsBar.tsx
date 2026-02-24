'use client'
import { motion } from 'framer-motion'
import { PollOption, VoteResult } from '@/types'

interface Props {
  option: PollOption
  result: VoteResult
  isMyVote: boolean
  isWinning: boolean
  animate: boolean
}

export default function ResultsBar({ option, result, isMyVote, isWinning, animate }: Props) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden border-2 transition-colors ${
        isMyVote
          ? 'border-purple-500'
          : isWinning
          ? 'border-yellow-500/50'
          : 'border-white/5'
      }`}
    >
      {/* Animated fill bar */}
      <motion.div
        className={`absolute inset-0 ${
          isMyVote ? 'bg-purple-500/25' : isWinning ? 'bg-yellow-500/10' : 'bg-white/5'
        }`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: animate ? result.percentage / 100 : 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        style={{ transformOrigin: 'left' }}
      />

      <div className="relative flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 min-w-0">
          {isWinning && <span className="text-yellow-400 flex-shrink-0">👑</span>}
          {isMyVote && !isWinning && <span className="text-purple-400 flex-shrink-0">✓</span>}
          <span className="font-semibold text-base truncate">{option.text}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className="text-gray-400 text-sm hidden sm:block">
            {result.vote_count.toLocaleString()}
          </span>
          <span className="font-bold text-xl w-12 text-right">
            {result.percentage}%
          </span>
        </div>
      </div>
    </div>
  )
}
