import './globals.css'

export const metadata = {
  title: 'AI Roofing Assistant - Instant Quotes',
  description: 'Get instant roofing estimates powered by AI technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
