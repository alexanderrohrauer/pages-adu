import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChatbotError, type ErrorCode } from "./errors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const { code, cause } = await response.json();
    throw new ChatbotError(code as ErrorCode, cause);
  }

  return response.json();
};

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}
