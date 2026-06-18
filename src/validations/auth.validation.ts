import z from "zod";

export const loginSchema = z.object({
  email: z.email({
    error: "Email Field is Required",
  }),
  password: z
    .string({
      error: "Password is Required",
    })
    .min(8, "Password Should be Atleast 8 Characters Long"),
});

export const registerSchema = z.object({
  email: z.email({
    error: "Email field is required",
  }),
  password: z
    .string({
      error: "Password field is required",
    })
    .min(8, "Password should be 8 characters long")
    .max(25, "Password should be no longer than 25 characters"),
  first_name: z
    .string({
      error: "First name is required",
    })
    .max(25, "First name cannot be more than 25 characters"),
  last_name: z
    .string({
      error: "Last name is required",
    })
    .max(50, "Last name cannot be more than 25 characters"),

    address: z.string().max(20, "Address cannot be more than 20 characters").optional(),
    phone: z.string().max(10, "Phone number cannot be more than 10 characters")
});

export const resendOtpSchema = z.object({
  email: z.email({
    error: "Email field is required",
  }),
});

export const verifyOtpSchema = z.object({
  email: z.email({
    error: "Email field is required",
  }),
  otp: z
    .string({
      error: "OTP is required",
    })
    .min(1, "OTP is required"),
});
