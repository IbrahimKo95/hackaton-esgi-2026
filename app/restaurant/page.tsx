import NavbarMenu from "@/components/navbar-menu";
import RestaurantCard from "@/components/restaurant-card";
import RestaurantSearchBar from "@/components/restaurant-search-bar";
import { getAuthSession } from "@/lib/server/auth";
import { searchRestaurants } from "@/lib/server/restaurants/search";
import { Figtree } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const figtree = Figtree({ subsets: ["latin"] });

type RestaurantPageProps = {
    searchParams?: { q?: string } | Promise<{ q?: string }>;
};

const FALLBACK_HERO_IMAGE =
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80";
const FALLBACK_CARD_IMAGE =
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";

export default async function RestaurantPage({ searchParams }: RestaurantPageProps) {
    const { q } = await Promise.resolve(searchParams ?? {});
    const session = await getAuthSession();
    const filteredRestaurants = await searchRestaurants(q, "normal");

    return (
        <main className={`${figtree.className} min-h-screen bg-gradient-to-b from-[#f4f4f4] to-white text-[#141414]`}>
            <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white">
                <header className="relative h-[235px] overflow-hidden">
                    <Image
                        src={FALLBACK_HERO_IMAGE}
                        alt="Façade de restaurant"
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

                    <div className="absolute left-0 top-5 flex w-full items-center justify-between px-5 text-white">
                        <Link href="/" aria-label="Retour" className="rounded-full p-2 transition hover:bg-white/15">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <NavbarMenu triggerClassName="text-white" user={session?.user ?? null} />
                    </div>

                    <div className="absolute left-0 top-[70px] w-full px-5 text-white">
                        <h1 className="mb-3 text-[38px] font-semibold leading-none">Restaurants</h1>
                        <RestaurantSearchBar
                            key={q ?? ""}
                            initialQuery={q ?? ""}
                        />
                    </div>
                </header>

                <div className="flex-1 bg-[#f5f5f5] px-5 pb-8 pt-7 lg:px-7">
                    {filteredRestaurants.length > 0 ? (
                        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0 xl:grid-cols-3">
                            {filteredRestaurants.map((restaurant) => {
                                const image = restaurant.imageUrl ?? restaurant.images?.[0]?.url ?? FALLBACK_CARD_IMAGE;
                                const address = `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.country}`;
                                const ambiances = restaurant.ambiances.map((item) => item.ambianceRestaurant.libelle);
                                const cuisines = restaurant.typesCuisine.map((item) => item.typeCuisine.libelle);
                                const distinctions = restaurant.distinctions;

                                return (
                                    <RestaurantCard
                                        key={restaurant.id}
                                        id={restaurant.id}
                                        name={restaurant.name}
                                        imageUrl={image}
                                        address={address}
                                        ambiances={ambiances}
                                        cuisines={cuisines}
                                        distinctions={distinctions}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-[24px] bg-white p-6 text-center shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
                            <p className="text-[18px] font-semibold">Aucun restaurant trouvé</p>
                            <p className="mt-1 text-[14px] text-black/70">Essaie un autre nom ou une autre ville.</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
