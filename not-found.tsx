import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🗳️</div>
        <h1 className="text-4xl font-black mb-3">Poll not found</h1>
        <p className="text-gray-400 mb-8">This poll may have expired or the link is incorrect.</p>
        <Link
          href="/create"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-3 rounded-2xl hover:opacity-90 transition-opacity"
        >
          Create a new poll
        </Link>
      </div>
    </div>
  )
}
