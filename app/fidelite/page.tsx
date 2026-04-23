"use client";

import type { UserRank } from "@/app/generated/prisma/enums";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

type RankDefinition = {
  rank: UserRank;
  label: string;
  minReservations: number;
  benefitLabel: string;
  freeMenu: boolean;
};

type FidelityUser = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  image: string | null;
  rank: UserRank;
  reservationCount: number;
};

const RANK_DEFINITIONS: RankDefinition[] = [
  { rank: "BASIC", label: "Basic", minReservations: 0, benefitLabel: "Acces au programme fidelite", freeMenu: false },
  { rank: "BRONZE", label: "Bronze", minReservations: 10, benefitLabel: "Avantages exclusifs partenaires", freeMenu: false },
  { rank: "SILVER", label: "Silver", minReservations: 25, benefitLabel: "-10% sur ton addition", freeMenu: false },
  { rank: "GOLD", label: "Gold", minReservations: 50, benefitLabel: "Un menu offert", freeMenu: true },
  { rank: "PREMIUM", label: "Premium", minReservations: 100, benefitLabel: "-20% sur ton addition", freeMenu: false },
];

const rankColors: Record<UserRank, string> = {
  BASIC: "#BD2334",
  BRONZE: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PREMIUM: "#B50094",
};

const rankLogoPaths: Record<UserRank, string> = {
  BASIC: "/ranks/basic.svg",
  BRONZE: "/ranks/bronze.svg",
  SILVER: "/ranks/silver.svg",
  GOLD: "/ranks/gold.svg",
  PREMIUM: "/ranks/premium.svg",
};

const rankIconSizeClass: Record<UserRank, string> = {
  BASIC: "h-6 w-6",
  BRONZE: "h-6 w-6",
  SILVER: "h-6 w-6",
  GOLD: "h-6 w-6",
  PREMIUM: "h-7 w-7",
};

const progressRankIconClass: Record<UserRank, string> = {
  BASIC: "h-6 w-6",
  BRONZE: "h-6 w-6",
  SILVER: "h-6 w-6",
  GOLD: "h-6 w-6",
  PREMIUM: "h-7 w-7",
};

const rewardRankIconClass: Record<UserRank, string> = {
  BASIC: "h-9 w-9",
  BRONZE: "h-9 w-9",
  SILVER: "h-9 w-9",
  GOLD: "h-9 w-9",
  PREMIUM: "h-10 w-10",
};

const currentRankBadgeIconClass: Record<UserRank, string> = {
  BASIC: "h-10 w-10",
  BRONZE: "h-10 w-10",
  SILVER: "h-10 w-10",
  GOLD: "h-10 w-10",
  PREMIUM: "h-11 w-11",
};

const rewardCardStyles: Record<UserRank, string> = {
  BASIC: "from-[#BD2334]/85 to-[#571018]/90 border-[#BD2334]",
  BRONZE: "from-[#CD7F32]/85 to-[#674019]/90 border-[#CD7F32]",
  SILVER: "from-[#C0C0C0]/80 to-[#5A5A5A]/90 border-[#C0C0C0]",
  GOLD: "from-[#FFD700]/80 to-[#998100]/95 border-[#FFD700]",
  PREMIUM: "from-[#B50094]/80 to-[#4F0041]/95 border-[#B50094]",
};

const rewardBackgrounds: Record<UserRank, string> = {
  BASIC: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
  BRONZE: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  SILVER: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
  GOLD: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  PREMIUM: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
};

const DEFAULT_AVATAR_SRC = "/avatar-default.svg";

function getSafeImageSrc(value: string | null | undefined) {
  if (!value) return DEFAULT_AVATAR_SRC;
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_AVATAR_SRC;
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  return DEFAULT_AVATAR_SRC;
}

function getDisplayName(firstName: string | null, lastName: string | null, email: string | null) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  if (email) return email.split("@")[0];
  return "Utilisateur";
}

