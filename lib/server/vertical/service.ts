import { prisma } from "@/lib/server/prisma";

export async function listVerticalRestaurantMedia() {
  return prisma.verticalMedia.findMany({
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          link: true,
          imageUrl: true,
          address: {
            select: {
              street: true,
              city: true,
              postalCode: true,
              country: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
