// components/squad/LineupEditor/SaveLineupButton.tsx
import { Button } from "~/components/ui/button";

interface SaveLineupButtonProps {
  onSave: () => void;
}

export default function SaveLineupButton({ onSave }: SaveLineupButtonProps) {
  return (
    <div className="mt-4">
      <Button onClick={onSave} className="w-full">
        Save Lineup
      </Button>
    </div>
  );
}
