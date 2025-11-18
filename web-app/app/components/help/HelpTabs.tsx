// app/components/help/HelpTabs.tsx

import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import RulesAccordion from "./RulesAccordion";
import ScoringSection from "./ScoringSection";
import LeaguesSection from "./LeaguesSection";
import FAQSection from "./FAQSection";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function HelpTabs() {
  return (
    <Tabs defaultValue="rules" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 md:w-auto">
        <TabsTrigger value="rules">Rules</TabsTrigger>
        <TabsTrigger value="scoring">Scoring</TabsTrigger>
        {/* <TabsTrigger value="leagues">Leagues</TabsTrigger> */}
        <TabsTrigger value="faqs">FAQs</TabsTrigger>
      </TabsList>

      <TabsContent value="rules">
        <RulesAccordion />
      </TabsContent>

      <TabsContent value="scoring">
        <ScoringSection />
      </TabsContent>

      {/* <TabsContent value="leagues">
        <LeaguesSection />
      </TabsContent> */}

      <TabsContent value="faqs">
        <FAQSection />
      </TabsContent>
    </Tabs>
  );
}
