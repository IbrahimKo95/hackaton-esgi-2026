import RestaurantMap from "@/components/restaurant-map";
import { listRestaurants } from "@/lib/server/restaurants/service";

export default async function MapPage() {
    const restaurants = await listRestaurants();

    const mapRestaurants = restaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        imageUrl: restaurant.imageUrl ?? restaurant.images[0]?.url ?? null,
        address: {
            street: restaurant.address.street,
            city: restaurant.address.city,
            country: restaurant.address.country,
            latitude: restaurant.address.latitude,
            longitude: restaurant.address.longitude,
        },
    }));

    return (
        <main className="min-h-screen bg-[#f3f3f1] text-[#171717] font-[var(--font-figtree)]">
            <RestaurantMap restaurants={mapRestaurants} />
        </main>
    );
}
