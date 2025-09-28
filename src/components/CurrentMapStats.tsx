import clsx from "clsx";
import { useSettings } from "@/state/dashboard";
import { useTosu } from "@/state/tosu";

export function CurrentMapStats() {
  const { beatmap } = useTosu();
  const [settings] = useSettings();

  return (
    <div
      id="current-map"
      className={clsx({
        [`current-map-picked-${settings.lastPickedBy}`]: settings.lastPickedBy,
      })}
    >
      <div
        className="beatmap-bg current-map-bg"
        style={{ "--bg": beatmap.bgUrl ? `url("${beatmap.bgUrl}")` : "" }}
      ></div>
      <div id="current-map-info">
        <div id="current-map-name">{beatmap.title}</div>
        <div id="current-map-artist">{beatmap.artist}</div>
        <div id="diff-mapper">
          <div id="current-map-difficulty">[{beatmap.difficulty}]</div>
          <div id="current-map-mapper">Mapped by: {beatmap.mapper}</div>
        </div>
      </div>
      <div id="current-map-stats">
        <div id="current-map-cs">
          <p>CS</p>
          <div id="cs">{beatmap.cs}</div>
        </div>
        <div id="current-map-ar">
          <p>AR</p>
          <div id="ar">{beatmap.ar}</div>
        </div>
        <div id="current-map-od">
          <p>OD</p>
          <div id="od">{beatmap.od}</div>
        </div>
        <div id="current-map-sr">
          <p>SR</p>
          <div id="sr">{beatmap.stars}</div>
        </div>
        <div id="current-map-bpm">
          <p>BPM</p>
          <div id="bpm">{beatmap.bpm}</div>
        </div>
        <div id="current-map-length">
          <p>Length</p>
          <div id="length">{formatTime(beatmap.length)}</div>
        </div>
      </div>
    </div>
  );
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");
  return `${paddedMinutes}:${paddedSeconds}`;
}
