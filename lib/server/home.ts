import { getAuthSession } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { Prisma } from "@/app/generated/prisma/client";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";

const DISTINCTION_ORDER: Record<string, number> = {
  BIB_GOURMAND: 0,
  THREE_STARS: 1,
  TWO_STARS: 2,
  ONE_STAR: 3,
  GREEN_STAR: 4,
  RECOMMENDED: 5,
};

const HOME_RESTAURANT_SELECT = {
  id: true,
  name: true,
  imageUrl: true,
  createdAt: true,
  address: {
    select: {
      city: true,
      street: true,
      country: true,
    },
  },
  distinctions: {
    select: {
      id: true,
      type: true,
      year: true,
    },
  },
  ambiances: {
    select: {
      ambianceRestaurant: {
        select: {
          libelle: true,
        },
      },
    },
  },
  typesCuisine: {
    select: {
      typeCuisine: {
        select: {
          libelle: true,
        },
      },
    },
  },
  images: {
    select: {
      url: true,
      alt: true,
    },
  },
} as const;

type HomeRestaurantSelect = typeof HOME_RESTAURANT_SELECT;
type HomeRestaurantRow = Prisma.RestaurantGetPayload<{ select: HomeRestaurantSelect }>;
type HomeRecommendationResult = {
  title: string;
  description: string;
  restaurants: HomeRestaurantCard[];
};
type HomeGroupedRestaurants = {
  label: string;
  restaurants: HomeRestaurantCard[];
};
type HomeDistinctionGroup = {
  type: string;
  restaurants: HomeRestaurantCard[];
};

export type HomeRestaurantCard = {
  id: number;
  name: string;
  imageUrl: string;
  address: string;
  city: string;
  distinctions: { type: string; year: number }[];
  cuisines: string[];
  ambiances: string[];
  createdAt: Date;
};

export type HomeSection = {
  key: string;
  title: string;
  description: string;
  restaurants: HomeRestaurantCard[];
};

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function toHomeRestaurantCard(
  restaurant: HomeRestaurantRow,
): HomeRestaurantCard {
  return {
    id: restaurant.id,
    name: restaurant.name,
    imageUrl: restaurant.imageUrl ?? restaurant.images[0]?.url ?? FALLBACK_IMAGE,
    address: `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.country}`,
    city: restaurant.address.city,
    distinctions: restaurant.distinctions,
    cuisines: restaurant.typesCuisine.map((item: HomeRestaurantRow["typesCuisine"][number]) => item.typeCuisine.libelle),
    ambiances: restaurant.ambiances.map((item: HomeRestaurantRow["ambiances"][number]) => item.ambianceRestaurant.libelle),
    createdAt: restaurant.createdAt,
  };
}

function sortRestaurantCards(restaurants: HomeRestaurantCard[]): HomeRestaurantCard[] {
  return [...restaurants].sort((left, right) => {
    const leftScore = Math.min(
      ...left.distinctions.map((distinction) => DISTINCTION_ORDER[distinction.type] ?? 99),
      99,
    );
    const rightScore = Math.min(
      ...right.distinctions.map((distinction) => DISTINCTION_ORDER[distinction.type] ?? 99),
      99,
    );

    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });
}

function getTopGroups(
  restaurants: HomeRestaurantCard[],
  extractor: (restaurant: HomeRestaurantCard) => string[],
  limit: number,
  minCount = 2,
): HomeGroupedRestaurants[] {
  const groups = new Map<string, HomeRestaurantCard[]>();

  for (const restaurant of restaurants) {
    for (const label of extractor(restaurant)) {
      const bucket = groups.get(label) ?? [];
      bucket.push(restaurant);
      groups.set(label, bucket);
    }
  }

  return [...groups.entries()]
    .filter(([, groupedRestaurants]) => groupedRestaurants.length >= minCount)
    .sort((left, right) => {
      if (right[1].length !== left[1].length) {
        return right[1].length - left[1].length;
      }

      return left[0].localeCompare(right[0], "fr");
    })
    .slice(0, limit)
    .map(([label, groupedRestaurants]: [string, HomeRestaurantCard[]]) => ({
      label,
      restaurants: sortRestaurantCards(groupedRestaurants),
    }));
}

