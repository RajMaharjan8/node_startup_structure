import z from "zod";

export const loginSchema = z.object({
    email: z.email({
        error: "Email Field is Required"
    }),
    password: z.string({
        error: "Password is Required"
    }).min(8, "Password Should be Atleast 8 Characters Long")
});
