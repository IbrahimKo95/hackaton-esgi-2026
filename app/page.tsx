"use client"
import {useState} from "react";
import AuthModal from "@/app/components/auth/AuthModal";

export default function Home() {
    const [authOpen, setAuthOpen] = useState(false)
    return (
        <>
            <nav>
                <button onClick={() => setAuthOpen(true)}>
                    Se connecter
                </button>
            </nav>

            <AuthModal
                isOpen={authOpen}
                onClose={() => setAuthOpen(false)}
            />
        </>
    )
}
