import { AnimatePresence } from "motion/react";
import { usePreload } from "~/preload";
import { useSettings } from "~/state/dashboard";
import { MappoolScreen } from "./screens/Mappools";
import { SchedulingScreen } from "./screens/Scheduling";
import { StandbyScreen } from "./screens/Standby";
import { StartScreen } from "./screens/Startscreen";
import { VersusScreen } from "./screens/Versus";
import { WinnerScreen } from "./screens/Winner";
import { Showcase } from "./screens/Showcase";

export function Screens() {
  usePreload();

  const [settings] = useSettings();
  const activeScreen = settings.activeScreen;
  const previous = settings.previousScreen;

  return (
    <div style={{ position: "relative", width: "1920px", height: "1080px" }}>
      <AnimatePresence mode="wait" initial={false}>
        {activeScreen === "start" && (
          <StartScreen key="start" from={previous} to="start" />
        )}
        {activeScreen === "standby" && (
          <StandbyScreen key="standby" from={previous} to="standby" />
        )}
        {activeScreen === "versus" && (
          <VersusScreen key="versus" from={previous} to="versus" />
        )}
        {activeScreen === "mappool" && (
          <MappoolScreen key="mappool" from={previous} to="mappool" />
        )}
        {activeScreen === "scheduling" && (
          <SchedulingScreen key="scheduling" from={previous} to="scheduling" />
        )}
        {activeScreen === "winner" && (
          <WinnerScreen key="winner" from={previous} to="winner" />
        )}
        {activeScreen === "showcase" && <Showcase />}
      </AnimatePresence>
    </div>
  );
}
