import { clsx, type ClassValue } from "clsx";
import { formatDistance, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// utils.ts
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T & { cancel: () => void; flush: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: any[] | null = null;

  const debounced = (...args: any[]) => {
    lastArgs = args; // Store the latest arguments
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      lastArgs = null; // Clear args after execution
      func(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
      lastArgs = null; // Clear args on cancel
    }
  };

  debounced.flush = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
      if (lastArgs !== null) {
        func(...lastArgs); // Call with the last arguments
        lastArgs = null; // Clear args after flush
      }
    }
  };

  return debounced as T & { cancel: () => void; flush: () => void };
}

// Utility function to throttle events (unchanged)
export function throttle(func: Function, delay: number) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
}

// You can use your own date formatting logic or a library like date-fns
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function formatTimeAgo(timestamp: string) {
  try {
    // Parse the ISO timestamp string to a Date object
    const parsedDate = parseISO(timestamp);

    // Compare with current time and return human-readable distance
    return formatDistance(parsedDate, new Date(), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid timestamp";
  }
}

export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

export const safeJSONParse = <T>(value: string | T): T => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return {} as T;
    }
  }
  return value as T;
};


/**
 * Validates if a date string can be parsed into a valid Date
 */
export function isValidDateString(dateString: string | undefined | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Formats a date string as a time (HH:MM)
 */
export function formatMessageTime(dateString: string | undefined | null): string {
  if (!isValidDateString(dateString)) return "";

  const date = new Date(dateString!);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a date string as a relative time (today, yesterday, or date)
 */
export function formatRelativeTime(dateString: string | undefined | null): string {
  if (!isValidDateString(dateString)) return "Unknown";

  const date = new Date(dateString!);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

/**
 * Ensures a date is in ISO format
 */
export function ensureISOString(date: Date | string | undefined | null): string {
  if (!date) return new Date().toISOString();

  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString();
  }

  return date.toISOString();
}
