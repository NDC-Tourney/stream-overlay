import { useMatchesQuery } from "@/state/huis";

export function StageInfo() {
  const { currentMatch } = useMatchesQuery();
  const { roundName, bracket, isShowmatch } = currentMatch;

  return (
    <div id="stage-info">
      <div id="stage-name">{roundName}</div>
      <div id="winner-loser">
        ({isShowmatch ? "showmatch" : `${bracket} Bracket`})
      </div>
    </div>
  );
}
