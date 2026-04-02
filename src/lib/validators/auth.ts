import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Le pseudo doit faire au moins 3 caractères")
    .max(30, "Le pseudo ne peut pas dépasser 30 caractères")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores"
    ),
  email: z.email("Adresse email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit faire au moins 6 caractères")
    .max(72, "Le mot de passe ne peut pas dépasser 72 caractères"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
