// app/components/help/RulesAccordion.tsx

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

export default function RulesAccordion() {
  return (
    <Card>
      <CardContent>
        <CardTitle>Game Rules</CardTitle>

        <Accordion type="multiple" className="space-y-4">
          {/* Initial Squad */}
          <AccordionItem value="initial-squad">
            <AccordionTrigger>Selecting Your Initial Squad</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3">
              <p>
                To create an initial squad, you must select a fantasy basketball
                squad of <strong>13 NBA players</strong>.
              </p>

              <ul className="list-disc pl-5 space-y-1">
                <li>5 Guards</li>
                <li>5 Forwards</li>
                <li>3 Centers</li>
              </ul>

              <p className="mt-2">
                Total budget may not exceed <strong>$100</strong>, coming out to
                an average of ~$7.7 per player.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Starting Lineup */}
          <AccordionItem value="weekly-lineup">
            <AccordionTrigger>Weekly Line-ups</AccordionTrigger>
            <AccordionContent className="text-sm space-y-3 text-muted-foreground">
              <p>
                Before each Gameweek starts you must choose a starting lineup of{" "}
                <strong>10 active players</strong>. Your lineup must include at
                least one of each position.
              </p>

              <p>
                You will also choose a captain whose points will be doubled, and
                a vice-captain (backup if captain doesn’t play). If a player is
                injured or doesn't play, they will be subbed by the first
                available player from the bench.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Transfers */}
          <AccordionItem value="trades">
            <AccordionTrigger>Trades</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3">
              <p>
                After your initial squad selection, you may buy/sell players
                each Gameweek.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Unlimited transfers before the first deadline</li>
                <li>1 free transfer per Gameweek afterward</li>
                <li>Each extra transfer costs -20 points</li>
                <li>Unused free transfers can be saved each week (max 5)</li>
              </ul>

              <p className="font-semibold">Player Prices</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Once the season starts, prices may rise/fall based on
                  performance/popularity
                </li>
                <li>
                  Sale prices includes a 50% sell-on fee for profit (rounded
                  down). For example, if you buy Jokic for $13.0 and his price
                  rises to $13.5, your sale price will be $13.2
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Deadlines */}
          <AccordionItem value="gameweeks">
            <AccordionTrigger>Gameweeks</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Gameweeks start each Monday and end on Sunday. After the
                Gameweek starts each Monday, your existing line-up will be
                locked, and any actions made afterwards will take effect in the
                following week.
              </p>

              <ul className="list-disc pl-5 space-y-1">
                <li>No transfers after deadline</li>
                <li>Lineup locks</li>
                <li>Automatic subs processed after all games finish</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
