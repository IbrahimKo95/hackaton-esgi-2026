import { DistinctionType } from "@/app/generated/prisma/enums";
import { z } from "zod";

const requiredNonEmptyString = (field: string) =>
  z.string().trim().min(1, `${field} is required and must be a non-empty string.`);

export const createRestaurantSchema = z.object({
  name: requiredNonEmptyString("name"),
  link: z.string({ error: "link must be a string or null." }).trim().nullable().optional(),
  menu: z.string({ error: "menu must be a string or null." }).trim().nullable().optional(),
  priceRange: z.number().int("priceRange must be an integer >= 1.").min(1, "priceRange must be an integer >= 1."),
  cuisineType: requiredNonEmptyString("cuisineType"),
  schedule: z.string({ error: "schedule must be a string or null." }).trim().nullable().optional(),
  seatingCap: z
    .number({ error: "seatingCap must be an integer or null." })
    .int("seatingCap must be an integer or null.")
    .nullable()
    .optional()
    .refine((value) => value === undefined || value === null || value > 0, {
      message: "seatingCap must be > 0 when provided.",
    }),
  imageUrl: z.string({ error: "imageUrl must be a string or null." }).trim().nullable().optional(),
  ambiance: z.string({ error: "ambiance must be a string or null." }).trim().nullable().optional(),
  chefId: z.number({ error: "chefId must be an integer or null." }).int("chefId must be an integer or null.").nullable().optional(),
  address: z.object({
    street: requiredNonEmptyString("address.street"),
    city: requiredNonEmptyString("address.city"),
    country: requiredNonEmptyString("address.country"),
    postalCode: requiredNonEmptyString("address.postalCode"),
    latitude: z.number({ error: "address.latitude must be a valid number or null." }).nullable().optional(),
    longitude: z.number({ error: "address.longitude must be a valid number or null." }).nullable().optional(),
  }),
});

export type RestaurantCreateInput = z.infer<typeof createRestaurantSchema>;

export const updateRestaurantSchema = z
  .object({
    name: requiredNonEmptyString("name").optional(),
    link: z.string({ error: "link must be a string or null." }).trim().nullable().optional(),
    menu: z.string({ error: "menu must be a string or null." }).trim().nullable().optional(),
    priceRange: z
      .number()
      .int("priceRange must be an integer >= 1.")
      .min(1, "priceRange must be an integer >= 1.")
      .optional(),
    cuisineType: requiredNonEmptyString("cuisineType").optional(),
    schedule: z.string({ error: "schedule must be a string or null." }).trim().nullable().optional(),
    seatingCap: z
      .number({ error: "seatingCap must be an integer or null." })
      .int("seatingCap must be an integer or null.")
      .nullable()
      .optional()
      .refine((value) => value === undefined || value === null || value > 0, {
        message: "seatingCap must be > 0 when provided.",
      }),
    imageUrl: z.string({ error: "imageUrl must be a string or null." }).trim().nullable().optional(),
    ambiance: z.string({ error: "ambiance must be a string or null." }).trim().nullable().optional(),
    chefId: z.number({ error: "chefId must be an integer or null." }).int("chefId must be an integer or null.").nullable().optional(),
    address: z
      .object({
        street: requiredNonEmptyString("address.street").optional(),
        city: requiredNonEmptyString("address.city").optional(),
        country: requiredNonEmptyString("address.country").optional(),
        postalCode: requiredNonEmptyString("address.postalCode").optional(),
        latitude: z.number({ error: "address.latitude must be a valid number or null." }).nullable().optional(),
        longitude: z.number({ error: "address.longitude must be a valid number or null." }).nullable().optional(),
      })
      .refine((address) => Object.keys(address).length > 0, {
        message: "address must contain at least one field to update.",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update restaurant.",
  });

export type RestaurantPatchInput = z.infer<typeof updateRestaurantSchema>;

export const distinctionPatchSchema = z.object({
  type: z.nativeEnum(DistinctionType, {
    message: `type must be one of: ${Object.values(DistinctionType).join(", ")}.`,
  }),
  year: z
    .number()
    .int("year must be an integer.")
    .min(1900, "year must be between 1900 and 3000.")
    .max(3000, "year must be between 1900 and 3000."),
});

export type DistinctionPatchInput = z.infer<typeof distinctionPatchSchema>;
