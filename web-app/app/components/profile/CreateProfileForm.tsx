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
import { createClient } from "~/lib/supabase/client";
import CountryStateSelect from "./CountryRegionSelect";
import { containsBadWords } from "~/lib/moderation";

interface CreateProfileFormProps {
  open: boolean;
  onClose: () => void;
  profileData?: {
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
  const supabase = createClient();

  const [nation, setNation] = useState(profileData.nation ?? "");
  const [state, setState] = useState(profileData.state ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const displayNameRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const displayName = displayNameRef.current?.value ?? "";
    const firstName = firstNameRef.current?.value ?? "";
    const lastName = lastNameRef.current?.value ?? "";

    const newErrors: Record<string, string> = {};

    if (containsBadWords(displayName)) {
      newErrors.displayName =
        "Inappropriate language detected in Display Name.";
    } else if (displayName.length > 20) {
      newErrors.displayName = "Display Name must be 20 characters or fewer.";
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

    const rpcName = profileData.display_name
      ? "update_profile"
      : "create_profile";

    const { error } = await supabase.rpc(rpcName, {
      display_name: displayName,
      first_name: firstName || null,
      last_name: lastName || null,
      nation: nation || null,
      state: state || null,
    });

    setLoading(false);

    if (error) {
      setErrors({ form: "Error saving profile: " + error.message });
    } else {
      onClose();
      window.location.reload(); // TODO: Replace with better revalidation later
    }
  };

  const inputFields = [
    {
      id: "displayName",
      label: "Display Name",
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
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
