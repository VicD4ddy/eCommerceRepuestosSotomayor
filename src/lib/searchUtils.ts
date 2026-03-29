/**
 * Smart Search Utilities
 * - Client-side accent normalization
 * - Recent searches (localStorage)
 * - Debounce helper
 */

const RECENT_SEARCHES_KEY = "sotomayor_recent_searches";
const MAX_RECENT = 5;

/**
 * Strip accents from a string for client-side normalization fallback
 */
export function stripAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save a search term to recent searches
 */
export function saveRecentSearch(term: string): void {
  if (typeof window === "undefined" || !term.trim()) return;
  try {
    const current = getRecentSearches();
    const filtered = current.filter(
      (s) => s.toLowerCase() !== term.trim().toLowerCase()
    );
    filtered.unshift(term.trim());
    const capped = filtered.slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(capped));
  } catch {
    // silently ignore quota errors
  }
}

/**
 * Clear all recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
