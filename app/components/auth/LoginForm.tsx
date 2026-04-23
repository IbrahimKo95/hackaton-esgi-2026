'use client'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { type FormEvent, useState } from 'react'

interface Props {
    onClose: () => void
}

export default function LoginForm({ onClose }: Props) {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (mode === 'login') {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })
            if (res?.error) setError('Email ou mot de passe incorrect')
            else onClose()

        } else {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstName: firstname, lastName: lastname }),
            })
            if (!res.ok) setError('Une erreur est survenue')
            else {
                await signIn('credentials', { email, password, redirect: false })
                onClose()
            }
        }

        setLoading(false)
    }

    return (
        <div className="sm:py-8 flex justify-center flex-col w-[90%]">
            <div className="flex items-center justify-between mb-8">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center text-black hover:text-shadow-gray-700 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                </button>

                {/* Logo Michelin */}
                <Image src="/star.svg" alt="Logo Michelin" width={64} height={64} className="w-16 h-16" />
                <div className="w-8" /> {/* Spacer */}
            </div>

            {/* Title */}
            <h2 className="text-4xl font-semibold text-center text-gray-900 mb-1 tracking-tight mb-5">
                {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h2>

            {/* Erreur */}
            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">

                {mode === 'register' && (
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Nom"
                            value={lastname}
                            onChange={e => setLastname(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-full border border-black bg-white text-black placeholder:text-black/45"
                        />
                    </div>
                )}
                {mode === 'register' && (
                    <input
                        type="text"
                        placeholder="Prénom"
                        value={firstname}
                        onChange={e => setFirstname(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-full border border-black bg-white text-black placeholder:text-black/45"
                    />
                )}


                <div className="relative">
                    <input
                        type="email"
                        placeholder="email@gmail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-full border border-black bg-white text-black placeholder:text-black/45"
                    />
                </div>

                <div className="relative">
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-full border border-black bg-white text-black placeholder:text-black/45"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="text-lg w-full px-4 py-3 rounded-full border border-black bg-white text-black"
                >
                    {loading
                        ? 'Chargement...'
                        : mode === 'login' ? 'Se connecter' : "S'inscrire"}
                </button>
            </form>

            {/* Toggle login/register */}
            <p className="text-center text-sm text-gray-500 mt-5 mb-5">
                {mode === 'login' ? "Vous n'avez pas de compte ? " : 'Déjà un compte ? '}
                <button
                    type="button"
                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                    className="text-black font-medium underline underline-offset-2 hover:text-red-600 transition"
                >
                    {mode === 'login' ? 'Inscrivez vous' : 'Connectez vous'}
                </button>
            </p>

            {/* Social */}
            <div className="flex justify-center gap-4">
                <button
                    type="button"
                    className="
            w-14 h-14 bg-white
            flex items-center justify-center
            text-black
            hover:border-gray-300 hover:shadow-sm active:scale-95
            transition-all duration-150
          "
                >
                    <svg className="w-10 h-10" viewBox="0 0 20 20">
                        <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.77h5.4a4.6 4.6 0 01-2 3.02v2.5h3.24c1.9-1.75 3-4.33 3-7.3z" fill="#4285F4"/>
                        <path d="M10 20c2.7 0 4.97-.9 6.62-2.43l-3.23-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H1.08v2.58A10 10 0 0010 20z" fill="#34A853"/>
                        <path d="M4.4 11.9A6.1 6.1 0 014.1 10c0-.66.11-1.3.3-1.9V5.52H1.08A10 10 0 000 10c0 1.62.38 3.14 1.08 4.48L4.4 11.9z" fill="#FBBC04"/>
                        <path d="M10 3.96c1.47 0 2.78.5 3.82 1.5L16.7 2.6A10 10 0 0010 0 10 10 0 001.08 5.52L4.4 8.1C5.2 5.74 7.4 3.96 10 3.96z" fill="#EA4335"/>
                    </svg>
                </button>

                <button
                    type="button"
                    className="
            w-14 h-14 bg-white
            flex items-center justify-center
            text-black
            hover:border-gray-300 hover:shadow-sm active:scale-95
            transition-all duration-150
          "
                >
                    <img src="/apple.svg" alt="Apple" className="w-16 h-16" />
                </button>

                <button
                    type="button"
                    className="
            w-14 h-14 bg-white
            flex items-center justify-center
            text-black
            hover:border-gray-300 hover:shadow-sm active:scale-95
            transition-all duration-150
          "
                >
                    <svg className="w-10 h-10" viewBox="0 0 20 20" fill="#1877F2">
                        <path d="M20 10a10 10 0 10-11.56 9.88v-6.99H5.9V10h2.54V7.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V10h2.77l-.44 2.89h-2.33v6.99A10 10 0 0020 10z"/>
                    </svg>
                </button>
            </div>

            {/* Mot de passe oublié */}
            {mode === 'login' && (
                <button type="button" className="w-full text-center text-sm text-black underline underline-offset-2 mt-5 hover:text-gray-600 transition">
                    Mot de passe oublié
                </button>
            )}

            {/* Invité */}
            <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-sm text-black mt-3 hover:text-gray-600 transition"
            >
                Continuer en tant qu&apos;invité
            </button>

        </div>
    )
}
