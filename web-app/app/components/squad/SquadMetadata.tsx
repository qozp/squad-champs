import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Pencil } from "lucide-react";
import { sanitizeInput } from "~/lib/moderation";

interface Props {
  squadMeta: any;
  budget: number;
  onEditName: () => void;
}

export default function SquadMetadata({
  squadMeta,
  budget,
  onEditName,
}: Props) {
  if (!squadMeta) return null;

  return (
    <Card className="w-full">
      <CardContent>
        <CardTitle className="mb-3">Squad Overview</CardTitle>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <p>
                <strong>Name:</strong> {sanitizeInput(squadMeta.name)}
              </p>
              <Button
                variant="ghost"
                onClick={onEditName}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil size={16} />
              </Button>
            </div>
          </div>

          <div className="flex justify-between">
            <p>
              <strong>Total Points:</strong> {squadMeta.total_points}
            </p>
            <p>
              <strong>Remaining Budget:</strong> ${budget}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
