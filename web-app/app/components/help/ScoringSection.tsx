import { Fragment } from "react/jsx-runtime";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

export const scoringRules = [
  { label: "Points", value: "+1" },
  { label: "Rebounds", value: "+1.2" },
  { label: "Assists", value: "+1.5" },
  { label: "Steals", value: "+3" },
  { label: "Blocks", value: "+3" },
  { label: "Turnovers", value: "-2", negative: true },
  { label: "Field goals made (FGM)", value: "+1" },
  { label: "Field goals attempted (FGA)", value: "-0.5", negative: true },
  { label: "Free throws made (FTM)", value: "+1" },
  { label: "Free throws attempted (FTA)", value: "-0.75", negative: true },
  { label: "Three-pointers made (3PM)", value: "+1" },
];

export default function ScoringSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-4">
        <p>
          Players earn fantasy points based on their real NBA performance using
          a stat-weighted scoring system. A player's final weekly score is an
          average of their games that week.
        </p>

        <div className="rounded-lg border bg-muted/40 p-4">
          <h3 className="font-semibold mb-2">Per-Stat Scoring</h3>

          <div className="grid grid-cols-2 gap-y-1 text-sm">
            {scoringRules.map((rule) => (
              <Fragment key={rule.label}>
                <span>{rule.label}</span>
                <span
                  className={`text-right ${
                    rule.negative ? "text-red-500" : ""
                  }`}
                >
                  {rule.value}
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
