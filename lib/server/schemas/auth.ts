import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("email must be a valid email address.").trim().min(1, "email cannot be empty."),
  password: z
    .string({ error: "password is required and must be a string." })
    .min(8, "password must be at least 8 characters long."),
  firstName: z.string({ error: "firstName must be a string." }).trim().min(1, "firstName cannot be empty."),
  lastName: z.string({ error: "lastName must be a string." }).trim().min(1, "lastName cannot be empty."),
  phone: z.string({ error: "phone must be a string." }).trim().min(1, "phone cannot be empty.").optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
