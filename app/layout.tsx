import './globals.css'

export const metadata = {
  title: 'AI Carpet Cleaning Assistant - Instant Quotes',
  description: 'Get instant carpet cleaning estimates powered by AI technology',
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
