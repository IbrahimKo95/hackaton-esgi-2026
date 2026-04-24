"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const VIDEO_EXTENSION_REGEX = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

type VerticalFeedItem = {
    id: number;
    url: string;
    description: string | null;
    restaurant: {
        id: number;
        name: string;
        link: string | null;
        imageUrl: string | null;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
        };
    };
};

type VerticalFeedProps = {
    items: VerticalFeedItem[];
};

const isVideoUrl = (url: string) => VIDEO_EXTENSION_REGEX.test(url);

const getPseudoRandomLikes = (seed: string) => {
    let hash = 0;

    for (let index = 0; index < seed.length; index += 1) {
        hash = (hash << 5) - hash + seed.charCodeAt(index);
        hash |= 0;
    }

    return 1200 + (Math.abs(hash) % 8800);
};

const formatLikes = (likes: number) => {
    const likesInK = likes / 1000;
    return `${new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(likesInK)}k`;
};

const formatAddress = ({ street, postalCode, city, country }: VerticalFeedItem["restaurant"]["address"]) =>
    `${street}, ${postalCode} ${city}, ${country}`;

export default function VerticalFeed({ items }: VerticalFeedProps) {
    const scrollContainerRef = useRef<HTMLElement>(null);
    const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
    const [activeIndex, setActiveIndex] = useState(0);
    const [videoFailures, setVideoFailures] = useState<Record<number, boolean>>({});

    const markVideoAsFailed = (itemId: number) => {
        setVideoFailures((previous) => {
            if (previous[itemId]) {
                return previous;
            }

            return {
                ...previous,
                [itemId]: true,
            };
        });
    };

    useEffect(() => {
        const container = scrollContainerRef.current;

        if (!container || items.length === 0) {
            return;
        }

        const elements = Array.from(container.querySelectorAll<HTMLElement>("[data-vertical-item-index]"));

        if (elements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

                const topEntry = visibleEntries[0];
                const indexValue = topEntry?.target.getAttribute("data-vertical-item-index");

                if (!indexValue) {
                    return;
                }

                const nextIndex = Number.parseInt(indexValue, 10);

                if (!Number.isNaN(nextIndex)) {
                    setActiveIndex(nextIndex);
                }
            },
            {
                root: container,
                threshold: [0.5, 0.7, 0.9],
            },
        );

        for (const element of elements) {
            observer.observe(element);
        }

        return () => {
            observer.disconnect();
        };
    }, [items]);

    useEffect(() => {
        for (const [indexAsText, videoElement] of Object.entries(videoRefs.current)) {
            if (!videoElement) {
                continue;
            }

            const index = Number.parseInt(indexAsText, 10);
            const isActive = index === activeIndex;

            if (!isActive) {
                videoElement.pause();
                continue;
            }

            videoElement.muted = true;
            videoElement.playsInline = true;

            void videoElement.play().catch(() => {
                // Laisser le fallback image prendre le relais via onError si nécessaire.
            });
        }
    }, [activeIndex]);

    const activeItem = items[activeIndex] ?? items[0];

    const destination = useMemo(() => {
        if (!activeItem) {
            return "/";
        }

        return `/restaurant/${activeItem.restaurant.id}`;
    }, [activeItem]);

    if (items.length === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
                <div className="text-center">
                    <p className="text-xl font-semibold">Aucun contenu vertical disponible.</p>
                    <Link
                        href="/"
                        className="mt-5 inline-flex rounded-full border border-white/35 px-4 py-2 text-sm transition hover:bg-white/10"
                    >
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="relative h-screen overflow-hidden bg-black text-white">
            <Link
                href="/"
                aria-label="Retour"
                className="fixed left-4 top-4 z-40 rounded-full border border-white/40 bg-black/35 p-2.5 backdrop-blur-md transition hover:bg-black/55"
            >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Link>

            <section
                ref={scrollContainerRef}
                className="h-screen snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {items.map((item, index) => (
                    <article
                        key={item.id}
                        data-vertical-item-index={index}
                        className="relative min-h-screen w-full snap-start"
                    >
                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                            <div className="relative h-full w-full md:h-full md:w-auto md:aspect-[9/16]">
                                {isVideoUrl(item.url) && !videoFailures[item.id] ? (
                                    <video
                                        ref={(element) => {
                                            videoRefs.current[index] = element;
                                        }}
                                        src={item.url}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        poster={item.restaurant.imageUrl ?? undefined}
                                        onError={() => {
                                            markVideoAsFailed(item.id);
                                        }}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : item.restaurant.imageUrl ? (
                                    <Image
                                        src={item.restaurant.imageUrl}
                                        alt={item.description ?? `${item.restaurant.name} aperçu`}
                                        fill
                                        priority={index === 0}
                                        className="object-cover"
                                    />
                                ) : isVideoUrl(item.url) ? (
                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-700" />
                                ) : (
                                    <Image
                                        src={item.url}
                                        alt={item.description ?? `${item.restaurant.name} média ${index + 1}`}
                                        fill
                                        priority={index === 0}
                                        className="object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/20" />
                    </article>
                ))}
            </section>

            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4 pb-6 sm:p-6 sm:pb-8">
                <div className="mx-auto max-w-3xl">
                    <a
                        href={destination}
                        className="pointer-events-auto flex items-end justify-between gap-4 rounded-3xl border border-white/30 bg-black/30 p-4 backdrop-blur-xl transition hover:bg-black/40 sm:p-5"
                    >
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold leading-tight sm:text-3xl">{activeItem.restaurant.name}</h1>
                            <p className="mt-1 truncate text-sm text-white/90 sm:text-base">
                                {formatAddress(activeItem.restaurant.address)}
                            </p>
                        </div>

                        <div className="shrink-0 rounded-full border border-white/40 bg-white/10 px-3 py-2">
                            <div className="flex items-center gap-2">
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path
                                        d="M12 20s-7-4.6-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.4-7 10-7 10z"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <span className="text-sm font-medium tracking-wide text-white/95">
                                    {formatLikes(getPseudoRandomLikes(`${activeItem.id}-${activeItem.url}`))}
                                </span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </main>
    );
}
