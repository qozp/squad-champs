// components/squad/PlayerCard.tsx
import { cn } from "~/lib/utils";

interface PlayerCardProps {
  name: string;
  pos: string;
  price?: number;
  captain?: boolean;
  vice?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function PlayerCard({
  name,
  pos,
  price,
  captain,
  vice,
  onClick,
  className,
}: PlayerCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "border rounded-lg p-2 bg-card hover:bg-accent cursor-pointer select-none",
        className
      )}
    >
      <div className="font-semibold text-sm">{name}</div>
      <div className="text-xs text-muted-foreground">{pos}</div>

      {captain && (
        <div className="text-xs font-bold text-blue-600">Captain</div>
      )}
      {vice && <div className="text-xs font-bold text-purple-600">Vice</div>}
      {price && <div className="text-xs text-muted-foreground">${price}</div>}
    </div>
  );
}
