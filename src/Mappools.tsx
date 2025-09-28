import { motion } from "framer-motion";
import { sectionVariants, getAnimations } from "./animations";
import type { AnimTypes } from "./animations";
import clsx from "clsx";
import { Casters } from "./components/Casters";
import { Chat } from "./components/Chat";
import { Logo } from "./components/Logo";
import { MainContent } from "./components/MainContent";
import { HeaderContent } from "./components/HeaderContent";
import { FooterContent } from "./components/FooterContent";
import { PlayerInfo } from "./components/PlayerInfo";
import { StageInfo } from "./components/StageInfo";
import { useMappoolQuery, type Beatmap } from "./state/huis";
import { useSettings } from "./state/dashboard";

function ModBracket(
  beatmaps: Beatmap[],
  mod: Lowercase<Beatmap["modBracket"]>,
) {
  const [settings] = useSettings();
  const tb = mod === "tb" && "tb";

  return (
    <div id={`${mod}-pool`}>
      {beatmaps.map((map) => (
        <div className={`mappool-map ${mod}`} key={map.mapId}>
          {(["player1", "player2"] as const).map((player) => (
            <div key={`${player}-choices`}>
              <div
                className={clsx(
                  `picked-${tb || player}`,
                  settings[player].picks.includes(
                    `${map.modBracket}${map.modBracketIndex}`,
                  ) && "picked-active",
                )}
                key={`picked-${tb || player}-${map.mapId}`}
              >
                <div className={`picked-indicator-${tb || player}`}>
                  {tb
                    ? "TIEBREAKER HYPE!!!"
                    : `Picked by ${player === "player1" ? "Red" : "Blue"}`}
                </div>
              </div>
              <div
                className={clsx(
                  `banned-${player}`,
                  settings[player].bans.includes(
                    `${map.modBracket}${map.modBracketIndex}`,
                  ) && "banned-active",
                )}
                key={`banned-${tb || player}-${map.mapId}`}
              >
                <div className={`banned-indicator-${player}`}>
                  <div>Banned by {player === "player1" ? "Red" : "Blue"}</div>
                  {/*<div className="mappool-player-name">
                  {match[player].name}
                  </div>*/}
                </div>
              </div>
            </div>
          ))}
          <div className={clsx("mappool-map-top", tb)}>
            <div
              className="mappool-map-bg"
              style={{ backgroundImage: `url("${map.bgUrl}")` }}
            />
            <div
              className={`mappool-map-id ${mod}`}
            >{`${map.modBracket}${tb ? "" : map.modBracketIndex}`}</div>
          </div>
          <div className={clsx("mappool-map-bottom", tb)}>
            <div className={clsx("mappool-map-artist-title", tb)}>
              {`${map.artist} - ${map.title}`}
            </div>
            <div className={clsx("mappool-map-difficulty", tb)}>
              {map.diffName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface MappoolScreenProps {
  from?: string;
  to: string;
}

export function MappoolScreen({ from, to }: MappoolScreenProps) {
  // treat this component as self (to) and other as from
  const anims: AnimTypes = getAnimations(to, from ?? "");

  const slideDirection: 1 | -1 = 1;

  const { beatmaps } = useMappoolQuery();

  return (
    <div>
      <div id="main">
        <motion.div
          key={`header-${to}`}
          {...(anims.header === "slide"
            ? sectionVariants.header.slide(slideDirection)
            : anims.header === "fade"
              ? sectionVariants.header.fade
              : sectionVariants.header.none)}
        >
          <HeaderContent>
            <div id="top">
              <PlayerInfo playerNum={1} />
              <div id="middle">
                <StageInfo />
              </div>
              <PlayerInfo playerNum={2} />
            </div>

            <div id="current-status" style={{ visibility: "hidden" }}>
              <div id="current-status-pb">MAPPOOL - Next to pick: </div>
              <div id="current-status-player" className="blue">
                KawaiiSniperBoy
              </div>
            </div>
          </HeaderContent>
        </motion.div>

        <motion.div
          key={`main-${to}`}
          {...(anims.main === "slide"
            ? sectionVariants.main.slide(slideDirection)
            : anims.main === "fade"
              ? sectionVariants.main.fade
              : sectionVariants.main.none)}
        >
          <MainContent>
            <div id="mappool">
              <div id="mappool-left">
                {ModBracket(beatmaps.NM, "nm")}
                {ModBracket(beatmaps.HD, "hd")}
                {ModBracket(beatmaps.HR, "hr")}
              </div>
              <div id="mappool-right">
                {ModBracket(beatmaps.DT, "dt")}
                {ModBracket(beatmaps.TB, "tb")}
              </div>
            </div>
          </MainContent>
        </motion.div>

        <motion.div
          key={`footer-${to}`}
          {...(anims.footer === "slide"
            ? sectionVariants.footer.slide(slideDirection)
            : anims.footer === "fade"
              ? sectionVariants.footer.fade
              : sectionVariants.footer.none)}
        >
          <FooterContent>
            <div id="orange-line"></div>
            <div id="bottom">
              <Logo />
              <Chat />
              <Casters />
            </div>
          </FooterContent>
        </motion.div>
      </div>
    </div>
  );
}
