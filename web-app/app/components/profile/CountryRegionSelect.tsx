// components/CountryStateSelect.tsx
import { useState, useEffect } from "react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { allCountries, type Region } from "country-region-data";

interface CountryStateSelectProps {
  nation: string;
  setNation: (nation: string) => void;
  stateValue: string;
  setState: (state: string) => void;
}

const countriesOrdered = [
  ...allCountries.filter((c) => c[0] === "United States"), // US first
  ...allCountries.filter((c) => c[0] !== "United States"), // then the rest
];

export default function CountryStateSelect({
  nation,
  setNation,
  stateValue,
  setState,
}: CountryStateSelectProps) {
  const selectedCountry = countriesOrdered.find((c) => c[0] === nation);
  const regions: Region[] = selectedCountry ? selectedCountry[2] : [];

  // Reset state if nation changes
  useEffect(() => {
    setState("");
  }, [nation]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="nation">Country</Label>
        <Select value={nation} onValueChange={setNation}>
          <SelectTrigger id="nation">
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {countriesOrdered.map((c) => (
              <SelectItem key={c[1]} value={c[0]}>
                {c[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {regions.length > 0 && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="state">Region/State</Label>
          <Select value={stateValue} onValueChange={setState}>
            <SelectTrigger id="state">
              <SelectValue placeholder="Select a state/region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => {
                const regionName = r[0]; // Full name
                const regionSlug = r[1];
                const regionDisplay =
                  regionName === regionSlug
                    ? regionName
                    : `${regionSlug}, ${regionName}`;
                return (
                  <SelectItem key={r[1]} value={r[0]}>
                    {regionDisplay}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
