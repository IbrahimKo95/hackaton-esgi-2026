import { prisma } from "@/lib/server/prisma";
import { HttpError } from "@/lib/server/http";
import { DistinctionType } from "@/app/generated/prisma/enums";
import type {
  DistinctionPatchInput,
  RestaurantCreateInput,
  RestaurantPatchInput,
} from "@/lib/server/schemas/restaurants";

export async function listRestaurants() {
  return prisma.restaurant.findMany({
    include: {
      address: true,
      distinctions: true,
      ambiances: {
        include: {
          ambianceRestaurant: true,
        },
      },
      typesCuisine: {
        include: {
          typeCuisine: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRestaurantById(id: number) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      address: true,
      distinctions: true,
      ambiances: {
        include: {
          ambianceRestaurant: true,
        },
      },
      typesCuisine: {
        include: {
          typeCuisine: true,
        },
      },
    },
  });

  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found.");
  }

  return restaurant;
}

export async function createRestaurant(input: RestaurantCreateInput) {
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: input.address,
    });

    return tx.restaurant.create({
      data: {
        name: input.name,
        link: input.link,
        menu: input.menu,
        priceRange: input.priceRange,
        schedule: input.schedule,
        seatingCap: input.seatingCap,
        imageUrl: input.imageUrl,
        chefId: input.chefId,
        addressId: address.id,
        ambiances: input.ambiances
          ? {
              create: input.ambiances.map((ambianceRestaurantId) => ({ ambianceRestaurantId })),
            }
          : undefined,
        typesCuisine: input.typesCuisine
          ? {
              create: input.typesCuisine.map((typeCuisineId) => ({ typeCuisineId })),
            }
          : undefined,
      },
      include: {
        address: true,
        distinctions: true,
        ambiances: {
          include: {
            ambianceRestaurant: true,
          },
        },
        typesCuisine: {
          include: {
            typeCuisine: true,
          },
        },
      },
    });
  });
}

export async function updateRestaurant(id: number, patch: RestaurantPatchInput) {
  const existing = await prisma.restaurant.findUnique({
    where: { id },
    select: { id: true, addressId: true },
  });

  if (!existing) {
    throw new HttpError(404, "Restaurant not found.");
  }

  return prisma.$transaction(async (tx) => {
    if (patch.address) {
      await tx.address.update({
        where: { id: existing.addressId },
        data: patch.address,
      });
    }

    const {
      address: ignoredAddress,
      ambiances,
      typesCuisine,
      ...restaurantData
    } = patch;
    void ignoredAddress;

    if (ambiances) {
      await tx.restaurantAmbiance.deleteMany({
        where: { restaurantId: id },
      });

      if (ambiances.length > 0) {
        await tx.restaurantAmbiance.createMany({
          data: ambiances.map((ambianceRestaurantId) => ({
            restaurantId: id,
            ambianceRestaurantId,
          })),
        });
      }
    }

    if (typesCuisine) {
      await tx.restaurantTypeCuisine.deleteMany({
        where: { restaurantId: id },
      });

      if (typesCuisine.length > 0) {
        await tx.restaurantTypeCuisine.createMany({
          data: typesCuisine.map((typeCuisineId) => ({
            restaurantId: id,
            typeCuisineId,
          })),
        });
      }
    }

    return tx.restaurant.update({
      where: { id },
      data: restaurantData,
      include: {
        address: true,
        distinctions: true,
        ambiances: {
          include: {
            ambianceRestaurant: true,
          },
        },
        typesCuisine: {
          include: {
            typeCuisine: true,
          },
        },
      },
    });
  });
}

export async function upsertDistinction(restaurantId: number, input: DistinctionPatchInput) {
  const type = input.type as (typeof DistinctionType)[keyof typeof DistinctionType];

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true },
  });

  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found.");
  }

  const current = await prisma.distinction.findFirst({
    where: {
      restaurantId,
      year: input.year,
    },
    orderBy: {
      id: "asc",
    },
  });

  if (current) {
    return prisma.distinction.update({
      where: { id: current.id },
      data: { type },
    });
  }

  return prisma.distinction.create({
    data: {
      restaurantId,
      year: input.year,
      type,
    },
  });
}
