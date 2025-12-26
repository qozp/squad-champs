export type PlayerBasic = {
    player_id: number;
    first_name: string;
    last_name: string;
    pos: "Guard" | "Forward" | "Center";
    current_price: number;
};

export type SquadPlayer = PlayerBasic & {
    player_id: number;
    is_starting?: boolean;
    is_captain?: boolean;
    is_vice_captain?: boolean;
    bench_order?: number | null;
    team_abbreviation?: string;
    purchase_price?: number;
};

export type SquadMode = "create" | "edit";

export interface SquadHistoryWeek {
    gameweek: number;
    gameweek_points: number;
    rank: number;
    trades_made: number;
    trade_penalty: number;
}

export interface SquadHistoryPlayer {
    player_id: number;
    first_name: string;
    last_name: string;
    pos: string;
    team_abbreviation: string;
    is_starting: boolean;
    bench_order: number | null;
    is_captain: boolean;
    is_vice_captain: boolean;
    total_score: number;
}