import { useMatchesQuery } from "@/state/huis";

export function StageInfo() {
  const { currentMatch } = useMatchesQuery();
  const { roundName, bracket } = currentMatch;

  return (
    <div id="stage-info">
      <div id="stage-name">{roundName}</div>
      <div id="winner-loser">({bracket} Bracket)</div>
    </div>
  );
}
