import { HttpError, toIntId } from "@/lib/server/http";
import { getHotelById } from "@/lib/server/hotel/service";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type HotelDetailsPageProps = {
    params: { id: string } | Promise<{ id: string }>;
};

const FALLBACK_HERO_IMAGE =
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80";
const FALLBACK_GALLERY_IMAGES = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
];

const formatAddress = (street: string, city: string, postalCode: string, country: string) =>
    `${street}, ${postalCode} ${city}, ${country}`;

const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    }).format(price);

export default async function HotelDetailsPage({ params }: HotelDetailsPageProps) {
    const { id } = await Promise.resolve(params);

    let hotel;

    try {
        hotel = await getHotelById(toIntId(id));
    } catch (cause) {
        if (cause instanceof HttpError && cause.status === 404) {
            notFound();
        }

        throw cause;
    }

    const mediaSources = [hotel.imageUrl, ...hotel.images.map((image) => image.url)].filter(
        (value): value is string => Boolean(value),
    );

    const mediaItems =
        Array.from(new Set(mediaSources)).length > 0
            ? Array.from(new Set(mediaSources))
            : [FALLBACK_HERO_IMAGE, ...FALLBACK_GALLERY_IMAGES];

    return (
        <main className="min-h-screen bg-[#f5f5f5] text-[#141414] font-[var(--font-figtree)]">
            <section className="mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-14">
                <Link
                    href="/hotel"
                    aria-label="Retour"
                    className="mb-5 inline-flex rounded-full border border-black/15 bg-white p-2.5 shadow-sm transition hover:bg-black/5"
                >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>

                <article className="overflow-hidden rounded-[30px] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
                    <header className="relative h-[290px] sm:h-[360px] lg:h-[420px]">
                        <Image
                            src={mediaItems[0]}
                            alt={hotel.images[0]?.alt ?? `Photo de ${hotel.name}`}
                            fill
                            priority
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/5" />
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                            <p className="text-sm uppercase tracking-[0.22em] text-white/80">Hôtel</p>
                            <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{hotel.name}</h1>
                            <p className="mt-2 text-sm text-white/90 sm:text-base">{hotel.address.city}</p>
                        </div>
                    </header>

                    <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8 lg:p-8">
                        <section>
                            <h2 className="text-xl font-semibold">Informations</h2>
                            <p className="mt-2 text-[15px] text-black/75">
                                {formatAddress(
                                    hotel.address.street,
                                    hotel.address.city,
                                    hotel.address.postalCode,
                                    hotel.address.country,
                                )}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <span className="rounded-full border border-black/15 bg-black/5 px-3 py-1 text-sm font-medium">
                                    {hotel.starRating} étoile{hotel.starRating > 1 ? "s" : ""}
                                </span>
                                {hotel.distinctions.slice(0, 3).map((distinction) => (
                                    <span key={distinction.id} className="rounded-full border border-black/15 px-3 py-1 text-sm font-medium">
                                        {distinction.type.replaceAll("_", " ")} {distinction.year}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-7">
                                <h3 className="text-lg font-semibold">Galerie</h3>
                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {mediaItems.slice(1, 7).map((imageUrl, index) => (
                                        <div key={`${imageUrl}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black/5">
                                            <Image
                                                src={imageUrl}
                                                alt={hotel.images[index + 1]?.alt ?? `${hotel.name} photo ${index + 2}`}
                                                fill
                                                sizes="(max-width: 768px) 50vw, 240px"
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <aside className="rounded-3xl border border-black/10 bg-[#fafafa] p-5">
                            <h2 className="text-xl font-semibold">Chambres</h2>
                            {hotel.rooms.length > 0 ? (
                                <ul className="mt-4 space-y-3">
                                    {hotel.rooms.slice(0, 4).map(({ room }) => (
                                        <li key={room.id} className="rounded-2xl border border-black/10 bg-white p-3">
                                            <p className="text-sm font-medium text-black/70">{room.type ?? "Suite"}</p>
                                            <p className="mt-1 text-lg font-semibold">{formatPrice(room.pricePerNight)} / nuit</p>
                                            <p className="mt-1 text-sm text-black/65">
                                                {room.bedCount} lit{room.bedCount > 1 ? "s" : ""}
                                                {room.area ? ` · ${room.area} m²` : ""}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-3 text-sm text-black/70">Aucune chambre affichée pour le moment.</p>
                            )}

                            <Link
                                href="/hotel"
                                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#141414] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-black"
                            >
                                Réserver cet hôtel
                            </Link>
                        </aside>
                    </div>
                </article>
            </section>
        </main>
    );
}
