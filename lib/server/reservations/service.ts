import { prisma } from "@/lib/server/prisma";
import { HttpError } from "@/lib/server/http";
import type { Prisma } from "@/app/generated/prisma/client";
import type { ReservationCreateInput } from "@/lib/server/schemas/reservations";
import {
  getRankDefinition,
  getRankFromReservationCount,
  getRankProgress,
} from "@/lib/server/rank/service";

function getUtcDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0),
  );
  const end = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0),
  );

  return { start, end };
}

export async function createReservationForRestaurant(
  restaurantId: number,
  userId: string,
  input: ReservationCreateInput,
) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, seatingCap: true },
  });

  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found.");
  }

  if (!restaurant.seatingCap) {
    throw new HttpError(
      400,
      "Cannot check availability: restaurant seatingCap is not configured.",
    );
  }

  const { start, end } = getUtcDayBounds(input.date);

  const reservationStats = await prisma.reservation.aggregate({
    where: {
      restaurantId,
      date: {
        gte: start,
        lt: end,
      },
    },
    _sum: {
      guestCount: true,
    },
  });

  const alreadyBooked = reservationStats._sum.guestCount ?? 0;
  const totalAfterBooking = alreadyBooked + input.guestCount;

  if (totalAfterBooking > restaurant.seatingCap) {
    throw new HttpError(409, "Not enough seats available for this day.", {
      seatingCap: restaurant.seatingCap,
      alreadyBooked,
      requested: input.guestCount,
      available: Math.max(restaurant.seatingCap - alreadyBooked, 0),
    });
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const reservation = await tx.reservation.create({
      data: {
        userId,
        restaurantId,
        date: input.date,
        guestCount: input.guestCount,
      },
    });

    const nextReservationCount = await tx.user.update({
      where: { id: userId },
      data: {
        reservationCount: {
          increment: 1,
        },
      },
      select: {
        reservationCount: true,
      },
    });

    const nextRank = getRankFromReservationCount(nextReservationCount.reservationCount);

    const rankedUser = await tx.user.update({
      where: { id: userId },
      data: {
        rank: nextRank,
      },
      select: {
        reservationCount: true,
        rank: true,
      },
    });

    const rankProgress = getRankProgress(rankedUser.reservationCount);

    return {
      ...reservation,
      userProgress: {
        reservationCount: rankedUser.reservationCount,
        rank: rankedUser.rank,
        currentBenefit: getRankDefinition(rankedUser.rank).benefitLabel,
        nextRank: rankProgress.nextDefinition?.rank ?? null,
        reservationsToNextRank: rankProgress.reservationsToNextRank,
      },
    };
  });
}
