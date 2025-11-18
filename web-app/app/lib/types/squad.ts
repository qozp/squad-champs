export type PlayerBasic = {
    id: number;
    first_name: string;
    last_name: string;
    position: "Guard" | "Forward" | "Center";
    price: number;
};

export type SquadPlayerDisplay = PlayerBasic & {
    is_starting?: boolean;
    is_captain?: boolean;
    is_vice_captain?: boolean;
    bench_order?: number | null;
    team_name?: string;
};