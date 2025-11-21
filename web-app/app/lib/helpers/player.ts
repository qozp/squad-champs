export function shortPos(pos: string) {
    if (!pos) return "";
    const map: Record<string, string> = {
        Guard: "G",
        Forward: "F",
        Center: "C",
    };
    return map[pos] ?? pos.charAt(0);
};

export function formatName(first: string, last: string) {
    const full = `${first} ${last}`;
    if (full.length <= 16) return full;
    return `${first.charAt(0)}. ${last}`;
};