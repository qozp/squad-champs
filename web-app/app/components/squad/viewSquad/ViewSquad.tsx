import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Card, CardContent } from "~/components/ui/card";
import LineupTab from "./LineupTab";
import ScoresTab from "./ScoresTab";
import TradesTab from "./TradesTab";

interface Props {
  squadPlayers: any[];
  squadMeta: any;
}

export default function ViewSquad({ squadPlayers, squadMeta }: Props) {
  return (
    <Tabs defaultValue="lineup" className="w-full">
      {/* TABS OUTSIDE CARD */}
      <TabsList className="mb-2 w-full justify-start">
        <TabsTrigger value="lineup">Lineup</TabsTrigger>
        <TabsTrigger value="scores">Scores</TabsTrigger>
        <TabsTrigger value="trades">Trades</TabsTrigger>
      </TabsList>

      <TabsContent value="lineup">
        <LineupTab squadPlayers={squadPlayers} />
      </TabsContent>

      <TabsContent value="scores">
        <ScoresTab squadMeta={squadMeta} />
      </TabsContent>

      <TabsContent value="trades">
        <TradesTab squadPlayers={squadPlayers} />
      </TabsContent>
    </Tabs>
  );
}
