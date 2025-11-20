import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
import { supabaseBrowser } from "~/lib/supabase/client";
import { DialogDescription } from "@radix-ui/react-dialog";
import { containsBadWords } from "~/lib/moderation";

interface SquadNameFormProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  squadName?: string | null; // current squad name
}

export default function SquadNameForm({
  open,
  onClose,
  userId,
  squadName,
}: SquadNameFormProps) {
  const squadNameRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (squadNameRef.current && squadName) {
      squadNameRef.current.value = squadName;
    }
  }, [squadName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const squadName = squadNameRef.current?.value.trim();
    if (!squadName) {
      setError("Squad name is required.");
      setLoading(false);
      return;
    } else if (containsBadWords(squadName)) {
      setError("Inappropriate language detected in Squad Name.");
      setLoading(false);
      return;
    } else if (squadName.length > 20) {
      setError("Squad Name must be 20 characters or fewer.");
      setLoading(false);
      return;
    }

    const { error } = await supabaseBrowser.rpc("create_or_update_squad", {
      name: squadName,
    });

    setLoading(false);

    if (error) {
      setError("Error creating squad: " + error.message);
    } else {
      onClose();
      window.location.reload(); // or revalidate the loader
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {squadName ? "Update" : "Create"} Your Squad Name
          </DialogTitle>
          <DialogDescription>
            {squadName
              ? ""
              : "Don't worry, you will be able to change this later."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="squadName">Squad Name</Label>
            <Input id="squadName" ref={squadNameRef} required />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>

          <DialogFooter className="mt-4 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : squadName
                  ? "Update Squad"
                  : "Create Squad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
