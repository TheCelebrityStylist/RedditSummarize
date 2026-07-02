import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ThreadGuide — Turn Reddit threads into step-by-step guides',
  description: 'Paste a Reddit thread URL and get consensus, pros, cons, best comments, FAQ, and a practical action plan.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  )
}
