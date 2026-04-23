import { prisma } from "@/lib/server/prisma";
import { HttpError } from "@/lib/server/http";
import type { Prisma } from "@/app/generated/prisma/client";
import type {
  ReservationCreateInput,
  ReservationUpdateInput,
} from "@/lib/server/schemas/reservations";
import { getRankFromReservationCount } from "@/lib/server/rank/service";

function getUtcDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0),
  );
  const end = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0),
  );

  return { start, end };
}

function getUtcDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function createReservationForRestaurant(
  restaurantId: number,
  userId: string,
  input: ReservationCreateInput,
) {
  await assertRestaurantExists(restaurantId);
  await assertReservationCapacity(restaurantId, input.date, input.guestCount);

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

    return {
      ...reservation,
      userProgress: {
        reservationCount: rankedUser.reservationCount,
        rank: rankedUser.rank,
      },
    };
  });
}

async function assertRestaurantExists(restaurantId: number) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, seatingCap: true },
  });

  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found.");
  }

  return restaurant;
}

async function assertReservationCapacity(
  restaurantId: number,
  date: Date,
  requestedGuestCount: number,
  reservationIdToExclude?: number,
) {
  const restaurant = await assertRestaurantExists(restaurantId);

  if (!restaurant.seatingCap) {
    throw new HttpError(
      400,
      "Cannot check availability: restaurant seatingCap is not configured.",
    );
  }

  const { start, end } = getUtcDayBounds(date);

  const reservationStats = await prisma.reservation.aggregate({
    where: {
      restaurantId,
      ...(reservationIdToExclude
        ? {
            id: {
              not: reservationIdToExclude,
            },
          }
        : {}),
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
  const totalAfterBooking = alreadyBooked + requestedGuestCount;

  if (totalAfterBooking > restaurant.seatingCap) {
    throw new HttpError(409, "Not enough seats available for this day.", {
      seatingCap: restaurant.seatingCap,
      alreadyBooked,
      requested: requestedGuestCount,
      available: Math.max(restaurant.seatingCap - alreadyBooked, 0),
    });
  }
}

export async function listReservationsForRestaurant(
  restaurantId: number,
  userId: string,
) {
  await assertRestaurantExists(restaurantId);

  return prisma.reservation.findMany({
    where: {
      restaurantId,
      userId,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          seatingCap: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });
}

export async function listFullyBookedDatesForRestaurant(restaurantId: number) {
  const restaurant = await assertRestaurantExists(restaurantId);
  const seatingCap = restaurant.seatingCap;

  if (!seatingCap) {
    return [];
  }

  const reservations = await prisma.reservation.findMany({
    where: { restaurantId },
    select: {
      date: true,
      guestCount: true,
    },
  });

  const totalsByDay = new Map<string, number>();

  for (const reservation of reservations) {
    const dayKey = getUtcDayKey(reservation.date);
    totalsByDay.set(dayKey, (totalsByDay.get(dayKey) ?? 0) + reservation.guestCount);
  }

  return Array.from(totalsByDay.entries())
    .filter(([, total]) => total >= seatingCap)
    .map(([dayKey]) => dayKey)
    .sort();
}

export async function updateReservationForRestaurant(
  restaurantId: number,
  reservationId: number,
  userId: string,
  input: ReservationUpdateInput,
) {
  await assertRestaurantExists(restaurantId);

  const existingReservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      userId: true,
      restaurantId: true,
    },
  });

  if (!existingReservation) {
    throw new HttpError(404, "Reservation not found.");
  }

  if (existingReservation.restaurantId !== restaurantId) {
    throw new HttpError(404, "Reservation not found for this restaurant.");
  }

  if (existingReservation.userId !== userId) {
    throw new HttpError(403, "Insufficient permissions.");
  }

  await assertReservationCapacity(
    restaurantId,
    input.date,
    input.guestCount,
    existingReservation.id,
  );

  return prisma.reservation.update({
    where: { id: existingReservation.id },
    data: {
      date: input.date,
      guestCount: input.guestCount,
    },
  });
}

export async function cancelReservationForRestaurant(
  restaurantId: number,
  reservationId: number,
  userId: string,
) {
  await assertRestaurantExists(restaurantId);

  const existingReservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      userId: true,
      restaurantId: true,
    },
  });

  if (!existingReservation) {
    throw new HttpError(404, "Reservation not found.");
  }

  if (existingReservation.restaurantId !== restaurantId) {
    throw new HttpError(404, "Reservation not found for this restaurant.");
  }

  if (existingReservation.userId !== userId) {
    throw new HttpError(403, "Insufficient permissions.");
  }

  return prisma.reservation.delete({
    where: { id: existingReservation.id },
  });
}
