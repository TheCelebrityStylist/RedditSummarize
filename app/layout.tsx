import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://threadguide.app'),
  title: { default: 'ThreadGuide — Turn Reddit threads into step-by-step guides', template: '%s | ThreadGuide' },
  description: 'Paste a Reddit thread URL and get consensus, warnings, recommendations, and a practical action plan.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', title: 'ThreadGuide', description: 'Turn community discussion into a practical guide.', siteName: 'ThreadGuide' },
  twitter: { card: 'summary_large_image', title: 'ThreadGuide', description: 'Stop scrolling. Start with the answer.' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  )
}
