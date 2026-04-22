import { DistinctionType } from "@/app/generated/prisma/enums";
import { z } from "zod";

const requiredNonEmptyString = (field: string) =>
    z.string().trim().min(1, `${field} is required and must be a non-empty string.`);

export const createHotelSchema = z.object({
    name: requiredNonEmptyString("name"),
    imageUrl: z.string({ error: "imageUrl must be a string or null." }).trim().nullable().optional(),
    starRating: z
        .number()
        .int("starRating must be an integer.")
        .min(0, "starRating must be between 0 and 5.")
        .max(5, "starRating must be between 0 and 5.")
        .optional(),
    address: z.object({
        street: requiredNonEmptyString("address.street"),
        city: requiredNonEmptyString("address.city"),
        country: requiredNonEmptyString("address.country"),
        postalCode: requiredNonEmptyString("address.postalCode"),
        latitude: z.number({ error: "address.latitude must be a valid number or null." }).nullable().optional(),
        longitude: z.number({ error: "address.longitude must be a valid number or null." }).nullable().optional(),
    }),
});

export type HotelCreateInput = z.infer<typeof createHotelSchema>;

export const updateHotelSchema = z
    .object({
        name: requiredNonEmptyString("name").optional(),
        imageUrl: z.string({ error: "imageUrl must be a string or null." }).trim().nullable().optional(),
        starRating: z
            .number()
            .int("starRating must be an integer.")
            .min(0, "starRating must be between 0 and 5.")
            .max(5, "starRating must be between 0 and 5.")
            .optional(),
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
        message: "At least one field is required to update hotel.",
    });

export type HotelPatchInput = z.infer<typeof updateHotelSchema>;

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