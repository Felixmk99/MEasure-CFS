import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().trim().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

export const signupSchema = z.object({
    firstName: z.string().trim().min(1, { message: "First name is required" }),
    lastName: z.string().trim().min(1, { message: "Last name is required" }),
    email: z.string().trim().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    agreeTerms: z.boolean().refine(v => v === true, { message: "You must agree to the terms" }),
    agreeHealth: z.boolean().refine(v => v === true, { message: "You must consent to health data processing" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
