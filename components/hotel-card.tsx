import Image from "next/image";
import Link from "next/link";

type HotelCardProps = {
    id: number;
    name: string;
    imageUrl: string;
    address: string;
    roomCount: number;
    starRating: number;
};

export default function HotelCard({ id, name, imageUrl, address, roomCount, starRating }: HotelCardProps) {
    return (
        <Link
            href={`/hotel/${id}`}
            className="block rounded-[24px] bg-white p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
        >
            <div className="relative mb-3 h-[168px] w-full overflow-hidden rounded-[20px]">
                <Image src={imageUrl} alt={`Photo de ${name}`} fill className="object-cover" />
            </div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-[24px] font-semibold leading-tight">{name}</h2>
                    <p className="mt-1 text-[14px] text-black/80">{address}</p>
                    <p className="text-[12px] text-black/70">
                        {roomCount} chambre{roomCount > 1 ? "s" : ""}
                    </p>
                </div>
                <span className="rounded-full bg-[#f4f4f4] px-3 py-1 text-[12px] font-medium">{starRating} étoiles</span>
            </div>
        </Link>
    );
}
