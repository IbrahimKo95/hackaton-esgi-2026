import { interpretRestaurantSearchQuery, type RestaurantSearchCriteria } from "@/lib/server/agent";
import { listRestaurants } from "@/lib/server/restaurants/service";
import { getRestaurantBudgetEstimate } from "@/lib/server/restaurants/budget";

function normalize(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function getRestaurantSearchText(restaurant: Awaited<ReturnType<typeof listRestaurants>>[number]) {
    return normalize(
        [
            restaurant.name,
            restaurant.address.city,
            restaurant.address.street,
            restaurant.address.country,
            restaurant.menu ?? "",
            restaurant.schedule ?? "",
            ...(restaurant.ambiances?.map((item) => item.ambianceRestaurant.libelle) ?? []),
            ...(restaurant.typesCuisine?.map((item) => item.typeCuisine.libelle) ?? []),
            ...restaurant.distinctions.map((item) => item.type),
        ].join(" "),
    );
}

function matchesCriteria(restaurant: Awaited<ReturnType<typeof listRestaurants>>[number], criteria: RestaurantSearchCriteria) {
    const text = getRestaurantSearchText(restaurant);

    if (criteria.city && !normalize(restaurant.address.city).includes(normalize(criteria.city))) {
        return false;
    }

    if (criteria.budgetMax != null && getRestaurantBudgetEstimate(restaurant.priceRange).average > criteria.budgetMax) {
        return false;
    }

    if (criteria.cuisines.length > 0) {
        const cuisines = restaurant.typesCuisine.map((item) => normalize(item.typeCuisine.libelle));
        if (!criteria.cuisines.some((cuisine) => cuisines.some((item) => item.includes(normalize(cuisine))))) {
            return false;
        }
    }

    if (criteria.ambiances.length > 0) {
        const ambiances = restaurant.ambiances.map((item) => normalize(item.ambianceRestaurant.libelle));
        if (!criteria.ambiances.some((ambiance) => ambiances.some((item) => item.includes(normalize(ambiance))))) {
            return false;
        }
    }

    if (criteria.keywords.length > 0) {
        if (!criteria.keywords.some((keyword) => text.includes(normalize(keyword)))) {
            return false;
        }
    }

    return true;
}

export async function searchRestaurants(query: string | undefined, mode: "normal" | "ai") {
    const restaurants = await listRestaurants();
    const search = query?.trim();

    if (!search) {
        return restaurants;
    }

    if (mode === "normal") {
        const normalizedSearch = normalize(search);

        return restaurants.filter((restaurant) => {
            const fields = getRestaurantSearchText(restaurant);
            return fields.includes(normalizedSearch);
        });
    }

    const criteria = await interpretRestaurantSearchQuery(search);

    const normalizedCriteria: RestaurantSearchCriteria = {
        city: criteria?.city ?? null,
        budgetMax: criteria?.budgetMax ?? null,
        cuisines: criteria?.cuisines ?? [],
        ambiances: criteria?.ambiances ?? [],
        keywords: criteria?.keywords ?? [],
    };

    if (!criteria) {
        return restaurants.filter((restaurant) => getRestaurantSearchText(restaurant).includes(normalize(search)));
    }

    return restaurants.filter((restaurant) => matchesCriteria(restaurant, normalizedCriteria));
}
