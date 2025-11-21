import type { SquadPlayer } from "../types/squad";

export function getSalePrice(player: SquadPlayer): number {
    const current = player.current_price;
    const purchase = player.purchase_price ?? player.current_price;

    // Case 1: current price dropped -> sell at current price
    if (current < purchase) {
        return current;
    }

    // Case 2: price increased -> purchase + half the gain
    const gain = current - purchase;
    const bonus = Math.floor(0.5 * gain);

    return purchase + bonus;
}