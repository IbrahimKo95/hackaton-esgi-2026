"use client";

import Link from "next/link";
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
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

const defaultItems: MenuItem[] = [
  { label: "Restaurants", href: "/restaurant" },
  { label: "Hotels", href: "/hotel" },
  { label: "Bon plan MICHELIN", href: "#" },
  { label: "Mon programme de fidelite", href: "#" },
  { label: "Nous contacter", href: "#" },
  { label: "Preferences", href: "#" },
];

export default function NavbarMenu({
  items = defaultItems,
  language = "FR",
  currency = "EUR",
  triggerClassName = "",
  user = null,
}: NavbarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

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
              <img src="/star.svg" alt="Logo" className="h-10 w-auto"/>
              {/*<span className="text-[30px] text-[#c1282d]">✽</span>*/}
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

            {user ? (
              <div className="mb-8 rounded-[22px] bg-black/5 px-4 py-3">
                <p className="text-[12px] uppercase tracking-[0.14em] text-black/50">Connecté</p>
                <p className="mt-1 text-[18px] font-semibold leading-tight text-black">{user.name ?? "Utilisateur"}</p>
                {user.email ? <p className="mt-0.5 text-[14px] text-black/65">{user.email}</p> : null}
              </div>
            ) : null}

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

            <p className="mt-16 text-[30px] text-black/70">
              {language} | {currency}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
