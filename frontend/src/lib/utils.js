import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 👇 AJOUTE ÇA
export const API_URL =
  import.meta.env.VITE_API_URL || "https://playryvenox.onrender.com";