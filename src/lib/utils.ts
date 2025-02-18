import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractTextFromNode = (node: any): string => {
  if (node.type === "text") return node.value;
  if (node.children && Array.isArray(node.children))
    return node.children.map(extractTextFromNode).join("");
  return "";
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error == 'string') return error;

  if (error && typeof error == 'object' && ('message' in error)) return String(error.message);

  return 'Something unexpected happend, while performing this action';
}

export function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(args), wait);
  };
}