function getDistinctDistinctionSections(restaurants: HomeRestaurantCard[]): HomeDistinctionGroup[] {
  const grouped = new Map<string, HomeRestaurantCard[]>();

  for (const restaurant of restaurants) {
    for (const distinction of restaurant.distinctions) {
      const bucket = grouped.get(distinction.type) ?? [];
      bucket.push(restaurant);
      grouped.set(distinction.type, bucket);
    }
  }

  return [...grouped.entries()]
    .filter(([, groupedRestaurants]) => groupedRestaurants.length > 0)
    .sort((left, right) => {
      const leftOrder = DISTINCTION_ORDER[left[0]] ?? 99;
      const rightOrder = DISTINCTION_ORDER[right[0]] ?? 99;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return right[1].length - left[1].length;
    })
    .map(([type, groupedRestaurants]: [string, HomeRestaurantCard[]]) => ({
      type,
      restaurants: sortRestaurantCards(groupedRestaurants),
    }));
}

function formatDistinctionLabel(type: string): string {
  switch (type) {
    case "BIB_GOURMAND":
      return "Bib Gourmand";
    case "ONE_STAR":
      return "1 étoile";
    case "TWO_STARS":
      return "2 étoiles";
    case "THREE_STARS":
      return "3 étoiles";
    case "GREEN_STAR":
      return "Étoile verte";
    case "RECOMMENDED":
      return "Recommandé";
    default:
      return type.replaceAll("_", " ");
  }
}

