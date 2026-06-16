import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string({ error: "Name Field is Required" })
    .min(3, "Name must be atleast 3 character")
    .max(5, "Name Cannot be more than 5 Characters"),
  email: z.email({ error: "Please Enter a Valid Email" }),
  password: z
    .string({ error: "Password is Required" })
    .min(8, "Password Should be Atleat 8 Characters Long!"),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be atleast 3 character")
    .max(5, "Name Cannot be more than 5 Characters")
    .optional(),
  email: z.email().optional(),
});
