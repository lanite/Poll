'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Poll } from '@/types'

const PLATFORMS = [
  {
    id: 'twitter',
    name: 'X / Twitter',
    icon: '𝕏',
    className: 'bg-black border-white/20 hover:border-white/40',
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    className: 'bg-green-700 border-green-600 hover:bg-green-600',
    getUrl: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'f',
    className: 'bg-blue-700 border-blue-600 hover:bg-blue-600',
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    className: 'bg-sky-600 border-sky-500 hover:bg-sky-500',
    getUrl: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
]

interface Props {
  poll: Poll
  isOpen: boolean
  onClose: () => void
  totalVotes: number
}

export default function ShareDrawer({ poll, isOpen, onClose, totalVotes }: Props) {
  const [copied, setCopied] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const pollUrl = `${appUrl}/poll/${poll.slug}`
  const shareText = `🗳️ "${poll.title}" — ${totalVotes.toLocaleString()} people have voted. What do you think?`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      // Track share count
      await fetch(`/api/polls/${poll.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment_share: true }),
      }).catch(() => {})
    } catch {
      // Fallback
      const el = document.createElement('input')
      el.value = pollUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleShare = (platform: (typeof PLATFORMS)[0]) => {
    const url = platform.getUrl(pollUrl, shareText)
    window.open(url, '_blank', 'width=600,height=500,noopener,noreferrer')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: poll.title, text: shareText, url: pollUrl })
      } catch {
        // User cancelled
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl p-6 z-50 border-t border-white/10 max-w-lg mx-auto"
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6" />

            <h3 className="text-xl font-black mb-1 text-center">Spread the word 🔥</h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              {totalVotes.toLocaleString()} votes — your share could swing the results
            </p>

            {/* Platform buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleShare(platform)}
                  className={`${platform.className} border text-white font-semibold py-3 px-4 rounded-2xl flex items-center gap-3 transition-all`}
                >
                  <span className="text-xl w-6 text-center">{platform.icon}</span>
                  <span className="text-sm">{platform.name}</span>
                </button>
              ))}
            </div>

            {/* Copy link */}
            <button
              onClick={copyLink}
              className="w-full bg-gray-800 border border-white/10 hover:border-white/20 text-white font-semibold py-3 px-5 rounded-2xl flex items-center gap-3 transition-all mb-3"
            >
              <span className="text-xl">{copied ? '✅' : '🔗'}</span>
              <span>{copied ? 'Link copied!' : 'Copy link'}</span>
              <span className="ml-auto text-gray-500 text-xs font-mono truncate max-w-32">
                {pollUrl.replace(/^https?:\/\//, '')}
              </span>
            </button>

            {/* Native share (mobile) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full bg-gray-800 border border-white/10 text-white font-semibold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:border-white/20"
              >
                📤 More options
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full mt-3 text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
