import { Filter } from "bad-words";

// Initialize filter
const filter = new Filter();

/**
 * Checks if the input contains any bad words
 */
export function containsBadWords(input: string): boolean {
    return filter.isProfane(input);
}

/**
 * Sanitizes input by replacing bad words with ****
 */
export function sanitizeInput(input: string): string {
    return filter.clean(input);
}
