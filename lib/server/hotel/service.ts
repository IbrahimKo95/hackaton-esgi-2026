import { prisma } from "@/lib/server/prisma";
import { HttpError } from "@/lib/server/http";
import type {
  DistinctionPatchInput,
  HotelCreateInput,
  HotelPatchInput,
} from "@/lib/server/schemas/hotel";

export async function listHotels() {
  return prisma.hotel.findMany({
    include: {
      address: true,
      distinctions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getHotelById(id: number) {
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: {
      address: true,
      distinctions: true,
    },
  });

  if (!hotel) {
    throw new HttpError(404, "Hotel not found.");
  }

  return hotel;
}

export async function createHotel(input: HotelCreateInput) {
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: input.address,
    });

    return tx.hotel.create({
      data: {
        name: input.name,
        imageUrl: input.imageUrl,
        starRating: input.starRating,
        addressId: address.id,
      },
      include: {
        address: true,
        distinctions: true,
      },
    });
  });
}

export async function updateHotel(id: number, patch: HotelPatchInput) {
  const existing = await prisma.hotel.findUnique({
    where: { id },
    select: { id: true, addressId: true },
  });

  if (!existing) {
    throw new HttpError(404, "Hotel not found.");
  }

  return prisma.$transaction(async (tx) => {
    if (patch.address) {
      await tx.address.update({
        where: { id: existing.addressId },
        data: patch.address,
      });
    }

    const { address: ignoredAddress, ...hotelData } = patch;
    void ignoredAddress;

    return tx.hotel.update({
      where: { id },
      data: hotelData,
      include: {
        address: true,
        distinctions: true,
      },
    });
  });
}

export async function upsertDistinction(hotelId: number, input: DistinctionPatchInput) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { id: true },
  });

  if (!hotel) {
    throw new HttpError(404, "Hotel not found.");
  }

  const current = await prisma.distinction.findFirst({
    where: {
      hotelId: hotelId,
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
      hotelId: hotelId,
      year: input.year,
      type: input.type,
    },
  });
}
