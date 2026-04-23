import type { UserRank } from "@/app/generated/prisma/enums";

type RankDefinition = {
  rank: UserRank;
  label: string;
  minReservations: number;
  benefitLabel: string;
  discountPercent: number;
  freeMenu: boolean;
};

const RANK_THRESHOLDS_DESC: Array<{ min: number; rank: UserRank }> = [
  { min: 100, rank: "PREMIUM" },
  { min: 50, rank: "GOLD" },
  { min: 25, rank: "SILVER" },
  { min: 10, rank: "BRONZE" },
  { min: 0, rank: "BASIC" },
];

export const RANK_DEFINITIONS_ASC: RankDefinition[] = [
  {
    rank: "BASIC",
    label: "Basic",
    minReservations: 0,
    benefitLabel: "Acces au programme fidelite",
    discountPercent: 0,
    freeMenu: false,
  },
  {
    rank: "BRONZE",
    label: "Bronze",
    minReservations: 10,
    benefitLabel: "Avantages exclusifs partenaires",
    discountPercent: 0,
    freeMenu: false,
  },
  {
    rank: "SILVER",
    label: "Silver",
    minReservations: 25,
    benefitLabel: "-10% sur ton addition",
    discountPercent: 10,
    freeMenu: false,
  },
  {
    rank: "GOLD",
    label: "Gold",
    minReservations: 50,
    benefitLabel: "Un menu offert",
    discountPercent: 0,
    freeMenu: true,
  },
  {
    rank: "PREMIUM",
    label: "Premium",
    minReservations: 100,
    benefitLabel: "-20% sur ton addition",
    discountPercent: 20,
    freeMenu: false,
  },
];

export function getRankFromReservationCount(count: number): UserRank {
  for (const threshold of RANK_THRESHOLDS_DESC) {
    if (count >= threshold.min) {
      return threshold.rank;
    }
  }

  return "BASIC";
}

export function getRankDefinition(rank: UserRank): RankDefinition {
  return RANK_DEFINITIONS_ASC.find((entry) => entry.rank === rank) ?? RANK_DEFINITIONS_ASC[0];
}

export function getRankProgress(reservationCount: number) {
  const safeCount = Math.max(0, reservationCount);
  const currentRank = getRankFromReservationCount(safeCount);
  const currentDefinition = getRankDefinition(currentRank);
  const currentIndex = RANK_DEFINITIONS_ASC.findIndex((entry) => entry.rank === currentRank);
  const nextDefinition = RANK_DEFINITIONS_ASC[currentIndex + 1] ?? null;

  if (!nextDefinition) {
    return {
      currentRank,
      currentDefinition,
      nextDefinition: null,
      reservationsToNextRank: 0,
      segmentProgressPercent: 100,
      overallProgressPercent: 100,
    };
  }

  const currentMin = currentDefinition.minReservations;
  const nextMin = nextDefinition.minReservations;
  const progressWithinSegment = (safeCount - currentMin) / (nextMin - currentMin);
  const segmentProgressPercent = Math.max(0, Math.min(100, progressWithinSegment * 100));

  const overallSteps = RANK_DEFINITIONS_ASC.length - 1;
  const overallProgressPercent = Math.max(
    0,
    Math.min(100, ((currentIndex + progressWithinSegment) / overallSteps) * 100),
  );

  return {
    currentRank,
    currentDefinition,
    nextDefinition,
    reservationsToNextRank: Math.max(0, nextDefinition.minReservations - safeCount),
    segmentProgressPercent,
    overallProgressPercent,
  };
}
