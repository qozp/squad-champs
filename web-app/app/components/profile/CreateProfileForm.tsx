import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "~/lib/supabase/client";
import CountryStateSelect from "./CountryRegionSelect";
import type { User } from "@supabase/supabase-js";
import { containsBadWords } from "~/lib/moderation";

interface CreateProfileFormProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export default function CreateProfileForm({
  open,
  onClose,
  user,
}: CreateProfileFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nation, setNation] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (containsBadWords(displayName)) {
      alert("Please avoid inappropriate language in Display Name.");
      setLoading(false);
      return;
    }

    if (containsBadWords(firstName) || containsBadWords(lastName)) {
      toast.error("Please avoid inappropriate language in your name fields.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.rpc("create_profile", {
      display_name: displayName,
      first_name: firstName || null,
      last_name: lastName || null,
      nation: nation || null,
      state: state || null,
      user_id: user.id,
    });

    setLoading(false);

    if (error) {
      toast.error("Error creating profile: " + error.message);
    } else {
      toast.success("Profile created!");
      onClose();
      window.location.reload(); // refresh to show new profile
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Your Profile</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {[
            {
              id: "displayName",
              label: "Display Name",
              value: displayName,
              setter: setDisplayName,
              required: true,
            },
            {
              id: "firstName",
              label: "First Name",
              value: firstName,
              setter: setFirstName,
              required: false,
            },
            {
              id: "lastName",
              label: "Last Name",
              value: lastName,
              setter: setLastName,
              required: false,
            },
          ].map(({ id, label, value, setter, required }) => (
            <div key={id} className="flex flex-col gap-1">
              <Label htmlFor={id}>{label}</Label>
              <Input
                id={id}
                value={value}
                onChange={(e) => setter(e.target.value)}
                required={required}
              />
            </div>
          ))}

          <CountryStateSelect
            nation={nation}
            setNation={setNation}
            stateValue={state}
            setState={setState}
          />

          <DialogFooter className="mt-4 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
