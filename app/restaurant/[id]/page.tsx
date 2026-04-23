import NavbarMenu from "@/components/navbar-menu";
import MichelinDistinctionBadge from "@/components/michelin-distinction-badge";
import { HttpError, toIntId } from "@/lib/server/http";
import { getRestaurantById } from "@/lib/server/restaurants/service";
import { listFullyBookedDatesForRestaurant } from "@/lib/server/reservations/service";
import RestaurantReservationPanel from "@/app/components/restaurant/restaurant-reservation-panel";
import { Figtree } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const figtree = Figtree({ subsets: ["latin"] });

type RestaurantDetailsPageProps = {
    params: { id: string } | Promise<{ id: string }>;
};

const FALLBACK_HERO_IMAGE =
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80";
const FALLBACK_GALLERY_IMAGES = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=900&q=80",
];

export default async function RestaurantDetailsPage({ params }: RestaurantDetailsPageProps) {
    const { id } = await Promise.resolve(params);

    let restaurant: Awaited<ReturnType<typeof getRestaurantById>>;

    try {
        restaurant = await getRestaurantById(toIntId(id));
    } catch (cause) {
        if (cause instanceof HttpError && cause.status === 404) {
            notFound();
        }

        throw cause;
    }

    const galleryImages = restaurant.images.slice(0, 2).map((image) => image.url);
    const [firstGalleryImage = FALLBACK_GALLERY_IMAGES[0], secondGalleryImage = FALLBACK_GALLERY_IMAGES[1]] = galleryImages;
    const headerImage = restaurant.imageUrl ?? galleryImages[0] ?? FALLBACK_HERO_IMAGE;
    const addressLine = `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.country}`;
    const ambiances = restaurant.ambiances.map((item) => item.ambianceRestaurant.libelle);
    const cuisines = restaurant.typesCuisine.map((item) => item.typeCuisine.libelle);
    const distinctions = restaurant.distinctions;
    const fullyBookedDates = await listFullyBookedDatesForRestaurant(restaurant.id);

    return (
        <main className={`${figtree.className} min-h-screen bg-gradient-to-b from-[#efefef] to-white text-[#141414]`}>
            <section className="flex min-h-screen w-full flex-col overflow-hidden bg-white">
                <header className="relative h-[235px] overflow-hidden">
                    <Image
                        src={headerImage}
                        alt={restaurant.images[0]?.alt ?? `Facade de ${restaurant.name}`}
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

                    <div className="absolute left-0 top-5 flex w-full items-center justify-between px-5 text-white">
                        <Link href="/restaurant" aria-label="Retour" className="rounded-full p-2 transition hover:bg-white/15">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <NavbarMenu triggerClassName="text-white" />
                    </div>

                    <div className="absolute left-0 top-[70px] w-full px-5 text-white">
                        <h1 className="mb-3 text-[38px] font-semibold leading-none">Restaurants</h1>
                        <form action="/restaurant" className="flex h-[45px] items-center gap-2 rounded-full border border-white/45 bg-black/20 px-4 backdrop-blur-sm">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                            </svg>
                            <input
                                name="q"
                                placeholder="Rechercher un restaurant, une ville ..."
                                className="w-full bg-transparent text-[14px] text-white placeholder:text-white/90 focus:outline-none"
                                aria-label="Rechercher un restaurant"
                            />
                        </form>
                    </div>
                </header>

                <div className="flex-1 bg-[#f5f5f5] px-5 pb-8 pt-7">
                    <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="relative h-[173px] w-full overflow-hidden rounded-[25px]">
                            <Image
                                src={firstGalleryImage}
                                alt={restaurant.images[0]?.alt ?? `${restaurant.name} photo 1`}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="relative h-[173px] w-full overflow-hidden rounded-[25px]">
                            <Image
                                src={secondGalleryImage}
                                alt={restaurant.images[1]?.alt ?? `${restaurant.name} photo 2`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-[24px] font-semibold leading-tight">{restaurant.name}</h2>
                            <p className="mt-1 text-[15px]">{addressLine}</p>
                            <p className="text-[12px]">{restaurant.address.city}</p>
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f4f4f4] px-3 py-1 text-[12px] font-medium">
                                <Image src="/guide_icon.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Guide Michelin</span>
                            </div>
                        </div>
                        <button
                            aria-label="Ajouter aux favoris"
                            className="mt-1 rounded-full p-2 text-[#c1282d] transition hover:bg-white"
                            type="button"
                        >
                            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path
                                    d="M12 20s-7-4.6-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.4-7 10-7 10z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {ambiances.map((item) => (
                            <span key={item} className="rounded-full bg-white px-3 py-1 text-[12px] font-medium shadow-[0_6px_14px_rgba(0,0,0,0.06)]">
                                {item}
                            </span>
                        ))}
                        {cuisines.map((item) => (
                            <span key={item} className="rounded-full bg-white px-3 py-1 text-[12px] font-medium shadow-[0_6px_14px_rgba(0,0,0,0.06)]">
                                {item}
                            </span>
                        ))}
                        {distinctions.map((item) => (
                            <MichelinDistinctionBadge key={`${item.type}-${item.year}`} distinction={item} />
                        ))}
                    </div>

                    <p className="mt-6 text-[14px] leading-[1.28] text-black/80">
                        {restaurant.name} vous accueille a {restaurant.address.city} avec {ambiances.length > 0 ? `une ambiance ${ambiances.join(", ")}` : "une expérience soignée"} et {cuisines.length > 0 ? `une cuisine ${cuisines.join(", ")}` : "une carte inspirée"}.
                    </p>

                    <RestaurantReservationPanel
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                        seatingCap={restaurant.seatingCap}
                        fullyBookedDates={fullyBookedDates}
                    />
                </div>
            </section>
        </main>
    );
}
