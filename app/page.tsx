import HomeGuestAuthTrigger from "@/components/home-guest-auth-trigger";
import HomeRailSection from "@/components/home-rail-section";
import NavbarMenu from "@/components/navbar-menu";
import { getHomeRecommendations, getHomeSections } from "@/lib/server/home";
import { Figtree } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const figtree = Figtree({ subsets: ["latin"] });

type HomePageProps = {
    searchParams?: { q?: string } | Promise<{ q?: string }>;
};

const HERO_IMAGE =
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80";

export default async function Home({ searchParams }: HomePageProps) {
    const { q } = await Promise.resolve(searchParams ?? {});
    const trimmedQuery = q?.trim() ?? "";

    const { restaurants, sections } = await getHomeSections();
    const recommendations = await getHomeRecommendations(restaurants);

    const filteredRestaurants = trimmedQuery
        ? restaurants.filter((restaurant) => {
              const query = trimmedQuery.toLowerCase();

              return (
                  restaurant.name.toLowerCase().includes(query) ||
                  restaurant.city.toLowerCase().includes(query) ||
                  restaurant.address.toLowerCase().includes(query)
              );
          })
        : [];

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
                                    fallbackName="Invité"
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
                    </div>
                </section>

                {trimmedQuery ? (
                    <section className="mt-5 rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:p-5">
                        <p className="text-sm font-semibold">Résultats pour « {trimmedQuery} »</p>
                        <ul className="mt-3 space-y-2">
                            {filteredRestaurants.length > 0 ? (
                                filteredRestaurants.map((restaurant) => (
                                    <li key={restaurant.id}>
                                        <Link
                                            href={`/restaurant/${restaurant.id}`}
                                            className="inline-flex rounded-md text-sm font-medium text-[#7f1919] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7f1919]"
                                        >
                                            {restaurant.name} — {restaurant.city}
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

                <HomeRailSection
                    title={recommendations.title}
                    description={recommendations.description}
                    restaurants={recommendations.restaurants}
                />

                {sections.map((section) => (
                    <HomeRailSection
                        key={section.key}
                        title={section.title}
                        description={section.description}
                        restaurants={section.restaurants}
                    />
                ))}
            </div>
        </main>
    );
}
