import type { Player } from "@/schemas/huis";
import { getAvatarUrl } from "@/util";
import clsx from "clsx";
import { PlayerAvatar } from "./PlayerAvatar";
import { Marquee } from "./Marquee";
import { useCallback } from "react";

type Props = {
  player: Player;
  reverse?: boolean;
  side: "red" | "blue";
};

export default function SupportersAvatars({
  player,
  reverse = false,
  side,
}: Props) {
  const Avatars = useCallback(
    () =>
      player.supporters.map((supporter, i) => (
        <div key={`${supporter.id}-${i}`}>
          <PlayerAvatar
            className="supporter"
            url={getAvatarUrl(supporter.id)}
            color={side}
          />
          <div className="ss-supporter-name">{supporter.name}</div>
        </div>
      )),
    [JSON.stringify(player.supporters)],
  );

  return (
    <div className={clsx("ss-supporters", { reverse: reverse })}>
      <div className="ss-supporters-amount">
        <span className="player-info-label">Supporters: </span>
        {player.supporters.length}
      </div>
      <div
        className={clsx("ss-supporters-avatars", {
          reverse: reverse,
          grid: player.supporters.length <= 4,
        })}
      >
        {player.supporters.length > 4 ? (
          <Marquee fade={true}>
            <Avatars />
          </Marquee>
        ) : (
          <Avatars />
        )}
      </div>
    </div>
  );
}