function scoreRecommendations(
  restaurants: HomeRestaurantCard[],
  preferredRestaurants: HomeRestaurantCard[],
): HomeRestaurantCard[] {
  const visitedIds = new Set(preferredRestaurants.map((restaurant) => restaurant.id));
  const preferenceWeights = {
    cuisines: new Map<string, number>(),
    ambiances: new Map<string, number>(),
    distinctions: new Map<string, number>(),
    cities: new Map<string, number>(),
  };

  const totalReservations = preferredRestaurants.length;

  preferredRestaurants.forEach((restaurant, index) => {
    const weight = totalReservations - index;

    for (const cuisine of restaurant.cuisines) {
      preferenceWeights.cuisines.set(cuisine, (preferenceWeights.cuisines.get(cuisine) ?? 0) + weight * 3);
    }

    for (const ambiance of restaurant.ambiances) {
      preferenceWeights.ambiances.set(ambiance, (preferenceWeights.ambiances.get(ambiance) ?? 0) + weight * 2);
    }

    for (const distinction of restaurant.distinctions) {
      preferenceWeights.distinctions.set(
        distinction.type,
        (preferenceWeights.distinctions.get(distinction.type) ?? 0) + weight * 2,
      );
    }

    preferenceWeights.cities.set(restaurant.city, (preferenceWeights.cities.get(restaurant.city) ?? 0) + weight * 1.5);
  });

  return restaurants
    .filter((restaurant) => !visitedIds.has(restaurant.id))
    .map((restaurant: HomeRestaurantCard) => {
      let score = 0;

      for (const cuisine of restaurant.cuisines) {
        score += preferenceWeights.cuisines.get(cuisine) ?? 0;
      }

      for (const ambiance of restaurant.ambiances) {
        score += preferenceWeights.ambiances.get(ambiance) ?? 0;
      }

      for (const distinction of restaurant.distinctions) {
        score += preferenceWeights.distinctions.get(distinction.type) ?? 0;
      }

      score += preferenceWeights.cities.get(restaurant.city) ?? 0;

      return { restaurant, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      const leftBib = left.restaurant.distinctions.some((distinction) => distinction.type === "BIB_GOURMAND") ? 1 : 0;
      const rightBib = right.restaurant.distinctions.some((distinction) => distinction.type === "BIB_GOURMAND") ? 1 : 0;

      if (rightBib !== leftBib) {
        return rightBib - leftBib;
      }

      return right.restaurant.createdAt.getTime() - left.restaurant.createdAt.getTime();
    })
    .map(({ restaurant }) => restaurant)
    .slice(0, 8);
}

function buildSectionTitle(label: string, kind: "distinction" | "cuisine" | "ambiance" | "city"): string {
  switch (kind) {
    case "distinction":
      return formatDistinctionLabel(label);
    case "cuisine":
      return `Cuisine ${label.toLowerCase()}`;
    case "ambiance":
      return `Ambiance ${label.toLowerCase()}`;
    case "city":
      return `À ${label}`;
  }
}

function buildSectionDescription(count: number, kind: "distinction" | "cuisine" | "ambiance" | "city"): string {
  switch (kind) {
    case "distinction":
      return `${count} restaurant${count > 1 ? "s" : ""} sélectionné${count > 1 ? "s" : ""}`;
    case "cuisine":
      return `${count} table${count > 1 ? "s" : ""} dans cette cuisine`;
    case "ambiance":
      return `${count} adresse${count > 1 ? "s" : ""} dans cette ambiance`;
    case "city":
      return `${count} restaurant${count > 1 ? "s" : ""} dans cette ville`;
  }
}

export async function listHomeRestaurants(): Promise<HomeRestaurantCard[]> {
  const restaurants = await prisma.restaurant.findMany({
    select: HOME_RESTAURANT_SELECT,
    orderBy: {
      createdAt: "desc",
    },
  });

  return restaurants.map(toHomeRestaurantCard);
}

export async function getHomeSections(): Promise<{ restaurants: HomeRestaurantCard[]; sections: HomeSection[] }> {
  const restaurants = await listHomeRestaurants();
  const sections: HomeSection[] = [];

  const bibGourmandRestaurants = sortRestaurantCards(
    restaurants.filter((restaurant) => restaurant.distinctions.some((distinction) => distinction.type === "BIB_GOURMAND")),
  );

  if (bibGourmandRestaurants.length > 0) {
    sections.push({
      key: "bib-gourmand",
      title: "Bib Gourmand",
      description: "Les meilleures adresses accessibles en priorité",
      restaurants: bibGourmandRestaurants,
    });
  }

  for (const { type, restaurants: groupedRestaurants } of getDistinctDistinctionSections(restaurants)) {
    if (type === "BIB_GOURMAND") {
      continue;
    }

    sections.push({
      key: `distinction-${type}`,
      title: formatDistinctionLabel(type),
      description: buildSectionDescription(groupedRestaurants.length, "distinction"),
      restaurants: groupedRestaurants,
    });
  }

  for (const group of getTopGroups(restaurants, (restaurant) => restaurant.cuisines, 3, 2)) {
    sections.push({
      key: `cuisine-${normalize(group.label)}`,
      title: buildSectionTitle(group.label, "cuisine"),
      description: buildSectionDescription(group.restaurants.length, "cuisine"),
      restaurants: group.restaurants,
    });
  }

  for (const group of getTopGroups(restaurants, (restaurant) => restaurant.ambiances, 3, 2)) {
    sections.push({
      key: `ambiance-${normalize(group.label)}`,
      title: buildSectionTitle(group.label, "ambiance"),
      description: buildSectionDescription(group.restaurants.length, "ambiance"),
      restaurants: group.restaurants,
    });
  }

  for (const group of getTopGroups(restaurants, (restaurant) => [restaurant.city], 2, 2)) {
    sections.push({
      key: `city-${normalize(group.label)}`,
      title: buildSectionTitle(group.label, "city"),
      description: buildSectionDescription(group.restaurants.length, "city"),
      restaurants: group.restaurants,
    });
  }

  return { restaurants, sections };
}

export async function getHomeRecommendations(restaurants: HomeRestaurantCard[]): Promise<HomeRecommendationResult> {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return {
      title: "À découvrir",
      description: "Une sélection générale pensée pour démarrer",
      restaurants: sortRestaurantCards(restaurants).slice(0, 8),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      reservations: {
        orderBy: {
          bookedAt: "desc",
        },
        take: 8,
        select: {
          restaurant: {
            select: HOME_RESTAURANT_SELECT,
          },
        },
      },
    },
  });

  const preferredRestaurants: HomeRestaurantCard[] = (user?.reservations ?? []).map((reservation) =>
    toHomeRestaurantCard(reservation.restaurant),
  );

  if (preferredRestaurants.length === 0) {
    return {
      title: "Recommandés pour vous",
      description: "Démarre une première réservation pour personnaliser cette ligne",
      restaurants: sortRestaurantCards(restaurants).slice(0, 8),
    };
  }

  const recommendations = scoreRecommendations(restaurants, preferredRestaurants);

  return {
    title: "Recommandés pour vous",
    description: "Inspirés de tes réservations passées",
    restaurants:
      recommendations.length > 0
        ? recommendations
        : sortRestaurantCards(restaurants).slice(0, 8),
  };
}
