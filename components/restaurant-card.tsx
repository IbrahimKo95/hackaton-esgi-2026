import Image from "next/image";
import Link from "next/link";
import MichelinDistinctionBadge from "@/components/michelin-distinction-badge";

type RestaurantCardProps = {
    id: number;
    name: string;
    imageUrl: string;
    address: string;
    ambiances: string[];
    cuisines: string[];
    distinctions: { type: string; year: number }[];
};

export default function RestaurantCard({
    id,
    name,
    imageUrl,
    address,
    ambiances,
    cuisines,
    distinctions,
}: RestaurantCardProps) {
    const highlightedDistinctions = distinctions.slice(0, 2);

    return (
        <Link
            href={`/restaurant/${id}`}
            className="block rounded-[24px] bg-white p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
        >
            <div className="relative mb-3 h-[168px] w-full overflow-hidden rounded-[20px]">
                <Image src={imageUrl} alt={`Photo de ${name}`} fill className="object-cover" />
            </div>

            <div className="w-full">
                <div className="flex w-full items-start gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex w-full items-start justify-between gap-3">
                            <h2 className="min-w-0 flex-1 text-[24px] font-semibold leading-tight">{name}</h2>
                            {highlightedDistinctions.length > 0 ? (
                                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                                    {highlightedDistinctions.map((distinction) => (
                                        <MichelinDistinctionBadge
                                            key={`${distinction.type}-${distinction.year}`}
                                            distinction={distinction}
                                            compact
                                        />
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <p className="mt-1 w-full text-[14px] text-black/80">{address}</p>
                        {cuisines.length > 0 ? (
                            <div className="mt-5 flex w-full flex-wrap gap-2">
                                {cuisines.slice(0, 3).map((cuisine) => (
                                    <span key={cuisine} className="rounded-full bg-[#f4f4f4] px-3 py-1 text-[12px] font-medium">
                                        {cuisine}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    );
}
