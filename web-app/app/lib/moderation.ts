import { Filter } from "bad-words";

// Initialize filter
const filter = new Filter();

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    if (!input) return input;

    let sanitized = input;

    filter.list.forEach((badWord) => {
        const re = new RegExp(escapeRegExp(badWord), "gi");
        sanitized = sanitized.replace(re, "****");
    });

    return sanitized;
}
