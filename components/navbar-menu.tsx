"use client";

import AuthModal from "@/app/components/auth/AuthModal";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type MenuItem = {
  label: string;
  href?: string;
};

type NavbarMenuProps = {
  items?: MenuItem[];
  language?: string;
  currency?: string;
  triggerClassName?: string;
};

const defaultItems: MenuItem[] = [
  { label: "Restaurants", href: "/restaurant" },
  { label: "Hotels", href: "/hotel" },
  { label: "Bon plan MICHELIN", href: "/restaurant/good-deal" },
  { label: "Mon programme de fidelite", href: "/fidelite" },
  { label: "Nous contacter", href: "#" },
  { label: "Preferences", href: "#" },
];

export default function NavbarMenu({
  items = defaultItems,
  language = "FR",
  currency = "EUR",
  triggerClassName = "",
}: NavbarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { data: session } = useSession();

  const openAuthModal = () => {
    setIsOpen(false);
    setAuthOpen(true);
  };

  const closeAuthModal = () => {
    setAuthOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        aria-label="Ouvrir le menu"
        className={`rounded-full p-2 transition hover:bg-white/15 ${triggerClassName}`.trim()}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16" strokeLinecap="round" />
          <path d="M4 12h16" strokeLinecap="round" />
          <path d="M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 text-[#141414] backdrop-blur-[2px] sm:justify-end">
          <button
            aria-label="Fermer le menu"
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <div className="relative h-[75vh] w-full overflow-auto rounded-b-[28px] bg-white px-7 pb-8 pt-6 sm:h-full sm:w-[420px] sm:min-w-[280px] sm:rounded-none">
            <div className="mb-10 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center" onClick={() => setIsOpen(false)} aria-label="Retour à l'accueil">
                <Image src="/star.svg" alt="Logo" width={40} height={40} className="h-10 w-auto" />
              </Link>
                <button
                  aria-label="Fermer le menu"
                  className="rounded-full p-2 transition hover:bg-black/5"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M18 6L6 18" strokeLinecap="round" />
                    <path d="M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
            </div>

            {session?.user ? (
              <div className="mb-8 rounded-[22px] bg-black/5 px-4 py-3">
                <p className="text-[12px] uppercase tracking-[0.14em] text-black/50">Connecté</p>
                <p className="mt-1 text-[18px] font-semibold leading-tight text-black">{session.user.name ?? "Utilisateur"}</p>
                {session.user.email ? <p className="mt-0.5 text-[14px] text-black/65">{session.user.email}</p> : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="mb-8 inline-flex items-center justify-center rounded-full border border-[#c1282d] px-5 py-3 text-[15px] font-semibold text-[#c1282d] transition hover:bg-[#c1282d] hover:text-white"
              >
                Se connecter
              </button>
            )}

            <nav className="flex flex-col gap-4 text-2xl font-semibold tracking-[-0.02em] sm:text-4xl sm:gap-5">
              {items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href ?? "#"}
                  className="transition hover:text-[#c1282d]"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <p className="mt-10 text-[18px] text-black/70 sm:mt-16 sm:text-[30px]">
              {language} | {currency}
            </p>
          </div>
        </div>
      ) : null}

      <AuthModal isOpen={authOpen} onClose={closeAuthModal} />
    </>
  );
}