function getProgress(reservationCount: number) {
  const safeCount = Math.max(0, reservationCount);
  let currentIndex = 0;
  for (let i = 0; i < RANK_DEFINITIONS.length; i += 1) {
    if (safeCount >= RANK_DEFINITIONS[i].minReservations) {
      currentIndex = i;
    }
  }
  const currentDefinition = RANK_DEFINITIONS[currentIndex];
  const nextDefinition = RANK_DEFINITIONS[currentIndex + 1] ?? null;

  if (!nextDefinition) {
    return {
      currentDefinition,
      nextDefinition: null,
      overallProgressPercent: 100,
      reservationsToNextRank: 0,
    };
  }

  const currentMin = currentDefinition.minReservations;
  const nextMin = nextDefinition.minReservations;
  const segmentProgress = (safeCount - currentMin) / (nextMin - currentMin);
  const overallSteps = RANK_DEFINITIONS.length - 1;
  const overallProgressPercent = Math.max(0, Math.min(100, ((currentIndex + segmentProgress) / overallSteps) * 100));

  return {
    currentDefinition,
    nextDefinition,
    overallProgressPercent,
    reservationsToNextRank: Math.max(0, nextDefinition.minReservations - safeCount),
  };
}

export default function FidelitePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<FidelityUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoadingUser(true);
      setLoadError("");

      try {
        const query = new URLSearchParams();
        if (session?.user?.id) {
          query.set("id", session.user.id);
        }
        if (session?.user?.email) {
          query.set("email", session.user.email);
        }

        const response = await fetch(`/api/user/fidelite?${query.toString()}`, { cache: "no-store" });
        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/");
            return;
          }
          throw new Error("Erreur de chargement.");
        }

        const payload = (await response.json()) as { data?: FidelityUser };
        if (!cancelled) {
          setUser(payload.data ?? null);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Impossible de charger le programme fidelite.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUser(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [status, router, session?.user?.id, session?.user?.email]);

  const progress = useMemo(() => getProgress(user?.reservationCount ?? 0), [user?.reservationCount]);

  const nextRewards = useMemo(
    () => RANK_DEFINITIONS.filter((entry) => entry.minReservations > (user?.reservationCount ?? 0)).slice(0, 2),
    [user?.reservationCount],
  );

  if (status === "loading" || (status === "authenticated" && isLoadingUser && !user)) {
    return <main className="min-h-screen bg-[#f4f4f4] px-4 pb-8 pt-5">Chargement...</main>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (!user) {
    return <main className="min-h-screen bg-[#f4f4f4] px-4 pb-8 pt-5">{loadError || "Utilisateur introuvable."}</main>;
  }

  const statusMessage = progress.nextDefinition
    ? `Plus que ${progress.reservationsToNextRank} reservation${progress.reservationsToNextRank > 1 ? "s" : ""} et tu debloques ${progress.nextDefinition.benefitLabel.toLowerCase()} !`
    : "Tu as debloque le dernier palier. Profite de tous les avantages !";

  return (
    <main className="min-h-screen bg-[#f4f4f4] px-4 pb-8 pt-5 text-[#141414] lg:px-8 lg:pb-14 lg:pt-8">
      <section className="mx-auto w-full max-w-[1160px]">
        <header className="mb-5 flex items-center lg:mb-8">
          <Link
            href="/hotel"
            aria-label="Retour"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/50 bg-white transition hover:bg-black/5"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </header>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:items-start lg:gap-9">
          <div className="lg:rounded-[34px] lg:border lg:border-black/20 lg:bg-white lg:p-7 lg:shadow-[0_16px_34px_rgba(0,0,0,0.08)]">
            <div className="rounded-[36px] border border-black bg-white px-3 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Image
                    src={getSafeImageSrc(user.image)}
                    alt="Photo de profil"
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border border-black/10 object-cover"
                  />
                  <p className="text-[20px] font-semibold leading-none">{getDisplayName(user.firstName, user.lastName, user.email)}</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-white">
                  <Image
                    src={rankLogoPaths[user.rank]}
                    alt={`Logo ${user.rank}`}
                    width={24}
                    height={24}
                    className={`${rankIconSizeClass[user.rank]} object-contain`}
                  />
                </div>
              </div>
            </div>

            <section className="mt-6 lg:mt-7">
              <div className="relative mx-6 h-14 lg:mx-4">
                <div className="absolute inset-x-0 top-[31px] h-[2px] bg-[linear-gradient(90deg,#BD2334_0%,#CD7F32_27%,#C0C0C0_50%,#FFD700_73%,#B50094_97%)]" />

                {RANK_DEFINITIONS.map((definition, index) => {
                  const unlocked = user.reservationCount >= definition.minReservations;
                  const left = `${(index / (RANK_DEFINITIONS.length - 1)) * 100}%`;

                  return (
                    <div key={definition.rank} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left }}>
                      <div className="flex h-8 w-8 items-center justify-center lg:h-9 lg:w-9">
                        <Image
                          src={rankLogoPaths[definition.rank]}
                          alt={`Palier ${definition.label}`}
                          width={24}
                          height={24}
                          className={`${progressRankIconClass[definition.rank]} object-contain ${unlocked ? "opacity-100" : "opacity-40 grayscale"}`}
                        />
                      </div>
                      <span
                        className={`mt-[9px] h-[6px] w-[6px] rounded-full ${unlocked ? "opacity-100" : "opacity-35"}`}
                        style={{ backgroundColor: rankColors[definition.rank] }}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="mt-5 flex justify-center lg:mt-6 lg:justify-start">
              <div className="inline-flex items-center gap-3 rounded-full border border-black bg-white px-5 py-3 lg:px-6">
                <Image
                  src={rankLogoPaths[user.rank]}
                  alt={`Palier ${user.rank}`}
                  width={40}
                  height={40}
                  className={`${currentRankBadgeIconClass[user.rank]} object-contain`}
                />
                <p className="text-[18px]">Palier {progress.currentDefinition.label.toUpperCase()}</p>
              </div>
            </div>

            <div className="mt-6 px-2 text-center lg:px-0 lg:text-left">
              <p className="text-[16px] leading-[1.35]">{statusMessage}</p>
            </div>
          </div>

          <div className="space-y-5 lg:rounded-[30px] lg:border lg:border-black/15 lg:bg-white lg:p-6 lg:shadow-[0_14px_28px_rgba(0,0,0,0.06)]">
            <p className="text-center text-[16px] font-bold lg:text-left">Tes prochaines recompenses :</p>
            {nextRewards.length === 0 ? (
              <div className="rounded-[24px] border border-[#B50094] bg-white px-5 py-6 text-center shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
                <p className="text-[16px] font-semibold">Tu as debloque toutes les recompenses.</p>
              </div>
            ) : (
              nextRewards.map((reward) => (
                <article key={reward.rank}>
                  <div className="mb-2 flex items-center justify-center gap-3 lg:justify-start">
                    <Image
                      src={rankLogoPaths[reward.rank]}
                      alt={`Palier ${reward.label}`}
                      width={36}
                      height={36}
                      className={`${rewardRankIconClass[reward.rank]} object-contain`}
                    />
                    <p className="text-[16px] font-medium">Palier {reward.label}</p>
                  </div>

                  <div
                    className={`relative overflow-hidden rounded-[25px] border bg-gradient-to-br ${rewardCardStyles[reward.rank]} px-5 py-5 text-white shadow-[0_8px_16px_rgba(0,0,0,0.12)]`}
                  >
                    <Image src={rewardBackgrounds[reward.rank]} alt={`Illustration ${reward.label}`} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />

                    <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white/85 bg-black/15 text-[22px]">
                        {reward.freeMenu ? "🍽" : "🏷"}
                      </div>
                      <p className="text-[16px] font-bold">{reward.benefitLabel}</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
