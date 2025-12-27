import { useParams, useOutletContext } from "react-router";
import ScoresTab from "~/components/squad/ScoresTab";

export default function WeekScoresRoute() {
  const { userId, weekNumber } = useParams();
  const { squadMeta, currentGameweek, squadPlayers } = useOutletContext<any>();

  const weekNum = parseInt(weekNumber || "1", 10);

  return (
    <ScoresTab
      squadMeta={squadMeta}
      currentGameweek={currentGameweek}
      initialWeek={weekNum}
      userId={userId}
    />
  );
}
