import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { getPrismaClientClass } from "../app/generated/prisma/internal/class";
import type { Prisma } from "../app/generated/prisma/client";
import { DistinctionType } from "../app/generated/prisma/enums";

const PrismaClient = getPrismaClientClass();

const roles = [
  { name: "admin", type: 1 },
  { name: "inspector", type: 2 },
  { name: "user", type: 3 },
] as const;

const ambiancesRestaurantSeed = [
  { code: "SORTIE_ENTRE_AMIS", libelle: "Sortie entre amis" },
  { code: "DATE_EN_COUPLE", libelle: "Date en couple" },
  { code: "FAMILLE", libelle: "Famille" },
  { code: "AFFAIRES", libelle: "Affaires" },
  { code: "GASTRONOMIQUE", libelle: "Gastronomique" },
  { code: "DECONTRACTE", libelle: "Décontractée" },
  { code: "FESTIF", libelle: "Festif" },
  { code: "ROMANTIQUE", libelle: "Romantique" },
] as const;

const ambiancesHotelSeed = [
  { code: "ROMANTIQUE", libelle: "Romantique" },
  { code: "FAMILLE", libelle: "Famille" },
  { code: "BIEN_ETRE", libelle: "Bien-être" },
  { code: "AFFAIRES", libelle: "Affaires" },
  { code: "LUXE", libelle: "Luxe" },
  { code: "DECONTRACTE", libelle: "Décontractée" },
  { code: "CITY_BREAK", libelle: "City break" },
  { code: "ESCAPADE", libelle: "Escapade" },
] as const;

const typesCuisineSeed = [
  { code: "FRANCAISE", libelle: "Française" },
  { code: "JAPONAISE", libelle: "Japonaise" },
  { code: "ITALIENNE", libelle: "Italienne" },
  { code: "MEDITERRANEENNE", libelle: "Méditerranéenne" },
  { code: "ASIATIQUE", libelle: "Asiatique" },
  { code: "THAI", libelle: "Thaï" },
  { code: "CHINOISE", libelle: "Chinoise" },
  { code: "INDIENNE", libelle: "Indienne" },
  { code: "MEXICAINE", libelle: "Mexicaine" },
  { code: "AMERICAINE", libelle: "Américaine" },
  { code: "VEGETARIENNE", libelle: "Végétarienne" },
  { code: "VEGAN", libelle: "Végan" },
  { code: "FUSION", libelle: "Fusion" },
  { code: "INTERNATIONALE", libelle: "Internationale" },
  { code: "PERUVIENNE", libelle: "Péruvienne" },
] as const;

const restaurantDistinctionPriority: Record<string, number> = {
  THREE_STARS: 4,
  TWO_STARS: 3,
  ONE_STAR: 2,
  BIB_GOURMAND: 1,
  GREEN_STAR: 1,
  RECOMMENDED: 0,
};

type ReferenceCode = string;

type AddressSeed = {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
};

type ImageSeed = {
  url: string;
  alt: string;
};

type VerticalMediaSeed = {
  url: string;
  description?: string;
  thumbnailUrl?: string;
  title?: string;
};

const verticalClipLibrary: readonly Readonly<{ url: string; description: string }>[] = [
  {
    url: "https://archive.org/download/whctvct-West_Hartford_Lens_-_GastroPark_Food_Trucks_October_2023/West_Hartford_Lens_-_GastroPark_Food_Trucks_October_2023.mp4",
    description: "Cuisine minute et préparation en food truck (2023)",
  },
  {
    url: "https://archive.org/download/comfl-Miami_Eats_-_Discover_Sushi_Chef_Japanese_Restaurant/Miami_Eats_-_Discover_Sushi_Chef_Japanese_Restaurant.mp4",
    description: "Chef au comptoir sushi et dressage en service (2024)",
  },
  {
    url: "https://archive.org/download/comfl-Miami_Eats_featuring_Mykonos_Restaurant/Miami_Eats_featuring_Mykonos_Restaurant.mp4",
    description: "Ambiance de salle et présentation de plats en restaurant (2025)",
  },
  {
    url: "https://archive.org/download/Authentic_Ramen_Restaurant_opens_in_Westford_-_WestfordCAT_News/Authentic_Ramen_Restaurant_opens_in_Westford_-_WestfordCAT_News.mp4",
    description: "Ouverture de restaurant ramen et service en salle (2025)",
  },
  {
    url: "https://archive.org/download/cotga-Sounds_of_Tucker_Restaurant_Week_2026/Sounds_of_Tucker_Restaurant_Week_2026.mp4",
    description: "Restaurant week, affluence en salle et service (2026)",
  },
  {
    url: "https://archive.org/download/whctvct-Burger_Lovers_Unite_at_Tonight_s_Epic_Blue_Back_Burger_Bash/Burger_Lovers_Unite_at_Tonight_s_Epic_Blue_Back_Burger_Bash.mp4",
    description: "Cuisine burger, sortie de passe et service client (2025)",
  },
  {
    url: "https://archive.org/download/whctvct-Nepal_Relief_Event_at_Bombay_Olive_-_Dine_and_Help_Nepal/Nepal_Relief_Event_at_Bombay_Olive_-_Dine_and_Help_Nepal.mp4",
    description: "Service en salle lors d'un événement restaurant (2025)",
  },
  {
    url: "https://archive.org/download/whctvct-Grinch_Cocktail_-_Two_Guys_and_a_Lotta_Wine_15th_Annual_Bubbles_Show/Grinch_Cocktail_-_Two_Guys_and_a_Lotta_Wine_15th_Annual_Bubbles_Show.mp4",
    description: "Service boisson, accords et gestuelle de bar (2025)",
  },
] as const;

function buildRestaurantVerticalMedias(restaurantName: string, restaurantIndex: number): VerticalMediaSeed[] {
  const clipsPerRestaurant = restaurantIndex % 3 === 0 ? 3 : 2;
  const startIndex = (restaurantIndex * 2) % verticalClipLibrary.length;

  return Array.from({ length: clipsPerRestaurant }, (_, offset) => {
    const clip = verticalClipLibrary[(startIndex + offset) % verticalClipLibrary.length];

    return {
      url: clip.url,
      description: `${clip.description} · ${restaurantName}`,
    };
  });
}

type RestaurantSeed = {
  name: string;
  link: string;
  menu: string;
  priceRange: number;
  schedule: string;
  seatingCap: number;
  address: AddressSeed;
  cuisines: readonly ReferenceCode[];
  ambiances: readonly ReferenceCode[];
  distinctions: readonly { type: keyof typeof DistinctionType; year: number }[];
  images: readonly ImageSeed[];
  verticalMedias?: readonly VerticalMediaSeed[];
  imageUrl?: string;
};

