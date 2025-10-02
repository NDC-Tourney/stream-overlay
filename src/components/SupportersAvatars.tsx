import type { Player } from "@/schemas/huis";
import { getAvatarUrl } from "@/util";
import clsx from "clsx";
import { PlayerAvatar } from "./PlayerAvatar";

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
  return (
    <div className={clsx("ss-supporters", reverse && "reverse")}>
      <div className="ss-supporters-amount">
        <span className="player-info-label">Supporters: </span>
        {player.supporters.length}
      </div>
      <div className={clsx("ss-supporters-avatars", reverse && "reverse")}>
        {player.supporters.map((supporter, i) => (
          <div key={`${supporter.id}-${i}`}>
            <PlayerAvatar
              className="supporter"
              url={getAvatarUrl(supporter.id)}
              color={side}
            />
            <div className="ss-supporter-name">{supporter.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
