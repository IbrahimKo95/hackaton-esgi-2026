"use client";

import AuthModal from "@/app/components/auth/AuthModal";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";

type HomeGuestAuthTriggerProps = {
  fallbackName?: string;
};

export default function HomeGuestAuthTrigger({ fallbackName = "Invité" }: HomeGuestAuthTriggerProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, status } = useSession();

  const displayName =
    status === "authenticated"
      ? session?.user?.name?.trim() || "Utilisateur"
      : status === "unauthenticated"
        ? fallbackName
        : "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const imageUrl = session?.user?.image;

  return (
    <>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`Avatar de ${displayName || "l'utilisateur"}`}
          width={42}
          height={42}
          className="h-10 w-10 rounded-full border border-white/70 object-cover shadow-sm"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/65 bg-white/20 text-xs font-semibold"
        >
          {initials}
        </div>
      )}

      <div>
        <p className="text-xs text-white/80">Connecté en tant que</p>
        {status === "authenticated" ? (
          <p className="text-sm font-semibold tracking-wide">{displayName}</p>
        ) : status === "unauthenticated" ? (
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="rounded-sm text-sm font-semibold tracking-wide underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {displayName}
          </button>
        ) : (
          <span className="inline-block h-5 w-20 rounded bg-white/15" aria-hidden="true" />
        )}
      </div>

      {status === "unauthenticated" ? (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      ) : null}
    </>
  );
}
