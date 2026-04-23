"use client";

import AuthModal from "@/app/components/auth/AuthModal";
import Image from "next/image";
import { useState } from "react";

type HomeGuestAuthTriggerProps = {
  isAuthenticated: boolean;
  displayName: string;
  initials: string;
  imageUrl?: string | null;
};

export default function HomeGuestAuthTrigger({
  isAuthenticated,
  displayName,
  initials,
  imageUrl,
}: HomeGuestAuthTriggerProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`Avatar de ${displayName}`}
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
        {isAuthenticated ? (
          <p className="text-sm font-semibold tracking-wide">{displayName}</p>
        ) : (
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="rounded-sm text-sm font-semibold tracking-wide underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {displayName}
          </button>
        )}
      </div>

      {!isAuthenticated ? (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      ) : null}
    </>
  );
}
