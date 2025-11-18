import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

export default function FAQSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>FAQs</CardTitle>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="who">
            <AccordionTrigger>Who is Squad Champs?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Squad Champs is created by a solo developer who is looking for a
              job.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="what">
            <AccordionTrigger>What is Squad Champs?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Squad Champs is a weekly, budget-based, fantasy basketball game
              where you build a 13-player roster and score points from real NBA
              games.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="why">
            <AccordionTrigger>Why is Squad Champs?</AccordionTrigger>
            <AccordionContent className="text-sm">
              I am a big fan of Fantasy Premier League and wanted an NBA and NFL
              version of it.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="multiple-squads">
            <AccordionTrigger>Can I have multiple squads?</AccordionTrigger>
            <AccordionContent className="text-sm">
              For the fairness of the game and competition, only one squad per
              person.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="luka">
            <AccordionTrigger>
              Luka Doncic is a Guard, why is he listed as a Forward? How are
              these positions calculated?
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              Squad Champs takes the first listed position from a player's info
              on NBA.com.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
