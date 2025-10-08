import clsx from "clsx";
import { PlayerAvatar } from "./PlayerAvatar";
import type { Player } from "@/schemas/huis";

type Props = {
  player: Player;
  side: "red" | "blue";
};

export function PlayerCard({ player, side }: Props) {
  return (
    <div id={`ss-${side}-player`}>
      <PlayerAvatar url={player.avatarUrl} color={side} />
      <div className={clsx("ss-player-info", side === "red" && "align-right")}>
        <div className="ss-player-name">{player.name}</div>
        <div className="ss-player-pickems">
          <span className="player-info-label">Pickems: </span>
          {player.pickemsRate}%
        </div>
        {player.seed && (
          <div className="ss-player-seed">
            <span className="player-info-label">Seed: </span>
            {player.seed}
          </div>
        )}
      </div>
    </div>
  );
}
