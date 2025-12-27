import { Card, CardContent, CardTitle } from "~/components/ui/card";
import TradesTab from "~/components/squad/TradesTab";
import { useOutletContext } from "react-router";

export default function TradesRoute() {
  const { squadPlayers, playersMap, budget, setBudget, submitTrade } =
    useOutletContext<any>();

  return (
    <TradesTab
      squadPlayers={squadPlayers}
      allPlayersMap={playersMap}
      budget={budget}
      onBudgetChange={setBudget}
      onSubmit={submitTrade}
    />
  );
}
