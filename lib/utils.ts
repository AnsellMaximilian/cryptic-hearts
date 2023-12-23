import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function collapseDid(did: string, length?: number) {
  return `${did.slice(0, length ?? 5)}...${did.slice(-(length ?? 5))}`;
}
