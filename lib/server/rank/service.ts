import type { UserRank } from "@/app/generated/prisma/enums";

const RANK_THRESHOLDS: Array<{ min: number; rank: UserRank }> = [
  { min: 100, rank: "PREMIUM" },
  { min: 50, rank: "GOLD" },
  { min: 25, rank: "SILVER" },
  { min: 10, rank: "BRONZE" },
  { min: 0, rank: "BASIC" },
];

export function getRankFromReservationCount(count: number): UserRank {
  for (const threshold of RANK_THRESHOLDS) {
    if (count >= threshold.min) {
      return threshold.rank;
    }
  }

  return "BASIC";
}
