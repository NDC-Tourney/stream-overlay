import clsx from "clsx";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  url: string;
  color: "red" | "blue";
  style?: "square" | "rounded";
};

export function PlayerAvatar({ url, color, style, className }: Props) {
  return (
    <div
      className={clsx(
        "ss-player-avatar",
        color,
        style && `ss-${style}-player-avatar`,
        className,
      )}
    >
      <img src={url} />
    </div>
  );
}
