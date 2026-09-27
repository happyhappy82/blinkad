import Link from 'next/link'

export default function EnglishNotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
    <div><p className="mb-4 text-7xl font-bold text-brand-blue">404</p><h1 className="mb-4 text-2xl font-semibold">Page not found</h1><p className="mb-8 text-gray-400">This page may have moved or does not exist.</p><Link href="/en" className="rounded-full bg-brand-blue px-6 py-3 font-medium">Back to home</Link></div>
  </main>
}
