// components/auth/AuthModal.tsx
'use client'
import { useEffect } from 'react'
import LoginForm from './LoginForm'

interface AuthModalProps {
    isOpen:   boolean
    onClose:  () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else        document.body.style.overflow = ''
        return ()  => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div
    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
    onClick={onClose}
    />

    <div className="
    w-full bg-white z-10
    sm:rounded-2xl
    sm:max-w-sm sm:mx-4
    animate-slide-up sm:animate-fade-scale
    h-full sm:h-auto
    items-center flex justify-center
    ">
    <LoginForm onClose={onClose} />
    </div>
    </div>
)
}