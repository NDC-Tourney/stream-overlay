import { useMatchQuery } from "@/state/huis";
import { useTosu } from "@/state/tosu";
import clsx from "clsx";

export function PlayerInfo({ playerNum }: { playerNum: 1 | 2 }) {
  const { tourney } = useTosu();
  const match = useMatchQuery();

  const [player, team, side] =
    playerNum === 1
      ? ([match.player1, "red", "left"] as const)
      : ([match.player2, "blue", "right"] as const);
  const maxPoints = Math.ceil(tourney.bestOf / 2);
  const points = Array.from({ length: maxPoints }, (_, i) => (
    <div
      key={`map-points-left-${i}`}
      className={`map-point${i < tourney.points[side] ? " map-won" : ""}`}
    ></div>
  ));

  return (
    <div id={`${team}-player`}>
      <div id="player" className={clsx(playerNum === 2 && "flex-reverse")}>
        <div id={`${team}-player-icon`}>
          <img src={player.avatarUrl} />
        </div>
        <div id="player-info">
          <div id="player-name" className={`align-${side}`}>
            {player.name ?? "Unknown player"}
          </div>
          <div id="player-seed" className={`align-${side}`}>
            Seed: {player.seed}
          </div>
          {/* <div id="player-supporters" className={`align-${side}`}>
            Supporters: {player.supporters}
          </div> */}
          <div id="player-pickems" className={`align-${side}`}>
            Pickems: {player.pickemsRate}%
          </div>
        </div>
      </div>
      <div id={`${team}-maps-won`}>{points}</div>
    </div>
  );
}
