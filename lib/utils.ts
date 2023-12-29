import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function collapseDid(did: string, length?: number) {
  return `${did.slice(0, length ?? 5)}...${did.slice(-(length ?? 5))}`;
}

export const copyToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (err) {
    return false;
  }
};

export function calculateAge(currentDate: Date, birthdate: Date) {
  const ageInMillis = currentDate.getTime() - birthdate.getTime();

  const ageInYears = Math.abs(new Date(ageInMillis).getUTCFullYear() - 1970);

  return ageInYears;
}

export function camelCaseToSeparatedWords(camelCaseString: string) {
  return camelCaseString
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
