export type PlayerBasic = {
    id: number;
    first_name: string;
    last_name: string;
    pos: "Guard" | "Forward" | "Center";
    price: number;
};

export type SquadPlayer = PlayerBasic & {
    player_id?: number;
    is_starting?: boolean;
    is_captain?: boolean;
    is_vice_captain?: boolean;
    bench_order?: number | null;
    team_abbreviation?: string;
    purchase_price?: number;
};

export type SquadMode = "create" | "edit";