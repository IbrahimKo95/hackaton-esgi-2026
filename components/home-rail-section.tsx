import Image from "next/image";
import Link from "next/link";

import MichelinDistinctionBadge from "@/components/michelin-distinction-badge";
import type { HomeRestaurantCard } from "@/lib/server/home";

type HomeRailSectionProps = {
  title: string;
  description: string;
  restaurants: HomeRestaurantCard[];
};

export default function HomeRailSection({ title, description, restaurants }: HomeRailSectionProps) {
  if (restaurants.length === 0) {
    return null;
  }

  return (
    <section className="mt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold leading-none tracking-[-0.02em]">{title}</h2>
          <p className="mt-1 text-sm text-black/65">{description}</p>
        </div>
      </div>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3">
          {restaurants.map((restaurant) => {
            const highlightedDistinctions = restaurant.distinctions.slice(0, 2);

            return (
              <Link
                key={restaurant.id}
                href={`/restaurant/${restaurant.id}`}
                className="group w-[280px] shrink-0 overflow-hidden rounded-[24px] bg-white p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
              >
                <div className="relative h-[168px] overflow-hidden rounded-[20px]">
                  <Image
                    src={restaurant.imageUrl}
                    alt={`Photo de ${restaurant.name}`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  {highlightedDistinctions.length > 0 ? (
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                      {highlightedDistinctions.map((distinction) => (
                        <MichelinDistinctionBadge key={`${distinction.type}-${distinction.year}`} distinction={distinction} compact />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="px-1 pb-1 pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[18px] font-semibold leading-tight">{restaurant.name}</h3>
                      <p className="mt-1 text-[13px] text-black/70">{restaurant.address}</p>
                    </div>
                    <span className="rounded-full bg-[#f7eded] px-2.5 py-1 text-[11px] font-semibold text-[#7f1919]">
                      {restaurant.city}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {restaurant.cuisines.slice(0, 2).map((cuisine) => (
                      <span key={cuisine} className="rounded-full bg-[#f4f4f4] px-3 py-1 text-[12px] font-medium">
                        {cuisine}
                      </span>
                    ))}
                    {restaurant.ambiances.slice(0, 1).map((ambiance) => (
                      <span key={ambiance} className="rounded-full bg-[#fff1f1] px-3 py-1 text-[12px] font-medium text-[#7f1919]">
                        {ambiance}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