type RoomSeed = {
  type: string;
  bedCount: number;
  area?: number;
  hasBalcony?: boolean;
  pricePerNight: number;
  images: readonly ImageSeed[];
};

type HotelSeed = {
  name: string;
  starRating: number;
  address: AddressSeed;
  ambiances: readonly ReferenceCode[];
  distinctions: readonly { type: keyof typeof DistinctionType; year: number }[];
  images: readonly ImageSeed[];
  rooms: readonly RoomSeed[];
  imageUrl?: string;
};

const restaurants: readonly RestaurantSeed[] = [
  {
    name: "L'Arpège",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/l-arpege",
    menu: "Menu dégustation végétal, cuisine de saison, accords signature.",
    priceRange: 5,
    schedule: "Lun-Ven 12:00-14:00, 19:00-22:00",
    seatingCap: 48,
    address: { street: "84 Rue de Varenne", city: "Paris", country: "France", postalCode: "75007", latitude: 48.8567, longitude: 2.3179 },
    cuisines: ["FRANCAISE", "VEGETARIENNE", "FUSION"],
    ambiances: ["GASTRONOMIQUE", "ROMANTIQUE", "AFFAIRES"],
    distinctions: [{ type: "THREE_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80", alt: "Salle élégante de L'Arpège" },
      { url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1400&q=80", alt: "Assiette végétale signature" },
      { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80", alt: "Table dressée pour un service gastronomique" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-cooking-vegetables-in-a-pan-5396/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80", title: "Le végétal selon Passard" },
      { url: "https://cdn.coverr.co/videos/coverr-chef-plating-food-3289/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=400&q=80", title: "Dressage signature" },
    ],
  },
  {
    name: "Le Meurice Alain Ducasse",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/le-meurice-alain-ducasse",
    menu: "Cuisine française contemporaine et grand menu dégustation.",
    priceRange: 5,
    schedule: "Mar-Sam 12:15-14:00, 19:30-22:00",
    seatingCap: 54,
    address: { street: "228 Rue de Rivoli", city: "Paris", country: "France", postalCode: "75001", latitude: 48.8656, longitude: 2.3299 },
    cuisines: ["FRANCAISE", "INTERNATIONALE"],
    ambiances: ["GASTRONOMIQUE", "DATE_EN_COUPLE", "AFFAIRES"],
    distinctions: [{ type: "THREE_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80", alt: "Salle du Meurice" },
      { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80", alt: "Dressage gastronomique" },
      { url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1400&q=80", alt: "Mise en scène de table" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-elegant-restaurant-interior-1234/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80", title: "La salle dorée du Meurice" },
      { url: "https://cdn.coverr.co/videos/coverr-fine-dining-plating-5678/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", title: "L'art du dressage Ducasse" },
    ],
  },
  {
    name: "Plénitude - Cheval Blanc Paris",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/plenitude-cheval-blanc-paris",
    menu: "Menu signature autour des sauces, jus et produits d'exception.",
    priceRange: 5,
    schedule: "Mer-Sam 19:00-22:00",
    seatingCap: 32,
    address: { street: "8 Quai du Louvre", city: "Paris", country: "France", postalCode: "75001", latitude: 48.8608, longitude: 2.3393 },
    cuisines: ["FRANCAISE", "FUSION"],
    ambiances: ["GASTRONOMIQUE", "ROMANTIQUE", "AFFAIRES"],
    distinctions: [{ type: "THREE_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1400&q=80", alt: "Vue d'ensemble de la salle" },
      { url: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1400&q=80", alt: "Plat gastronomique au dressage précis" },
      { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80", alt: "Ambiance lounge du restaurant" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-pouring-sauce-fine-dining-9012/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=400&q=80", title: "L'art de la sauce" },
      { url: "https://cdn.coverr.co/videos/coverr-luxury-restaurant-evening-3456/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=400&q=80", title: "Une soirée au Cheval Blanc" },
    ],
  },
  {
    name: "Restaurant Guy Savoy",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/restaurant-guy-savoy",
    menu: "Cuisine française de haute précision, grands classiques revisités.",
    priceRange: 5,
    schedule: "Lun-Ven 12:00-13:30, 19:30-21:30",
    seatingCap: 40,
    address: { street: "11 Quai de Conti", city: "Paris", country: "France", postalCode: "75006", latitude: 48.8567, longitude: 2.3392 },
    cuisines: ["FRANCAISE"],
    ambiances: ["GASTRONOMIQUE", "ROMANTIQUE", "AFFAIRES"],
    distinctions: [{ type: "THREE_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1529543544282-db52b2f1d1f2?auto=format&fit=crop&w=1400&q=80", alt: "Salle lumineuse de Guy Savoy" },
      { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80", alt: "Assiette de saison" },
      { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80", alt: "Table de dîner gastronomique" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-chef-cooking-classic-french-7890/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1529543544282-db52b2f1d1f2?auto=format&fit=crop&w=400&q=80", title: "Les classiques revisités" },
      { url: "https://cdn.coverr.co/videos/coverr-paris-seine-river-dining-2345/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", title: "Dîner face à la Seine" },
    ],
  },
  {
    name: "Le Clarence",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/le-clarence",
    menu: "Menu dégustation signature, cuisine française moderne et précise.",
    priceRange: 5,
    schedule: "Mar-Sam 12:30-14:00, 19:30-21:30",
    seatingCap: 44,
    address: { street: "31 Avenue Franklin Delano Roosevelt", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8698, longitude: 2.3129 },
    cuisines: ["FRANCAISE", "INTERNATIONALE"],
    ambiances: ["GASTRONOMIQUE", "AFFAIRES", "DATE_EN_COUPLE"],
    distinctions: [{ type: "TWO_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=80", alt: "Intérieur raffiné du Clarence" },
      { url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80", alt: "Assiette contemporaine" },
      { url: "https://images.unsplash.com/photo-1505923242677-551b62d4f4e9?auto=format&fit=crop&w=1400&q=80", alt: "Service de table élégant" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-luxury-wine-service-6789/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=400&q=80", title: "Le service du vin" },
      { url: "https://cdn.coverr.co/videos/coverr-fine-dining-table-setup-1122/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80", title: "La mise en place" },
    ],
  },
  {
    name: "Epicure",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/epicure",
    menu: "Menu saisonnier, grande cuisine française et beaux produits.",
    priceRange: 5,
    schedule: "Mar-Sam 12:15-14:00, 19:30-22:00",
    seatingCap: 50,
    address: { street: "112 Rue du Faubourg Saint-Honoré", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8718, longitude: 2.3151 },
    cuisines: ["FRANCAISE", "MEDITERRANEENNE"],
    ambiances: ["GASTRONOMIQUE", "AFFAIRES", "DATE_EN_COUPLE"],
    distinctions: [{ type: "THREE_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1400&q=80", alt: "Salle d'Epicure" },
      { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80", alt: "Plat signature d'Epicure" },
      { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80", alt: "Salon de réception" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-garden-restaurant-terrace-3344/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=400&q=80", title: "Le jardin d'Epicure" },
      { url: "https://cdn.coverr.co/videos/coverr-seasonal-produce-kitchen-5566/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", title: "Les beaux produits de saison" },
    ],
  },
  {
    name: "Kei",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/kei",
    menu: "Cuisine franco-japonaise, dégustation minimaliste et précise.",
    priceRange: 5,
    schedule: "Mar-Sam 12:00-13:30, 19:30-21:30",
    seatingCap: 28,
    address: { street: "5 Rue Coq-Héron", city: "Paris", country: "France", postalCode: "75001", latitude: 48.8661, longitude: 2.3441 },
    cuisines: ["JAPONAISE", "FRANCAISE", "FUSION"],
    ambiances: ["GASTRONOMIQUE", "ROMANTIQUE", "DECONTRACTE"],
    distinctions: [{ type: "THREE_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=1400&q=80", alt: "Salle de Kei" },
      { url: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1400&q=80", alt: "Assiette franco-japonaise" },
      { url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80", alt: "Dressage contemporain" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-japanese-french-fusion-plating-7788/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=400&q=80", title: "La fusion franco-japonaise" },
      { url: "https://cdn.coverr.co/videos/coverr-minimalist-food-presentation-9900/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=400&q=80", title: "Le minimalisme dans l'assiette" },
    ],
  },
  {
    name: "Septime",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/septime",
    menu: "Cuisine de marché, naturelle, centrée sur les légumes et les poissons.",
    priceRange: 4,
    schedule: "Lun-Ven 12:15-14:00, 19:30-22:00",
    seatingCap: 38,
    address: { street: "80 Rue de Charonne", city: "Paris", country: "France", postalCode: "75011", latitude: 48.8539, longitude: 2.3777 },
    cuisines: ["FRANCAISE", "VEGETARIENNE", "FUSION"],
    ambiances: ["DECONTRACTE", "SORTIE_ENTRE_AMIS", "GASTRONOMIQUE"],
    distinctions: [{ type: "ONE_STAR", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80", alt: "Salle de Septime" },
      { url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80", alt: "Assiette végétale" },
      { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80", alt: "Ambiance bistrot moderne" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-market-fresh-vegetables-1212/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&q=80", title: "Du marché à l'assiette" },
      { url: "https://cdn.coverr.co/videos/coverr-natural-wine-pouring-3434/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80", title: "Les vins naturels de Septime" },
    ],
  },
  {
    name: "Qui Plume la Lune",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/qui-plume-la-lune",
    menu: "Cuisine japonaise contemporaine et menus dégustation graphiques.",
    priceRange: 4,
    schedule: "Mar-Sam 19:00-22:00",
    seatingCap: 30,
    address: { street: "50 Rue Amelot", city: "Paris", country: "France", postalCode: "75011", latitude: 48.8571, longitude: 2.3699 },
    cuisines: ["JAPONAISE", "FUSION", "INTERNATIONALE"],
    ambiances: ["ROMANTIQUE", "DECONTRACTE", "GASTRONOMIQUE"],
    distinctions: [{ type: "ONE_STAR", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80", alt: "Assiette japonaise contemporaine" },
      { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80", alt: "Table élégante" },
      { url: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1400&q=80", alt: "Salle intimiste" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-japanese-art-plating-5656/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", title: "L'assiette comme tableau" },
      { url: "https://cdn.coverr.co/videos/coverr-intimate-restaurant-candles-7878/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=400&q=80", title: "Une nuit intimiste" },
    ],
  },
  {
    name: "Sushi B",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/sushi-b",
    menu: "Omakase, poissons ultra-frais, précision japonaise.",
    priceRange: 4,
    schedule: "Mar-Sam 12:00-14:00, 19:30-21:30",
    seatingCap: 24,
    address: { street: "5 Rue Rameau", city: "Paris", country: "France", postalCode: "75002", latitude: 48.8668, longitude: 2.3388 },
    cuisines: ["JAPONAISE"],
    ambiances: ["DECONTRACTE", "DATE_EN_COUPLE", "GASTRONOMIQUE"],
    distinctions: [{ type: "ONE_STAR", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1400&q=80", alt: "Comptoir omakase" },
      { url: "https://images.unsplash.com/photo-1519624014191-508652cbdc94?auto=format&fit=crop&w=1400&q=80", alt: "Sushi raffiné" },
      { url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1400&q=80", alt: "Préparation japonaise" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-sushi-chef-omakase-9090/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80", title: "L'omakase en live" },
      { url: "https://cdn.coverr.co/videos/coverr-fresh-fish-slicing-japanese-1234/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1519624014191-508652cbdc94?auto=format&fit=crop&w=400&q=80", title: "La découpe du poisson" },
    ],
  },
  {
    name: "Shang Palace",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/shang-palace",
    menu: "Cuisine cantonaise premium, dim sum et canard laqué.",
    priceRange: 4,
    schedule: "Mer-Dim 12:00-14:30, 19:00-22:00",
    seatingCap: 70,
    address: { street: "10 Avenue d'Iéna", city: "Paris", country: "France", postalCode: "75116", latitude: 48.8647, longitude: 2.2946 },
    cuisines: ["CHINOISE", "ASIATIQUE", "INTERNATIONALE"],
    ambiances: ["AFFAIRES", "FAMILLE", "DECONTRACTE"],
    distinctions: [{ type: "ONE_STAR", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1400&q=80", alt: "Salle asiatique élégante" },
      { url: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1400&q=80", alt: "Dim sum" },
      { url: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1400&q=80", alt: "Service haut de gamme" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-dim-sum-bamboo-steamer-5678/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=400&q=80", title: "Les dim sum en direct" },
      { url: "https://cdn.coverr.co/videos/coverr-peking-duck-carving-9012/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=400&q=80", title: "Le canard laqué" },
    ],
  },
  {
    name: "Sola",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/sola",
    menu: "Cuisine franco-japonaise intimiste autour de produits nobles.",
    priceRange: 4,
    schedule: "Mar-Sam 19:00-22:00",
    seatingCap: 26,
    address: { street: "12 Rue de l'Hôtel Colbert", city: "Paris", country: "France", postalCode: "75005", latitude: 48.8508, longitude: 2.3487 },
    cuisines: ["JAPONAISE", "FRANCAISE", "FUSION"],
    ambiances: ["ROMANTIQUE", "DECONTRACTE", "GASTRONOMIQUE"],
    distinctions: [{ type: "ONE_STAR", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1400&q=80", alt: "Salle intime de Sola" },
      { url: "https://images.unsplash.com/photo-1554098781-0289065f0c0a?auto=format&fit=crop&w=1400&q=80", alt: "Cuisine fusion" },
      { url: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1400&q=80", alt: "Assiette raffinée" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-underground-cave-restaurant-3456/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=400&q=80", title: "La cave voûtée de Sola" },
      { url: "https://cdn.coverr.co/videos/coverr-franco-japanese-plating-7890/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1554098781-0289065f0c0a?auto=format&fit=crop&w=400&q=80", title: "Fusion en gestes" },
    ],
  },
  {
    name: "Le Sergent Recruteur",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/le-sergent-recruteur",
    menu: "Cuisine de chef, produits français et touches marines.",
    priceRange: 4,
    schedule: "Mer-Dim 12:00-14:00, 19:30-22:00",
    seatingCap: 36,
    address: { street: "41 Rue Saint-Louis en l'Île", city: "Paris", country: "France", postalCode: "75004", latitude: 48.8512, longitude: 2.3553 },
    cuisines: ["FRANCAISE", "MEDITERRANEENNE"],
    ambiances: ["ROMANTIQUE", "GASTRONOMIQUE", "DATE_EN_COUPLE"],
    distinctions: [{ type: "ONE_STAR", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80", alt: "Salle de pierre et bois" },
      { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80", alt: "Assiette de poisson" },
      { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80", alt: "Atmosphère chaleureuse" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-ile-saint-louis-paris-2345/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80", title: "L'île Saint-Louis vue du restaurant" },
      { url: "https://cdn.coverr.co/videos/coverr-seafood-plating-chef-6789/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", title: "Les produits de la mer" },
    ],
  },
  {
    name: "Alliance",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/alliance",
    menu: "Cuisine précise, menu dégustation et accords mets-vins.",
    priceRange: 4,
    schedule: "Mar-Sam 12:00-14:00, 19:30-21:30",
    seatingCap: 28,
    address: { street: "5 Rue de Poissy", city: "Paris", country: "France", postalCode: "75005", latitude: 48.8489, longitude: 2.3481 },
    cuisines: ["FRANCAISE", "FUSION", "INTERNATIONALE"],
    ambiances: ["GASTRONOMIQUE", "AFFAIRES", "ROMANTIQUE"],
    distinctions: [{ type: "TWO_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=80", alt: "Salle claire d'Alliance" },
      { url: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1400&q=80", alt: "Assiette signature" },
      { url: "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1400&q=80", alt: "Menu dégustation" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-sommelier-wine-pairing-1122/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=400&q=80", title: "L'accord parfait mets-vins" },
      { url: "https://cdn.coverr.co/videos/coverr-tasting-menu-reveal-3344/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=400&q=80", title: "Le menu dégustation" },
    ],
  },
  {
    name: "Granite",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/granite",
    menu: "Cuisine française moderne, assiettes minérales et généreuses.",
    priceRange: 4,
    schedule: "Mar-Sam 19:00-22:00",
    seatingCap: 34,
    address: { street: "6 Rue Bailleul", city: "Paris", country: "France", postalCode: "75001", latitude: 48.8605, longitude: 2.342 },
    cuisines: ["FRANCAISE", "FUSION"],
    ambiances: ["DECONTRACTE", "GASTRONOMIQUE", "SORTIE_ENTRE_AMIS"],
    distinctions: [{ type: "ONE_STAR", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80", alt: "Assiette moderne" },
      { url: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1400&q=80", alt: "Ambiance contemporaine" },
      { url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80", alt: "Dîner gastronomique" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-stone-mineral-textures-food-5566/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", title: "L'esprit minéral de Granite" },
      { url: "https://cdn.coverr.co/videos/coverr-open-kitchen-restaurant-7788/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&q=80", title: "La cuisine ouverte" },
    ],
  },
  {
    name: "Virtus",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/virtus",
    menu: "Menu dégustation saisonnier, cuisson précise et dressage élégant.",
    priceRange: 4,
    schedule: "Mer-Sam 19:00-22:00",
    seatingCap: 26,
    address: { street: "29 Rue de Cotte", city: "Paris", country: "France", postalCode: "75012", latitude: 48.847, longitude: 2.3764 },
    cuisines: ["FRANCAISE", "INTERNATIONALE"],
    ambiances: ["ROMANTIQUE", "GASTRONOMIQUE", "DECONTRACTE"],
    distinctions: [{ type: "ONE_STAR", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80", alt: "Cuisine contemporaine" },
      { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80", alt: "Salle intimiste" },
      { url: "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1400&q=80", alt: "Menu dégustation" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-precise-cooking-techniques-9900/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80", title: "La précision en cuisine" },
      { url: "https://cdn.coverr.co/videos/coverr-aligre-market-paris-morning-2121/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80", title: "Au marché d'Aligre" },
    ],
  },
  {
    name: "Le Chateaubriand",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/le-chateaubriand",
    menu: "Cuisine créative, naturelle et très saisonnière.",
    priceRange: 4,
    schedule: "Mar-Sam 19:00-22:30",
    seatingCap: 42,
    address: { street: "129 Avenue Parmentier", city: "Paris", country: "France", postalCode: "75011", latitude: 48.8659, longitude: 2.3722 },
    cuisines: ["FRANCAISE", "VEGETARIENNE", "FUSION"],
    ambiances: ["DECONTRACTE", "FESTIF", "SORTIE_ENTRE_AMIS"],
    distinctions: [{ type: "ONE_STAR", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80", alt: "Salle du Chateaubriand" },
      { url: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1400&q=80", alt: "Cuisine créative" },
      { url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80", alt: "Ambiance conviviale" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-lively-bistro-paris-evening-4343/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80", title: "L'énergie du Chateaubriand" },
      { url: "https://cdn.coverr.co/videos/coverr-creative-natural-cooking-6565/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=400&q=80", title: "La cuisine instinctive d'Inaki" },
    ],
  },
  {
    name: "Benoit",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/benoit",
    menu: "Bistrot gastronomique, grande tradition française.",
    priceRange: 3,
    schedule: "Lun-Dim 12:00-14:30, 19:00-22:30",
    seatingCap: 64,
    address: { street: "20 Rue Saint-Martin", city: "Paris", country: "France", postalCode: "75004", latitude: 48.8572, longitude: 2.3533 },
    cuisines: ["FRANCAISE"],
    ambiances: ["FAMILLE", "DECONTRACTE", "SORTIE_ENTRE_AMIS"],
    distinctions: [{ type: "BIB_GOURMAND", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80", alt: "Bistrot gastronomique" },
      { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80", alt: "Salle conviviale" },
      { url: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1400&q=80", alt: "Cuisine traditionnelle" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-classic-french-bistro-ambiance-8787/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&q=80", title: "L'âme du bistrot parisien" },
      { url: "https://cdn.coverr.co/videos/coverr-boeuf-bourguignon-cooking-1010/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=400&q=80", title: "Les grands classiques mijotés" },
    ],
  },
  {
    name: "L'Abysse",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/l-abysse",
    menu: "Sushi et omakase de très haut niveau, service ultra précis.",
    priceRange: 5,
    schedule: "Mar-Sam 19:00-22:00",
    seatingCap: 18,
    address: { street: "12 Avenue de la Bourdonnais", city: "Paris", country: "France", postalCode: "75007", latitude: 48.8598, longitude: 2.2966 },
    cuisines: ["JAPONAISE"],
    ambiances: ["GASTRONOMIQUE", "DATE_EN_COUPLE", "ROMANTIQUE"],
    distinctions: [{ type: "TWO_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1400&q=80", alt: "Comptoir sushi" },
      { url: "https://images.unsplash.com/photo-1516870873732-2d24d1aa5f17?auto=format&fit=crop&w=1400&q=80", alt: "Sushi de haute précision" },
      { url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1400&q=80", alt: "Préparation omakase" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-sushi-counter-precision-2323/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80", title: "Le comptoir de L'Abysse" },
      { url: "https://cdn.coverr.co/videos/coverr-nigiri-tuna-preparation-4545/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1516870873732-2d24d1aa5f17?auto=format&fit=crop&w=400&q=80", title: "La précision du geste" },
    ],
  },
  {
    name: "David Toutain",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/david-toutain",
    menu: "Cuisine d'auteur, végétal et produits marins.",
    priceRange: 5,
    schedule: "Mar-Sam 12:00-13:30, 19:30-21:30",
    seatingCap: 34,
    address: { street: "29 Rue Surcouf", city: "Paris", country: "France", postalCode: "75007", latitude: 48.8612, longitude: 2.3066 },
    cuisines: ["FRANCAISE", "VEGETARIENNE", "FUSION"],
    ambiances: ["GASTRONOMIQUE", "AFFAIRES", "DECONTRACTE"],
    distinctions: [{ type: "TWO_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1400&q=80", alt: "Assiette créative" },
      { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80", alt: "Salle contemporaine" },
      { url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80", alt: "Dressage pointu" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-vegetable-garden-chef-harvest-6767/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=400&q=80", title: "Le végétal sublimé" },
      { url: "https://cdn.coverr.co/videos/coverr-ocean-seafood-chef-inspiration-8989/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80", title: "L'océan dans l'assiette" },
    ],
  },
  {
    name: "Le Cinq",
    link: "https://guide.michelin.com/fr/fr/paris-region/paris/restaurant/le-cinq",
    menu: "Grande cuisine française, service de palace et produits nobles.",
    priceRange: 5,
    schedule: "Lun-Sam 12:15-14:00, 19:30-22:00",
    seatingCap: 68,
    address: { street: "31 Avenue George V", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8687, longitude: 2.3008 },
    cuisines: ["FRANCAISE", "INTERNATIONALE"],
    ambiances: ["AFFAIRES", "GASTRONOMIQUE", "DECONTRACTE"],
    distinctions: [{ type: "THREE_STARS", year: 2024 }],
    images: [
      { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80", alt: "Salle de palace" },
      { url: "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1400&q=80", alt: "Assiette de palace" },
      { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80", alt: "Salon raffiné" },
    ],
    verticalMedias: [
      { url: "https://cdn.coverr.co/videos/coverr-palace-hotel-grand-dining-room-1313/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80", title: "La majesté du Cinq" },
      { url: "https://cdn.coverr.co/videos/coverr-luxury-tableside-service-3535/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=400&q=80", title: "Le service de palace" },
    ],
  },
] as const;

const hotels: readonly HotelSeed[] = [
  { name: "Cheval Blanc Paris", starRating: 5, address: { street: "8 Quai du Louvre", city: "Paris", country: "France", postalCode: "75001", latitude: 48.8608, longitude: 2.3393 }, ambiances: ["AFFAIRES", "ROMANTIQUE", "CITY_BREAK"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80", alt: "Suite avec vue sur Paris" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre luxe contemporaine" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Spa hôtelier" }], rooms: [{ type: "Suite Seine", bedCount: 1, area: 62, hasBalcony: true, pricePerNight: 2400, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Seine" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre élégante" }] }, { type: "Junior Suite Louvre", bedCount: 1, area: 48, pricePerNight: 1900, images: [{ url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Junior suite Louvre" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon de suite" }] }], },
  { name: "Le Meurice", starRating: 5, address: { street: "228 Rue de Rivoli", city: "Paris", country: "France", postalCode: "75001", latitude: 48.8656, longitude: 2.3299 }, ambiances: ["ESCAPADE", "AFFAIRES", "CITY_BREAK"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Suite Le Meurice" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre haussmannienne" }, { url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Salon de luxe" }], rooms: [{ type: "Suite Royale", bedCount: 1, area: 70, hasBalcony: true, pricePerNight: 2600, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite royale" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon privé" }] }, { type: "Chambre Prestige", bedCount: 1, area: 42, pricePerNight: 1550, images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre prestige" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Lit king size" }] }], },
  { name: "Hôtel de Crillon", starRating: 5, address: { street: "10 Place de la Concorde", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8679, longitude: 2.3211 }, ambiances: ["ESCAPADE", "ROMANTIQUE", "AFFAIRES"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Suite du Crillon" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre élégante" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon hôtelier" }], rooms: [{ type: "Suite Concorde", bedCount: 1, area: 66, hasBalcony: true, pricePerNight: 2500, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Concorde" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Détails suite" }] }, { type: "Chambre Grand Siècle", bedCount: 1, area: 40, pricePerNight: 1450, images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre grand siècle" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon de chambre" }] }], },
  { name: "Four Seasons Hotel George V", starRating: 5, address: { street: "31 Avenue George V", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8687, longitude: 2.3008 }, ambiances: ["CITY_BREAK", "AFFAIRES", "BIEN_ETRE"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre George V" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Suite de palace" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Spa et détente" }], rooms: [{ type: "Suite Eiffel", bedCount: 1, area: 74, hasBalcony: true, pricePerNight: 2900, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Eiffel" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Salon de suite" }] }, { type: "Chambre Deluxe", bedCount: 1, area: 45, pricePerNight: 1650, images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre deluxe" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Détails chambre" }] }], },
  { name: "La Réserve Paris", starRating: 5, address: { street: "42 Avenue Gabriel", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8705, longitude: 2.3165 }, ambiances: ["AFFAIRES", "ROMANTIQUE", "ESCAPADE"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite lumineuse" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre élégante" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Espace bien-être" }], rooms: [{ type: "Suite Gabriel", bedCount: 1, area: 68, hasBalcony: true, pricePerNight: 2350, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Gabriel" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon privé" }] }, { type: "Chambre Signature", bedCount: 1, area: 38, pricePerNight: 1390, images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre signature" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Lit signature" }] }], },
  { name: "Le Bristol Paris", starRating: 5, address: { street: "112 Rue du Faubourg Saint-Honoré", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8718, longitude: 2.3151 }, ambiances: ["CITY_BREAK", "FAMILLE", "BIEN_ETRE"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre classique" }, { url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Le Bristol" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Piscine intérieure" }], rooms: [{ type: "Suite Jardin", bedCount: 1, area: 60, hasBalcony: true, pricePerNight: 2200, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Jardin" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon de suite" }] }, { type: "Chambre Deluxe Courtyard", bedCount: 1, area: 36, pricePerNight: 1300, images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre deluxe" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Courtyard room" }] }], },
  { name: "Shangri-La Paris", starRating: 5, address: { street: "10 Avenue d'Iéna", city: "Paris", country: "France", postalCode: "75116", latitude: 48.8647, longitude: 2.2946 }, ambiances: ["AFFAIRES", "ROMANTIQUE", "CITY_BREAK"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite avec vue" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre vue ville" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Piscine" }], rooms: [{ type: "Suite Eiffel View", bedCount: 1, area: 72, hasBalcony: true, pricePerNight: 2800, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Eiffel View" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon" }] }, { type: "Chambre Premier", bedCount: 1, area: 41, pricePerNight: 1500, images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre premier" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Lit king size" }] }], },
  { name: "Molitor Paris", starRating: 5, address: { street: "13 Rue Nungesser et Coli", city: "Paris", country: "France", postalCode: "75016", latitude: 48.8451, longitude: 2.2513 }, ambiances: ["BIEN_ETRE", "DECONTRACTE", "CITY_BREAK"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre Molitor" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Piscine iconique" }, { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite design" }], rooms: [{ type: "Suite Pool View", bedCount: 1, area: 58, hasBalcony: true, pricePerNight: 980, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Pool View" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Vue sur piscine" }] }, { type: "Chambre Signature", bedCount: 1, area: 32, pricePerNight: 650, images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre signature" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Lit confortable" }] }], },
  { name: "Le Royal Monceau", starRating: 5, address: { street: "37 Avenue Hoche", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8774, longitude: 2.3026 }, ambiances: ["ESCAPADE", "CITY_BREAK", "AFFAIRES"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite design" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre spacieuse" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Spa luxueux" }], rooms: [{ type: "Suite Artistique", bedCount: 1, area: 64, hasBalcony: true, pricePerNight: 2100, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite artistique" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon artistique" }] }, { type: "Chambre Executive", bedCount: 1, area: 39, pricePerNight: 1200, images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre executive" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Lit hôtelier" }] }], },
  { name: "Hôtel Plaza Athénée", starRating: 5, address: { street: "25 Avenue Montaigne", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8668, longitude: 2.3072 }, ambiances: ["ESCAPADE", "ROMANTIQUE", "AFFAIRES"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre Plaza Athénée" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Suite élégante" }, { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Vue urbaine" }], rooms: [{ type: "Suite Montaigne", bedCount: 1, area: 71, hasBalcony: true, pricePerNight: 2750, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Montaigne" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon de suite" }] }, { type: "Chambre Classic", bedCount: 1, area: 34, pricePerNight: 1250, images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre classic" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Détails chambre" }] }], },
  { name: "Hotel Balzac", starRating: 5, address: { street: "6 Rue Balzac", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8731, longitude: 2.3023 }, ambiances: ["AFFAIRES", "ESCAPADE", "ROMANTIQUE"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite Balzac" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre Balzac" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Salon hôtelier" }], rooms: [{ type: "Suite Arc de Triomphe", bedCount: 1, area: 52, hasBalcony: true, pricePerNight: 1450, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Arc de Triomphe" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon privé" }] }, { type: "Chambre Élégance", bedCount: 1, area: 30, pricePerNight: 890, images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre élégance" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Lit confortable" }] }], },
  { name: "Le Roch Hotel & Spa", starRating: 5, address: { street: "28 Rue Saint-Roch", city: "Paris", country: "France", postalCode: "75001", latitude: 48.8665, longitude: 2.3281 }, ambiances: ["BIEN_ETRE", "CITY_BREAK", "DECONTRACTE"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Spa du Roch" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre du Roch" }, { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite moderne" }], rooms: [{ type: "Suite Spa", bedCount: 1, area: 48, hasBalcony: false, pricePerNight: 760, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite spa" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon spa" }] }, { type: "Chambre Deluxe", bedCount: 1, area: 28, pricePerNight: 520, images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre deluxe" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Lit deluxe" }] }], },
  { name: "Hôtel Madame Rêve", starRating: 5, address: { street: "48 Rue du Louvre", city: "Paris", country: "France", postalCode: "75001", latitude: 48.8623, longitude: 2.3428 }, ambiances: ["AFFAIRES", "CITY_BREAK", "ROMANTIQUE"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite panoramique" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre design" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Rooftop hôtelier" }], rooms: [{ type: "Suite Rooftop", bedCount: 1, area: 55, hasBalcony: true, pricePerNight: 980, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite rooftop" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon rooftop" }] }, { type: "Chambre Signature", bedCount: 1, area: 31, pricePerNight: 610, images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre signature" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Lit signature" }] }], },
  { name: "Pavillon de la Reine", starRating: 5, address: { street: "28 Place des Vosges", city: "Paris", country: "France", postalCode: "75003", latitude: 48.8557, longitude: 2.3656 }, ambiances: ["ROMANTIQUE", "ESCAPADE", "DECONTRACTE"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Chambre de charme" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Suite de charme" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Cour intérieure" }], rooms: [{ type: "Suite Place des Vosges", bedCount: 1, area: 46, hasBalcony: true, pricePerNight: 720, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Place des Vosges" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon de charme" }] }, { type: "Chambre Cour", bedCount: 1, area: 27, pricePerNight: 480, images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre cour" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Lit cosy" }] }], },
  { name: "Brach Paris", starRating: 5, address: { street: "1-7 Rue Jean Richepin", city: "Paris", country: "France", postalCode: "75016", latitude: 48.8666, longitude: 2.2662 }, ambiances: ["DECONTRACTE", "BIEN_ETRE", "CITY_BREAK"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre Brach" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Piscine et bien-être" }, { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite design" }], rooms: [{ type: "Suite Brach", bedCount: 1, area: 54, hasBalcony: true, pricePerNight: 940, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Brach" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon Brach" }] }, { type: "Chambre Atelier", bedCount: 1, area: 33, pricePerNight: 690, images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre atelier" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Lit atelier" }] }], },
  { name: "Hôtel Lancaster", starRating: 5, address: { street: "7 Rue de Berri", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8706, longitude: 2.3044 }, ambiances: ["AFFAIRES", "ESCAPADE", "CITY_BREAK"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite Lancaster" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre raffinée" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Salon hôtelier" }], rooms: [{ type: "Suite Berri", bedCount: 1, area: 50, hasBalcony: false, pricePerNight: 880, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Berri" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon Berri" }] }, { type: "Chambre Luxe", bedCount: 1, area: 29, pricePerNight: 540, images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre luxe" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Lit luxe" }] }], },
  { name: "Maison Albar Le Vendome", starRating: 5, address: { street: "7 Rue Helder", city: "Paris", country: "France", postalCode: "75009", latitude: 48.8727, longitude: 2.3371 }, ambiances: ["AFFAIRES", "ESCAPADE", "BIEN_ETRE"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite Vendome" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre Vendome" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Spa Vendome" }], rooms: [{ type: "Suite Vendome", bedCount: 1, area: 57, hasBalcony: true, pricePerNight: 990, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Vendome" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon Vendome" }] }, { type: "Chambre Prestige", bedCount: 1, area: 32, pricePerNight: 610, images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre prestige" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Lit prestige" }] }], },
  { name: "Grand Pigalle Experimental", starRating: 4, address: { street: "43 Rue de Douai", city: "Paris", country: "France", postalCode: "75009", latitude: 48.8822, longitude: 2.3333 }, ambiances: ["DECONTRACTE", "CITY_BREAK", "ESCAPADE"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre Pigalle" }, { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite Pigalle" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Bar et ambiance" }], rooms: [{ type: "Suite Pigalle", bedCount: 1, area: 38, hasBalcony: false, pricePerNight: 420, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Pigalle" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon Pigalle" }] }, { type: "Chambre Compacte", bedCount: 1, area: 22, pricePerNight: 290, images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre compacte" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Lit compact" }] }], },
  { name: "Le Cinq Codet", starRating: 5, address: { street: "5 Rue Louis Codet", city: "Paris", country: "France", postalCode: "75007", latitude: 48.8552, longitude: 2.3115 }, ambiances: ["BIEN_ETRE", "DECONTRACTE", "CITY_BREAK"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite moderne" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre design" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Spa et rooftop" }], rooms: [{ type: "Suite Codet", bedCount: 1, area: 45, hasBalcony: true, pricePerNight: 670, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Codet" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon Codet" }] }, { type: "Chambre Urbain", bedCount: 1, area: 25, pricePerNight: 410, images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre urbain" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Lit urbain" }] }], },
  { name: "Hôtel Particulier Montmartre", starRating: 4, address: { street: "23 Avenue Junot", city: "Paris", country: "France", postalCode: "75018", latitude: 48.8874, longitude: 2.3322 }, ambiances: ["ROMANTIQUE", "ESCAPADE", "DECONTRACTE"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite Montmartre" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre de charme" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Jardin privé" }], rooms: [{ type: "Suite Jardin", bedCount: 1, area: 40, hasBalcony: true, pricePerNight: 540, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite jardin" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon jardin" }] }, { type: "Chambre Cosy", bedCount: 1, area: 24, pricePerNight: 340, images: [{ url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Chambre cosy" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Lit cosy" }] }], },
  { name: "Hotel du Collectionneur", starRating: 5, address: { street: "51-57 Rue de Courcelles", city: "Paris", country: "France", postalCode: "75008", latitude: 48.8761, longitude: 2.3083 }, ambiances: ["AFFAIRES", "ROMANTIQUE", "CITY_BREAK"], distinctions: [{ type: "ONE_KEY", year: 2024 }], images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80", alt: "Suite Collectionneur" }, { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre haut de gamme" }, { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80", alt: "Lobby de palace" }], rooms: [{ type: "Suite Collectionneur", bedCount: 1, area: 58, hasBalcony: false, pricePerNight: 720, images: [{ url: "https://images.unsplash.com/photo-1560067174-8943bd6f6b7d?auto=format&fit=crop&w=1400&q=80", alt: "Suite Collectionneur" }, { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80", alt: "Salon Collectionneur" }] }, { type: "Chambre Executive", bedCount: 1, area: 30, pricePerNight: 450, images: [{ url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80", alt: "Chambre executive" }, { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80", alt: "Lit executive" }] }], },
] as const;

function normalizeString(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function imageUrlFromSeeds(images: readonly ImageSeed[]) {
  return images[0]?.url ?? null;
}

function pickBestDistinction(distinctions: readonly { type: string; year: number }[]) {
  return [...distinctions].sort((left, right) => {
    const scoreDiff = (restaurantDistinctionPriority[right.type] ?? 0) - (restaurantDistinctionPriority[left.type] ?? 0);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return right.year - left.year;
  })[0];
}

type SeedTransaction = Prisma.TransactionClient;

async function upsertAddress(tx: SeedTransaction, address: AddressSeed) {
  const where = {
    street: normalizeString(address.street),
    city: normalizeString(address.city),
    country: normalizeString(address.country),
    postalCode: normalizeString(address.postalCode),
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
  };

  const existing = await tx.address.findFirst({ where });

  if (existing) {
    return tx.address.update({ where: { id: existing.id }, data: where });
  }

  return tx.address.create({ data: where });
}

async function upsertReferenceTables(tx: SeedTransaction) {
  await Promise.all([
    ...ambiancesRestaurantSeed.map((item) => tx.ambianceRestaurant.upsert({ where: { code: item.code }, update: { libelle: item.libelle }, create: item })),
    ...ambiancesHotelSeed.map((item) => tx.ambianceHotel.upsert({ where: { code: item.code }, update: { libelle: item.libelle }, create: item })),
    ...typesCuisineSeed.map((item) => tx.typeCuisine.upsert({ where: { code: item.code }, update: { libelle: item.libelle }, create: item })),
  ]);
}

async function seedRestaurant(tx: SeedTransaction, item: RestaurantSeed, referenceIds: ReferenceIds, restaurantIndex: number) {
  const address = await upsertAddress(tx, item.address);
  const existing = await tx.restaurant.findFirst({ where: { name: item.name } });

  const baseData = {
    name: item.name,
    link: item.link,
    menu: item.menu,
    priceRange: item.priceRange,
    schedule: item.schedule,
    seatingCap: item.seatingCap,
    imageUrl: item.imageUrl ?? imageUrlFromSeeds(item.images),
    addressId: address.id,
  };

  const restaurant = existing
    ? await tx.restaurant.update({ where: { id: existing.id }, data: baseData })
    : await tx.restaurant.create({ data: baseData });

  await tx.restaurantAmbiance.deleteMany({ where: { restaurantId: restaurant.id } });
  if (item.ambiances.length > 0) {
    await tx.restaurantAmbiance.createMany({
      data: item.ambiances.map((code) => ({ restaurantId: restaurant.id, ambianceRestaurantId: referenceIds.ambiancesRestaurant[code] })),
    });
  }

  await tx.restaurantTypeCuisine.deleteMany({ where: { restaurantId: restaurant.id } });
  if (item.cuisines.length > 0) {
    await tx.restaurantTypeCuisine.createMany({
      data: item.cuisines.map((code) => ({ restaurantId: restaurant.id, typeCuisineId: referenceIds.typesCuisine[code] })),
    });
  }

  await tx.image.deleteMany({ where: { restaurantId: restaurant.id } });
  if (item.images.length > 0) {
    await tx.image.createMany({
      data: item.images.map((image) => ({ url: image.url, alt: image.alt, source: "michelin-seed", restaurantId: restaurant.id })),
    });
  }

  await tx.verticalMedia.deleteMany({ where: { restaurantId: restaurant.id } });
  const verticalMedias = buildRestaurantVerticalMedias(item.name, restaurantIndex);
  if (verticalMedias.length > 0) {
    await tx.verticalMedia.createMany({
      data: verticalMedias.map((media) => ({
        url: media.url,
        description: media.description ?? media.title ?? null,
        restaurantId: restaurant.id,
      })),
    });
  }

  await tx.distinction.deleteMany({ where: { restaurantId: restaurant.id } });
  if (item.distinctions.length > 0) {
    await tx.distinction.createMany({
      data: item.distinctions.map((distinction): Prisma.DistinctionCreateManyInput => ({ restaurantId: restaurant.id, type: distinction.type, year: distinction.year })),
    });
  }

  return restaurant;
}

async function seedHotel(tx: SeedTransaction, item: HotelSeed, referenceIds: ReferenceIds) {
  const address = await upsertAddress(tx, item.address);
  const existing = await tx.hotel.findFirst({ where: { name: item.name } });

  const hotel = existing
    ? await tx.hotel.update({
        where: { id: existing.id },
        data: { name: item.name, imageUrl: item.imageUrl ?? imageUrlFromSeeds(item.images), starRating: item.starRating, addressId: address.id },
      })
    : await tx.hotel.create({ data: { name: item.name, imageUrl: item.imageUrl ?? imageUrlFromSeeds(item.images), starRating: item.starRating, addressId: address.id } });

  await tx.hotelAmbiance.deleteMany({ where: { hotelId: hotel.id } });
  if (item.ambiances.length > 0) {
    await tx.hotelAmbiance.createMany({
      data: item.ambiances.map((code) => ({ hotelId: hotel.id, ambianceHotelId: referenceIds.ambiancesHotel[code] })),
    });
  }

  await tx.image.deleteMany({ where: { hotelId: hotel.id } });
  if (item.images.length > 0) {
    await tx.image.createMany({
      data: item.images.map((image) => ({ url: image.url, alt: image.alt, source: "michelin-seed", hotelId: hotel.id })),
    });
  }

  await tx.distinction.deleteMany({ where: { hotelId: hotel.id } });
  if (item.distinctions.length > 0) {
    await tx.distinction.createMany({
      data: item.distinctions.map((distinction): Prisma.DistinctionCreateManyInput => ({ hotelId: hotel.id, type: distinction.type, year: distinction.year })),
    });
  }

  await tx.hotelRoom.deleteMany({ where: { hotelId: hotel.id } });
  for (const roomSeed of item.rooms) {
    const roomWhere = { bedCount: roomSeed.bedCount, area: roomSeed.area ?? null, hasBalcony: roomSeed.hasBalcony ?? false, type: roomSeed.type, pricePerNight: roomSeed.pricePerNight };

    const room = (await tx.room.findFirst({ where: roomWhere })) ??
      (await tx.room.create({ data: { ...roomWhere, photo: roomSeed.images[0]?.url ?? null } }));

    if (roomSeed.images.length > 0) {
      await tx.image.deleteMany({ where: { roomId: room.id } });
      await tx.image.createMany({
        data: roomSeed.images.map((image): Prisma.ImageCreateManyInput => ({ url: image.url, alt: image.alt, source: "michelin-seed", roomId: room.id })),
      });
    }

    await tx.hotelRoom.create({ data: { hotelId: hotel.id, roomId: room.id } });
  }

  return hotel;
}

type ReferenceIds = {
  ambiancesRestaurant: Record<string, number>;
  ambiancesHotel: Record<string, number>;
  typesCuisine: Record<string, number>;
};

async function loadReferenceIds(tx: SeedTransaction): Promise<ReferenceIds> {
  const [restaurantsRefs, hotelsRefs, cuisineRefs] = await Promise.all([
    tx.ambianceRestaurant.findMany(),
    tx.ambianceHotel.findMany(),
    tx.typeCuisine.findMany(),
  ]);

  return {
    ambiancesRestaurant: Object.fromEntries(restaurantsRefs.map((item) => [item.code, item.id])),
    ambiancesHotel: Object.fromEntries(hotelsRefs.map((item) => [item.code, item.id])),
    typesCuisine: Object.fromEntries(cuisineRefs.map((item) => [item.code, item.id])),
  };
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run Prisma seed.");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });

  try {
    const seededRoles = await Promise.all(
      roles.map((role) => prisma.role.upsert({ where: { name: role.name }, update: { type: role.type }, create: { name: role.name, type: role.type } }))
    );

    await prisma.$transaction(async (tx) => {
      await upsertReferenceTables(tx);

      const referenceIds = await loadReferenceIds(tx);
      const seededRestaurants = await Promise.all(restaurants.map((restaurant, index) => seedRestaurant(tx, restaurant, referenceIds, index)));
      const seededHotels = await Promise.all(hotels.map((hotel) => seedHotel(tx, hotel, referenceIds)));

      const bestRestaurantDistinctions = seededRestaurants
        .map((restaurant, index) => ({ restaurant, distinction: pickBestDistinction(restaurants[index].distinctions) }))
        .filter((entry) => entry.distinction);

      console.log(
        [
          `Roles seeded: ${seededRoles.map((role) => `${role.name}(${role.type})`).join(", ")}`,
          `Reference tables seeded: ${Object.keys(referenceIds.ambiancesRestaurant).length} ambiances restaurants, ${Object.keys(referenceIds.ambiancesHotel).length} ambiances hôtels, ${Object.keys(referenceIds.typesCuisine).length} types cuisine`,
          `Michelin sample seeded: ${seededRestaurants.length} restaurants, ${seededHotels.length} hotels`,
          `Highlights: ${bestRestaurantDistinctions.slice(0, 3).map((entry) => `${entry.restaurant.name} (${entry.distinction?.type})`).join(", ")}`,
        ].join("\n")
      );
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Michelin seed failed:", error);
  process.exit(1);
});
