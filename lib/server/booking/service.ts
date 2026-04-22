import { prisma } from "@/lib/server/prisma";
import { HttpError } from "@/lib/server/http";
import type { Prisma } from "@/app/generated/prisma/client";
import { getRankFromReservationCount } from "@/lib/server/rank/service";
import type {
  BookingCreateInput,
  BookingUpdateInput,
} from "@/lib/server/schemas/booking";

type BookingAccessOptions = {
  isPrivileged?: boolean;
  hotelId?: number;
};

function getNights(checkIn: Date, checkOut: Date): number {
  return Math.max(
    1,
    Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

async function assertHotelExists(hotelId: number) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { id: true },
  });

  if (!hotel) {
    throw new HttpError(404, "Hotel not found.");
  }
}

async function getRoomForHotel(hotelId: number, roomId: number) {
  const hotelRoom = await prisma.hotelRoom.findUnique({
    where: {
      hotelId_roomId: {
        hotelId,
        roomId,
      },
    },
    include: {
      room: {
        select: {
          id: true,
          pricePerNight: true,
          bedCount: true,
          type: true,
        },
      },
    },
  });

  if (!hotelRoom) {
    throw new HttpError(404, "Room not found for this hotel.");
  }

  return hotelRoom;
}

function assertBookingOwnership(
  bookingUserId: string,
  actorUserId: string,
  isPrivileged: boolean,
) {
  if (!isPrivileged && bookingUserId !== actorUserId) {
    throw new HttpError(403, "Insufficient permissions.");
  }
}

async function findBookingOrThrow(
  bookingId: number,
  actorUserId: string,
  options?: BookingAccessOptions,
) {
  const booking = await prisma.hotelReservation.findUnique({
    where: { id: bookingId },
    include: {
      room: {
        select: {
          id: true,
          pricePerNight: true,
          bedCount: true,
          type: true,
        },
      },
      hotel: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!booking) {
    throw new HttpError(404, "Booking not found.");
  }

  if (options?.hotelId && booking.hotelId !== options.hotelId) {
    throw new HttpError(404, "Booking not found for this hotel.");
  }

  assertBookingOwnership(booking.userId, actorUserId, options?.isPrivileged ?? false);

  return booking;
}

function withComputedTotal<T extends { checkIn: Date; checkOut: Date; room: { pricePerNight: number } }>(
  reservation: T,
) {
  const nights = getNights(reservation.checkIn, reservation.checkOut);

  return {
    ...reservation,
    nights,
    estimatedTotal: Number((nights * reservation.room.pricePerNight).toFixed(2)),
  };
}

export async function listBookingsForHotel(hotelId: number) {
  await assertHotelExists(hotelId);

  const reservations = await prisma.hotelReservation.findMany({
    where: { hotelId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      room: true,
      hotel: {
        include: {
          address: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reservations.map((reservation) => withComputedTotal(reservation));
}

export async function listBookingsForUser(userId: string) {
  const reservations = await prisma.hotelReservation.findMany({
    where: { userId },
    include: {
      room: true,
      hotel: {
        include: {
          address: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reservations.map((reservation) => withComputedTotal(reservation));
}

export async function createBooking(
  hotelId: number,
  userId: string,
  input: BookingCreateInput,
) {
  await assertHotelExists(hotelId);

  await getRoomForHotel(hotelId, input.roomId);

  const conflictingReservation = await prisma.hotelReservation.findFirst({
    where: {
      hotelId,
      roomId: input.roomId,
      checkIn: { lt: input.checkOut },
      checkOut: { gt: input.checkIn },
    },
    orderBy: {
      checkIn: "asc",
    },
    select: {
      id: true,
      checkIn: true,
      checkOut: true,
    },
  });

  if (conflictingReservation) {
    throw new HttpError(409, "Room is not available for the selected dates.", {
      conflictingReservation,
    });
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const createdReservation = await tx.hotelReservation.create({
      data: {
        userId,
        hotelId,
        roomId: input.roomId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        breakfast: input.breakfast ?? false,
        lateCheckout: input.lateCheckout ?? false,
      },
      include: {
        room: true,
        hotel: true,
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
      ...withComputedTotal(createdReservation),
      userProgress: {
        reservationCount: rankedUser.reservationCount,
        rank: rankedUser.rank,
      },
    };
  });
}

export async function updateBooking(
  bookingId: number,
  actorUserId: string,
  input: BookingUpdateInput,
  options?: BookingAccessOptions,
) {
  const booking = await findBookingOrThrow(bookingId, actorUserId, options);

  const nextCheckIn = input.checkIn ?? booking.checkIn;
  const nextCheckOut = input.checkOut ?? booking.checkOut;

  if (nextCheckOut <= nextCheckIn) {
    throw new HttpError(400, "checkOut must be after checkIn.");
  }

  const nextRoomId = input.roomId ?? booking.roomId;
  if (nextRoomId !== booking.roomId) {
    await getRoomForHotel(booking.hotelId, nextRoomId);
  }

  const conflictingReservation = await prisma.hotelReservation.findFirst({
    where: {
      id: {
        not: booking.id,
      },
      hotelId: booking.hotelId,
      roomId: nextRoomId,
      checkIn: { lt: nextCheckOut },
      checkOut: { gt: nextCheckIn },
    },
    orderBy: {
      checkIn: "asc",
    },
    select: {
      id: true,
      checkIn: true,
      checkOut: true,
    },
  });

  if (conflictingReservation) {
    throw new HttpError(409, "Room is not available for the selected dates.", {
      conflictingReservation,
    });
  }

  const updatedReservation = await prisma.hotelReservation.update({
    where: { id: booking.id },
    data: {
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      roomId: input.roomId,
      breakfast: input.breakfast,
      lateCheckout: input.lateCheckout,
    },
    include: {
      room: true,
      hotel: true,
    },
  });

  return withComputedTotal(updatedReservation);
}

export async function cancelBooking(
  bookingId: number,
  actorUserId: string,
  options?: BookingAccessOptions,
) {
  const booking = await findBookingOrThrow(bookingId, actorUserId, options);

  const deletedReservation = await prisma.hotelReservation.delete({
    where: { id: booking.id },
    include: {
      room: true,
      hotel: true,
    },
  });

  return withComputedTotal(deletedReservation);
}
