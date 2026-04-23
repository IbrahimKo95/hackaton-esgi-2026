"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type RestaurantSearchBarProps = {
    initialQuery?: string;
};

export default function RestaurantSearchBar({
    initialQuery = "",
}: RestaurantSearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(initialQuery);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const params = new URLSearchParams(searchParams.toString());

        if (query.trim()) {
            params.set("q", query.trim());
        } else {
            params.delete("q");
        }

        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

        router.replace(nextUrl, { scroll: false });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex h-[45px] items-center gap-2 rounded-full border border-white/45 bg-black/20 px-4 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                    name="q"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher un restaurant, une ville..."
                    className="min-w-0 w-full bg-transparent text-[14px] text-white placeholder:text-white/85 focus:outline-none"
                    aria-label="Rechercher un restaurant"
                />
            </div>
        </form>
    );
}
