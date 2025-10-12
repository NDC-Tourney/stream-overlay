import { PlayerInfo } from "./PlayerInfo";
import { ScoreBars } from "./ScoreBars";
import "./static/top.css";

export function Top() {
  return (
    <div id="top">
      <PlayerInfo playerNum={1} />
      <ScoreBars />
      <PlayerInfo playerNum={2} />
    </div>
  );
}
