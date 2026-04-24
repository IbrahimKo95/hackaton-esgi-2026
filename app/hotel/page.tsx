import NavbarMenu from "@/components/navbar-menu";
import HotelCard from "@/components/hotel-card";
import { listHotels } from "@/lib/server/hotel/service";
import Image from "next/image";
import Link from "next/link";

type HotelPageProps = {
    searchParams?: { q?: string } | Promise<{ q?: string }>;
};

const FALLBACK_HERO_IMAGE =
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80";
const FALLBACK_CARD_IMAGE =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80";

export default async function HotelPage({ searchParams }: HotelPageProps) {
    const { q } = await Promise.resolve(searchParams ?? {});
    const hotels = await listHotels(q);

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#f4f4f4] to-white text-[#141414] font-[var(--font-figtree)]">
            <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white">
                <header className="relative h-[235px] overflow-hidden">
                    <Image
                        src={FALLBACK_HERO_IMAGE}
                        alt="Façade d'hôtel"
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
                        <NavbarMenu triggerClassName="text-white" />
                    </div>

                    <div className="absolute left-0 top-[70px] w-full px-5 text-white">
                        <h1 className="mb-3 text-[38px] font-semibold leading-none">Hôtels</h1>
                        <form
                            action="/hotel"
                            className="flex h-[45px] items-center gap-2 rounded-full border border-white/45 bg-black/20 px-4 backdrop-blur-sm"
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                            </svg>
                            <input
                                name="q"
                                defaultValue={q ?? ""}
                                placeholder="Rechercher un hôtel, une ville..."
                                className="w-full bg-transparent text-[14px] text-white placeholder:text-white/85 focus:outline-none"
                                aria-label="Rechercher un hôtel"
                            />
                        </form>
                    </div>
                </header>

                <div className="flex-1 bg-[#f5f5f5] px-5 pb-8 pt-7 lg:px-7">
                    {hotels.length > 0 ? (
                        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0 xl:grid-cols-3">
                            {hotels.map((hotel) => {
                                const image = hotel.imageUrl ?? hotel.images?.[0]?.url ?? FALLBACK_CARD_IMAGE;
                                const roomCount = hotel._count.rooms;
                                const address = `${hotel.address.street}, ${hotel.address.city}, ${hotel.address.country}`;

                                return (
                                    <HotelCard
                                        key={hotel.id}
                                        id={hotel.id}
                                        name={hotel.name}
                                        imageUrl={image}
                                        address={address}
                                        roomCount={roomCount}
                                        starRating={hotel.starRating}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-[24px] bg-white p-6 text-center shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
                            <p className="text-[18px] font-semibold">Aucun hôtel trouvé</p>
                            <p className="mt-1 text-[14px] text-black/70">Essaie un autre nom ou une autre ville.</p>
                        </div>
                    )}

                </div>
            </section>
        </main>
    );
}
