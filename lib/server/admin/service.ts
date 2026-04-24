import { prisma } from "@/lib/server/prisma";
import { HttpError } from "@/lib/server/http";

export async function getAdminStats() {
  const [restaurantCount, hotelCount, userCount, reservationCount] = await Promise.all([
    prisma.restaurant.count(),
    prisma.hotel.count(),
    prisma.user.count(),
    prisma.reservation.count(),
  ]);

  return {
    restaurantCount,
    hotelCount,
    userCount,
    reservationCount,
  };
}

export async function listAllReservations(filters?: {
  restaurantId?: number;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const where: {
    restaurantId?: number;
    userId?: string;
    date?: { gte?: Date; lte?: Date };
  } = {};

  if (filters?.restaurantId) {
    where.restaurantId = filters.restaurantId;
  }

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) {
      where.date.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.date.lte = new Date(filters.dateTo);
    }
  }

  return prisma.reservation.findMany({
    where,
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
}

export async function deleteRestaurant(id: number) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found.");
  }

  return prisma.restaurant.delete({
    where: { id },
  });
}

export async function deleteHotel(id: number) {
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!hotel) {
    throw new HttpError(404, "Hotel not found.");
  }

  return prisma.hotel.delete({
    where: { id },
  });
}

export async function listUsers() {
  return prisma.user.findMany({
    include: {
      role: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateUserRole(userId: string, roleId: number | null) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { roleId },
  });
}

export async function deactivateUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      reservationCount: 0,
      rank: "BRONZE",
    },
  });
}

export async function listRoles() {
  return prisma.role.findMany();
}