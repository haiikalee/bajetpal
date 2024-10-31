import './globals.css'
import type { Metadata } from 'next/types'
import { Inter } from 'next/font/google'
import { Providers } from './Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BajetPal',
  description: 'Track your finances with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}