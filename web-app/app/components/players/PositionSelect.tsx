import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { useState } from "react";

const positions = ["All Positions", "Guard", "Forward", "Center"];

export default function PositionFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id="position">
        <SelectValue placeholder="Select position" />
      </SelectTrigger>
      <SelectContent>
        {positions.map((pos) => (
          <SelectItem key={pos} value={pos}>
            {pos}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
