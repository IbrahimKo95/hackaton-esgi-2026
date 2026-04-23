import HomeGuestAuthTrigger from "@/components/home-guest-auth-trigger";
import NavbarMenu from "@/components/navbar-menu";
import { getAuthSession } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { Figtree } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const figtree = Figtree({ subsets: ["latin"] });

type HomePageProps = {
    searchParams?: { q?: string } | Promise<{ q?: string }>;
};

const HERO_IMAGE =
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80";

const CATEGORY_CARDS = [
    {
        label: "Sortie entre amis",
        image:
            "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
    },
    {
        label: "Date en couple",
        image:
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
    },
    {
        label: "Brunch du dimanche",
        image:
            "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=80",
    },
    {
        label: "Bistronomie",
        image:
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
    },
] as const;

const CHIPS = ["Date", "Cocktails", "Végétarien", "Rooftop", "Dîner", "Brunch"] as const;

export default async function Home({ searchParams }: HomePageProps) {
    const { q } = await Promise.resolve(searchParams ?? {});
    const trimmedQuery = q?.trim() ?? "";

    const [session, restaurants] = await Promise.all([
        getAuthSession(),
        prisma.restaurant.findMany({
            where: trimmedQuery
                ? {
                    OR: [
                        {
                            name: {
                                contains: trimmedQuery,
                                mode: "insensitive",
                            },
                        },
                        {
                            address: {
                                is: {
                                    city: {
                                        contains: trimmedQuery,
                                        mode: "insensitive",
                                    },
                                },
                            },
                        },
                    ],
                }
                : undefined,
            select: {
                id: true,
                name: true,
                address: {
                    select: {
                        city: true,
                    },
                },
            },
            take: 6,
            orderBy: {
                createdAt: "desc",
            },
        }),
    ]);

    const displayName = session?.user?.name?.trim() || "Invité";
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    return (
        <main className={`${figtree.className} min-h-screen bg-[#f3f3f1] text-[#171717]`}>
            <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-b-[34px] rounded-t-[26px] shadow-[0_18px_35px_rgba(0,0,0,0.22)]">
                    <Image
                        src={HERO_IMAGE}
                        alt="Ambiance de table gastronomique"
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 1200px"
                    />
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

                    <div className="relative z-10 px-4 pb-6 pt-4 text-white sm:px-6 sm:pb-7 lg:px-8 lg:pb-8 lg:pt-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <HomeGuestAuthTrigger
                                    isAuthenticated={Boolean(session?.user)}
                                    displayName={displayName}
                                    initials={initials || "IN"}
                                    imageUrl={session?.user?.image}
                                />
                            </div>
                            <NavbarMenu triggerClassName="text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" />
                        </div>

                        <h1 className="mt-8 max-w-xl text-[36px] font-semibold leading-[0.98] tracking-[-0.02em] sm:mt-10 sm:text-[44px] lg:text-[52px]">
                            On mange où aujourd&rsquo;hui ?
                        </h1>

                        <form
                            action="/"
                            className="mt-5 flex h-12 items-center gap-3 rounded-full border border-white/45 bg-white/20 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-md sm:max-w-lg"
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-white/90" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                            </svg>
                            <input
                                name="q"
                                defaultValue={trimmedQuery}
                                placeholder="Rechercher un restaurant ou une ville..."
                                aria-label="Rechercher des restaurants"
                                className="w-full bg-transparent text-[14px] text-white placeholder:text-white/80 focus:outline-none"
                            />
                        </form>

                        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                            {CHIPS.map((chip) => (
                                <form key={chip} action="/" method="get" className="shrink-0">
                                    <input type="hidden" name="q" value={chip} />
                                    <button
                                        type="submit"
                                        className="rounded-full border border-white/45 bg-black/20 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        {chip}
                                    </button>
                                </form>
                            ))}
                        </div>
                    </div>
                </section>

                {trimmedQuery ? (
                    <section className="mt-5 rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:p-5">
                        <p className="text-sm font-semibold">Résultats pour « {trimmedQuery} »</p>
                        <ul className="mt-3 space-y-2">
                            {restaurants.length > 0 ? (
                                restaurants.map((restaurant) => (
                                    <li key={restaurant.id}>
                                        <Link
                                            href={`/restaurant/${restaurant.id}`}
                                            className="inline-flex rounded-md text-sm font-medium text-[#7f1919] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7f1919]"
                                        >
                                            {restaurant.name} — {restaurant.address.city}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-black/65">Aucun restaurant trouvé.</li>
                            )}
                        </ul>
                    </section>
                ) : null}

                <section className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[1.4fr_1fr]">
                    <Link
                        href="/"
                        className="group relative block min-h-[152px] overflow-hidden rounded-[22px] shadow-[0_12px_22px_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7f1919]"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1100&q=80"
                            alt="Carte des restaurants"
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, 40vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/15" />
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                            <p className="text-sm font-semibold">Carte des restaurants</p>
                            <p className="text-xs text-white/85">Explorer par quartier</p>
                        </div>
                    </Link>

                    <Link
                        href="/vertical"
                        className="group relative block min-h-[152px] overflow-hidden rounded-[22px] shadow-[0_12px_22px_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7f1919]"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1100&q=80"
                            alt="Accès au contenu vertical"
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, 30vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/15" />
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                            <p className="text-sm font-semibold">Contenu vertical</p>
                            <p className="text-xs text-white/85">Tendances du moment</p>
                        </div>
                    </Link>
                </section>

                <section className="mt-7">
                    <h2 className="text-[24px] font-semibold leading-none tracking-[-0.02em]">Pour vous</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {CATEGORY_CARDS.map((card) => (
                            <article key={card.label} className="group overflow-hidden rounded-[18px] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
                                <div className="relative h-36 overflow-hidden">
                                    <Image
                                        src={card.image}
                                        alt={card.label}
                                        fill
                                        className="object-cover transition duration-500 group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                </div>
                                <p className="px-3 py-3 text-sm font-semibold">{card.label}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
