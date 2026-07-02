'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createSupabaseBrowserClient()

  async function signIn() {
    if (!supabase) return setMessage('Add Supabase env vars to enable auth.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMessage(error ? error.message : 'Signed in. Redirecting...')
    if (!error) window.location.href = '/dashboard'
  }
  async function signUp() {
    if (!supabase) return setMessage('Add Supabase env vars to enable auth.')
    const { error } = await supabase.auth.signUp({ email, password })
    setMessage(error ? error.message : 'Check your email to confirm your account.')
  }
  async function magicLink() {
    if (!supabase) return setMessage('Add Supabase env vars to enable auth.')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/dashboard` } })
    setMessage(error ? error.message : 'Magic link sent.')
  }

  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5"><Link href="/" className="mb-8 text-xl font-black">ThreadGuide</Link><div className="rounded-3xl border border-line bg-white p-6 shadow-soft"><h1 className="text-2xl font-black">Login or sign up</h1><div className="mt-6 space-y-3"><input className="w-full rounded-xl border border-line px-4 py-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><input className="w-full rounded-xl border border-line px-4 py-3" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><button onClick={signIn} className="w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white">Login</button><button onClick={signUp} className="w-full rounded-xl border border-line px-4 py-3 font-semibold">Create account</button><button onClick={magicLink} className="w-full rounded-xl border border-line px-4 py-3 font-semibold">Send magic link</button>{message && <p className="text-sm text-slate-600">{message}</p>}</div></div></main>
}
