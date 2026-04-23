import NavbarMenu from "@/components/navbar-menu";
import { HttpError, toIntId } from "@/lib/server/http";
import { getHotelById } from "@/lib/server/hotel/service";
import { Figtree } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const figtree = Figtree({ subsets: ["latin"] });

type HotelDetailsPageProps = {
    params: { id: string } | Promise<{ id: string }>;
};

const FALLBACK_HERO_IMAGE =
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80";
const FALLBACK_GALLERY_IMAGES = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
];

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

    const galleryImages = hotel.images.slice(0, 2).map((image) => image.url);
    const [firstGalleryImage = FALLBACK_GALLERY_IMAGES[0], secondGalleryImage = FALLBACK_GALLERY_IMAGES[1]] = galleryImages;

    const headerImage = hotel.imageUrl ?? galleryImages[0] ?? FALLBACK_HERO_IMAGE;
    const roomCount = hotel.rooms.length;
    const addressLine = `${hotel.address.street}, ${hotel.address.city}, ${hotel.address.country}`;
    const description = `${hotel.name} vous accueille a ${hotel.address.city} avec un service ${hotel.starRating} etoiles et ${roomCount} chambre${roomCount > 1 ? "s" : ""}.`;

    return (
        <main className={`${figtree.className} min-h-screen bg-gradient-to-b from-[#efefef] to-white text-[#141414]`}>
            <section className="flex min-h-screen w-full flex-col overflow-hidden bg-white">
                <header className="relative h-[235px] overflow-hidden">
                    <Image
                        src={headerImage}
                        alt={hotel.images[0]?.alt ?? `Facade de ${hotel.name}`}
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

                    <div className="absolute left-0 top-5 flex w-full items-center justify-between px-5 text-white">
                        <Link href="/hotel" aria-label="Retour" className="rounded-full p-2 transition hover:bg-white/15">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <NavbarMenu triggerClassName="text-white" />
                    </div>

                    <div className="absolute left-0 top-[70px] w-full px-5 text-white">
                        <h1 className="mb-3 text-[38px] font-semibold leading-none">Hotels</h1>
                        <form action="/hotel" className="flex h-[45px] items-center gap-2 rounded-full border border-white/45 bg-black/20 px-4 backdrop-blur-sm">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                            </svg>
                            <input
                                name="q"
                                placeholder="Rechercher un hotel, une ville ..."
                                className="w-full bg-transparent text-[14px] text-white placeholder:text-white/90 focus:outline-none"
                                aria-label="Rechercher un hotel"
                            />
                        </form>
                    </div>
                </header>

                <div className="flex-1 bg-[#f5f5f5] px-5 pb-8 pt-7">
                    <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="relative h-[173px] w-full overflow-hidden rounded-[25px]">
                            <Image
                                src={firstGalleryImage}
                                alt={hotel.images[0]?.alt ?? `${hotel.name} photo 1`}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="relative h-[173px] w-full overflow-hidden rounded-[25px]">
                            <Image
                                src={secondGalleryImage}
                                alt={hotel.images[1]?.alt ?? `${hotel.name} photo 2`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-[24px] font-semibold leading-tight">{hotel.name}</h2>
                            <p className="mt-1 text-[15px]">{addressLine}</p>
                            <p className="text-[12px]">{roomCount} chambre{roomCount > 1 ? "s" : ""}</p>
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

                    <p className="text-[14px] leading-[1.28] text-black/80">
                        {description}
                    </p>

                    <div className="mt-12 flex justify-center pb-6">
                        <button
                            className="rounded-full border border-black/60 bg-white px-7 py-2 text-[22px] font-medium leading-none transition hover:bg-black hover:text-white"
                            type="button"
                        >
                            Reserver
                        </button>
                    </div>

                </div>
            </section>
        </main>
    );
}
