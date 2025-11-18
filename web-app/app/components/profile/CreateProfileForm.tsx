import { useRef, useState } from "react";
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
import CountryStateSelect from "./CountryRegionSelect";
import { containsBadWords, sanitizeInput } from "~/lib/moderation";
import { DialogDescription } from "@radix-ui/react-dialog";

interface CreateProfileFormProps {
  open: boolean;
  onClose: () => void;
  profileData?: {
    squad_name?: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
    nation?: string;
    state?: string;
  };
}

export default function CreateProfileForm({
  open,
  onClose,
  profileData = {},
}: CreateProfileFormProps) {
  const [nation, setNation] = useState(profileData.nation ?? "");
  const [state, setState] = useState(profileData.state ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const displayNameRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const squadNameRef = useRef<HTMLInputElement>(null);

  const isUpdate = !!profileData.display_name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const displayName = displayNameRef.current?.value ?? "";
    const firstName = firstNameRef.current?.value ?? "";
    const lastName = lastNameRef.current?.value ?? "";
    const squadName = squadNameRef.current?.value ?? "";

    const newErrors: Record<string, string> = {};

    if (containsBadWords(displayName)) {
      newErrors.displayName =
        "Inappropriate language detected in Display Name.";
    } else if (displayName.length > 20) {
      newErrors.displayName = "Display Name must be 20 characters or fewer.";
    }

    // Squad Name validation — only when creating
    if (!isUpdate) {
      if (!squadName.trim()) {
        newErrors.squadName = "Squad name is required.";
      } else if (containsBadWords(squadName)) {
        newErrors.squadName = "Inappropriate language detected in Squad Name.";
      } else if (squadName.length > 20) {
        newErrors.squadName = "Squad Name must be 20 characters or fewer.";
      }
    }

    if (containsBadWords(firstName)) {
      newErrors.firstName = "Inappropriate language detected in First Name.";
    } else if (firstName.length > 255) {
      newErrors.firstName = "First Name must be 255 characters or fewer.";
    }

    if (containsBadWords(lastName)) {
      newErrors.lastName = "Inappropriate language detected in Last Name.";
    } else if (lastName.length > 255) {
      newErrors.lastName = "Last Name must be 255 characters or fewer.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    if (isUpdate) {
      const { error } = await supabaseBrowser.rpc("update_profile", {
        display_name: displayName,
        first_name: firstName || null,
        last_name: lastName || null,
        nation: nation || null,
        state: state || null,
      });

      setLoading(false);
      if (error) setErrors({ form: error.message });
      else {
        onClose();
        window.location.reload();
      }
      return;
    }

    const { error: profileError } = await supabaseBrowser.rpc(
      "create_profile",
      {
        display_name: displayName,
        first_name: firstName || null,
        last_name: lastName || null,
        nation: nation || null,
        state: state || null,
      }
    );

    if (profileError) {
      setLoading(false);
      setErrors({ form: "Error creating profile: " + profileError.message });
      return;
    }

    const { error: squadError } = await supabaseBrowser.rpc(
      "create_or_update_squad",
      { name: squadName }
    );

    setLoading(false);

    if (squadError) {
      setErrors({ form: "Error creating squad: " + squadError.message });
    } else {
      onClose();
      window.location.reload();
    }
  };

  const inputFields = [
    {
      id: "displayName",
      label: "Display Name (Required)",
      ref: displayNameRef,
      required: true,
      defaultValue: profileData.display_name ?? "",
    },
    {
      id: "firstName",
      label: "First Name",
      ref: firstNameRef,
      required: false,
      defaultValue: profileData.first_name ?? "",
    },
    {
      id: "lastName",
      label: "Last Name",
      ref: lastNameRef,
      required: false,
      defaultValue: profileData.last_name ?? "",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {profileData.display_name ? "Update" : "Create"} Your Profile
          </DialogTitle>
          <DialogDescription>
            This information may be displayed elsewhere.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!isUpdate && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="squadName">Squad Name (Required)</Label>
              <Input
                id="squadName"
                defaultValue={profileData.squad_name ?? ""}
                ref={squadNameRef}
                required
              />
              {errors.squadName && (
                <p className="text-sm text-destructive">{errors.squadName}</p>
              )}
            </div>
          )}
          {inputFields.map(({ id, label, ref, required, defaultValue }) => (
            <div key={id} className="flex flex-col gap-1">
              <Label htmlFor={id}>{label}</Label>
              <Input
                id={id}
                defaultValue={defaultValue}
                ref={ref}
                required={required}
                aria-invalid={!!errors[id]}
                aria-describedby={errors[id] ? `${id}-error` : undefined}
              />
              {errors[id] && (
                <p className="text-sm text-destructive mt-1">{errors[id]}</p>
              )}
            </div>
          ))}

          <CountryStateSelect
            nation={nation}
            setNation={setNation}
            stateValue={state}
            setState={setState}
          />

          {errors.form && (
            <p className="text-sm text-destructive text-center mt-2">
              {errors.form}
            </p>
          )}

          <DialogFooter className="mt-4 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : profileData.display_name
                  ? "Update Profile"
                  : "Create Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
