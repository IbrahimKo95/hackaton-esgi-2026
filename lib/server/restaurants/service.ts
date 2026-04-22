import { prisma } from "@/lib/server/prisma";
import { HttpError } from "@/lib/server/http";
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
        cuisineType: input.cuisineType,
        schedule: input.schedule,
        seatingCap: input.seatingCap,
        imageUrl: input.imageUrl,
        ambiance: input.ambiance,
        chefId: input.chefId,
        addressId: address.id,
      },
      include: {
        address: true,
        distinctions: true,
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

    const { address: ignoredAddress, ...restaurantData } = patch;
    void ignoredAddress;

    return tx.restaurant.update({
      where: { id },
      data: restaurantData,
      include: {
        address: true,
        distinctions: true,
      },
    });
  });
}

export async function upsertDistinction(restaurantId: number, input: DistinctionPatchInput) {
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
      data: { type: input.type },
    });
  }

  return prisma.distinction.create({
    data: {
      restaurantId,
      year: input.year,
      type: input.type,
    },
  });
}
