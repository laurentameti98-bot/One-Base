import { useState, useEffect, useRef } from 'react';

/**
 * Hook for debouncing search input
 * @param searchQuery - The current search query value
 * @param delay - Debounce delay in milliseconds (default: 300)
 * @param onDebounce - Optional callback called when debounced value changes
 * @returns The debounced search query value
 */
export function useDebouncedSearch(
  searchQuery: string,
  delay: number = 300,
  onDebounce?: (debouncedValue: string) => void
): string {
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDebounceRef = useRef(onDebounce);

  // Update ref when callback changes
  useEffect(() => {
    onDebounceRef.current = onDebounce;
  }, [onDebounce]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (onDebounceRef.current) {
        onDebounceRef.current(searchQuery);
      }
    }, delay);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, delay]); // Remove onDebounce from deps

  return debouncedSearchQuery;
}
