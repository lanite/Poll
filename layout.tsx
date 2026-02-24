import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'ViralPoll — Create polls that spread',
    template: '%s | ViralPoll',
  },
  description:
    'Create viral polls in seconds. Real-time results, beautiful sharing, and live vote counts that make every poll an event.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    siteName: 'ViralPoll',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
