import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";

// Auto-generate price options from 13 → 4 in 0.5 steps
const MAX_PRICE_OPTIONS = [
  { label: "Any Price", value: "Any" },
  ...Array.from({ length: (13 - 4) / 0.5 + 1 }, (_, i) => {
    const price = +(13 - i * 0.5).toFixed(1);
    return {
      label: `≤ $${price}`,
      value: price.toString(),
    };
  }),
];

export default function PriceFilter({
  value,
  onChange,
}: {
  value: string; // "Any" or the number as string (e.g. "10.5")
  onChange: (val: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id="price-filter">
        <SelectValue placeholder="Max Price" />
      </SelectTrigger>
      <SelectContent>
        {MAX_PRICE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
