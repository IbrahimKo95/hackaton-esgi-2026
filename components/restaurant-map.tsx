"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LeafletMap from "@/components/leaflet-map";

type MapRestaurant = {
    id: number;
    name: string;
    imageUrl: string | null;
    address: {
        street: string;
        city: string;
        country: string;
        latitude: number | null;
        longitude: number | null;
    };
};

type Position = {
    latitude: number;
    longitude: number;
};

type RestaurantMapProps = {
    restaurants: MapRestaurant[];
};

function normalize(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function hasCoordinates(restaurant: MapRestaurant) {
    return restaurant.address.latitude != null && restaurant.address.longitude != null;
}

function formatAddress(restaurant: MapRestaurant) {
    return `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.country}`;
}

function getDistance(a: Position, b: Position) {
    const earthRadius = 6371e3;
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const deltaLat = toRadians(b.latitude - a.latitude);
    const deltaLng = toRadians(b.longitude - a.longitude);
    const latitudeA = toRadians(a.latitude);
    const latitudeB = toRadians(b.latitude);

    const haversine =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(deltaLng / 2) ** 2;

    return 2 * earthRadius * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

function getCenter(points: Position[]) {
    if (points.length === 0) {
        return null;
    }

    const total = points.reduce(
        (accumulator, point) => ({
            latitude: accumulator.latitude + point.latitude,
            longitude: accumulator.longitude + point.longitude,
        }),
        { latitude: 0, longitude: 0 },
    );

    return {
        latitude: total.latitude / points.length,
        longitude: total.longitude / points.length,
    };
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-black/45" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
    );
}

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
    const availableRestaurants = useMemo(() => restaurants.filter(hasCoordinates), [restaurants]);
    const [query, setQuery] = useState("");
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState<Position | null>(null);
    const [locationState, setLocationState] = useState<"loading" | "granted" | "denied">(() =>
        typeof navigator === "undefined" || !navigator.geolocation ? "denied" : "loading",
    );

    useEffect(() => {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationState("granted");
            },
            () => {
                setLocationState("denied");
            },
            {
                enableHighAccuracy: false,
                timeout: 7000,
                maximumAge: 300000,
            },
        );
    }, []);

    const visibleRestaurants = useMemo(() => {
        if (!query.trim()) {
            return availableRestaurants;
        }

        const normalizedQuery = normalize(query.trim());

        return availableRestaurants.filter((restaurant) => {
            return normalize([restaurant.name, formatAddress(restaurant)].join(" ")).includes(normalizedQuery);
        });
    }, [availableRestaurants, query]);

    const nearestRestaurant = useMemo(() => {
        if (!userLocation || availableRestaurants.length === 0) {
            return availableRestaurants[0] ?? null;
        }

        return [...availableRestaurants]
            .map((restaurant) => ({
                restaurant,
                distance: getDistance(userLocation, {
                    latitude: restaurant.address.latitude ?? 0,
                    longitude: restaurant.address.longitude ?? 0,
                }),
            }))
            .sort((left, right) => left.distance - right.distance)[0]?.restaurant ?? null;
    }, [availableRestaurants, userLocation]);

    const selectedRestaurant = availableRestaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null;

    const activeRestaurant = query.trim()
        ? visibleRestaurants[0] ?? null
        : selectedRestaurant
            ?? nearestRestaurant
            ?? availableRestaurants[0]
            ?? null;

    const sheetRestaurant = selectedRestaurant;

    const points = useMemo(
        () => [
            ...availableRestaurants.map((restaurant) => ({
                latitude: restaurant.address.latitude as number,
                longitude: restaurant.address.longitude as number,
            })),
            ...(userLocation ? [userLocation] : []),
        ],
        [availableRestaurants, userLocation],
    );

    const mapCenter = userLocation ?? (activeRestaurant
        ? {
              latitude: activeRestaurant.address.latitude ?? 0,
              longitude: activeRestaurant.address.longitude ?? 0,
          }
        : getCenter(points) ?? { latitude: 48.8566, longitude: 2.3522 });

    const mapZoom = userLocation ? 13 : activeRestaurant ? 14 : 12;

    const matchCount = visibleRestaurants.length;
    const locationLabel = locationState === "granted"
        ? "Centrée sur votre position"
        : "Géolocalisation indisponible, carte centrée automatiquement";

    return (
        <section className="relative min-h-[100svh] overflow-hidden bg-[#f3f3f1]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(127,25,25,0.08),transparent_34%),linear-gradient(180deg,#f7f4f1_0%,#f1efec_100%)]" />

            <div className="absolute inset-0 p-3 sm:p-4">
                <div className="relative h-full overflow-hidden rounded-[32px] bg-[#191512] shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
                    <div className="absolute inset-0 overflow-hidden rounded-[32px]">
                        <LeafletMap
                            restaurants={visibleRestaurants}
                            selectedRestaurantId={selectedRestaurant?.id ?? activeRestaurant?.id ?? null}
                            highlightedRestaurantId={activeRestaurant?.id ?? null}
                            onSelectRestaurant={(restaurantId) => {
                                if (restaurantId < 0) {
                                    setSelectedRestaurantId(null);
                                    return;
                                }

                                setSelectedRestaurantId(restaurantId);
                            }}
                            userLocation={userLocation}
                            center={mapCenter}
                            zoom={mapZoom}
                        />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/15 pointer-events-none" />

                    <div className="absolute inset-x-0 top-0 p-3 sm:p-4 z-1000">
                        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 rounded-[24px] border border-white/10 bg-[#191512]/85 p-3 text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] backdrop-blur-md">
                            <Link href="/" aria-label="Retour à l'accueil" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/6 text-white/90 transition hover:bg-white/10">
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>

                            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-white/10 bg-white px-4 py-3 text-[#141414] shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
                                <span className="sr-only">Rechercher un restaurant sur la carte</span>
                                <SearchIcon />
                                <input
                                    value={query}
                                    onChange={(event) => {
                                        const nextQuery = event.target.value;
                                        setQuery(nextQuery);

                                        if (!nextQuery.trim()) {
                                            setSelectedRestaurantId(null);
                                        }
                                    }}
                                    placeholder="Rechercher un restaurant ou une adresse"
                                    className="w-full bg-transparent text-[14px] text-[#141414] placeholder:text-black/40 focus:outline-none"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="absolute left-4 top-24 z-10 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm sm:left-6 sm:top-28">
                        {locationLabel}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:p-4 sm:pb-[calc(env(safe-area-inset-bottom)+16px)] z-1000">
                        <div className={`mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-white/96 shadow-[0_-18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all ${sheetRestaurant ? "max-h-[46svh] opacity-100" : "max-h-[0] opacity-0"}`}>
                            {sheetRestaurant ? (
                                <div className="grid h-full gap-4 overflow-y-auto p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-5">
                                    <div className="relative min-h-[160px] overflow-hidden rounded-[22px] bg-[#f3f3f1]">
                                        {sheetRestaurant.imageUrl ? (
                                            <Image src={sheetRestaurant.imageUrl} alt={sheetRestaurant.name} fill className="object-cover" />
                                        ) : null}
                                    </div>

                                    <div className="flex min-w-0 flex-col z-1000">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7f1919]">Restaurant mis en avant</p>
                                                <h3 className="mt-2 text-[22px] font-semibold leading-tight text-[#141414]">{sheetRestaurant.name}</h3>
                                                <p className="mt-2 text-sm leading-6 text-black/70">{formatAddress(sheetRestaurant)}</p>
                                                {userLocation ? (
                                                    <p className="mt-2 text-sm font-medium text-black/60">
                                                        Environ {Math.round(getDistance(userLocation, {
                                                            latitude: sheetRestaurant.address.latitude ?? 0,
                                                            longitude: sheetRestaurant.address.longitude ?? 0,
                                                        }) / 1000 * 10) / 10} km de vous
                                                    </p>
                                                ) : null}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setSelectedRestaurantId(null)}
                                                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-black/70 transition hover:bg-black/5"
                                                aria-label="Fermer la fiche"
                                            >
                                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        </div>

                                        <Link
                                            href={`/restaurant/${sheetRestaurant.id}`}
                                            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#7f1919] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#651515]"
                                        >
                                            Ouvrir la fiche
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 text-sm text-black/70 sm:p-5">
                                    Aucun restaurant ne correspond à votre recherche.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f3f3f1] to-transparent" />

            <div className="sr-only" aria-live="polite">
                {matchCount} restaurant{matchCount > 1 ? "s" : ""} affiché{matchCount > 1 ? "s" : ""}
            </div>
        </section>
    );
}
