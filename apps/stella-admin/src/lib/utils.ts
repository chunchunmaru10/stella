import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError, typeToFlattenedError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatZodError(
  e: typeToFlattenedError<any, string> | null | undefined,
) {
  if (!e?.fieldErrors) return "";
  return (Object.values(e?.fieldErrors) as string[][])[0][0];
}
