import { motion } from "framer-motion";
import { sectionVariants, getAnimations } from "./animations";
import type { AnimTypes } from "./animations";
import { Casters } from "./components/Casters";
import { Chat } from "./components/Chat";
import { Logo } from "./components/Logo";
import { MainContent } from "./components/MainContent";
import { FooterContent } from "./components/FooterContent";
import { useTosu } from "./state/tosu";
import { useMatchQuery } from "@/state/huis";
import trophy from "./static/img/trophy.png";
import SupportersAvatars from "./components/SupportersAvatars";

interface WinnerScreenProps {
  from?: string;
  to: string;
}

export function WinnerScreen({ from, to }: WinnerScreenProps) {
  // treat this component as self (to) and other as from
  const anims: AnimTypes = getAnimations(to, from ?? "");

  const slideDirection: 1 | -1 = 1;

  const { tourney } = useTosu();
  const match = useMatchQuery();

  const [player1, player2] = [match.player1, match.player2];

  const totalPoints = Math.ceil(tourney.bestOf / 2);

  let winner = match.player1;
  let winnerTeam: "red" | "blue" = "red";

  if (tourney.points.left == totalPoints) {
    winner = match.player1;
    winnerTeam = "red";
  } else if (tourney.points.right == totalPoints) {
    winner = match.player2;
    winnerTeam = "blue";
  }

  return (
    <div>
      <div id="main">
        <motion.div
          key={`main-${to}`}
          {...(anims.main === "slide"
            ? sectionVariants.main.slide(slideDirection)
            : anims.main === "fade"
              ? sectionVariants.main.fade
              : sectionVariants.main.none)}
        >
          <MainContent>
            <div id="win-top">
              <div id="win-left">
                <div id="win-text">Winner</div>
                <div id="win-player">
                  <div id="win-player-icon" className={winnerTeam}>
                    <img src={winner.avatarUrl} />
                  </div>
                  <div id="win-player-info">
                    <div id="win-player-name">
                      {winner.name !== "" ? winner.name : "Unknown player"}
                    </div>
                    <div id="win-player-pickems">
                      <span className="player-info-label">Pickems: </span>
                      {winner.pickemsRate}%
                    </div>
                    <div id="win-player-seed">
                      <span className="player-info-label">Seed: </span>
                      {winner.seed}
                    </div>
                  </div>
                </div>
                {/* <div id="win-stage-info">
                  <div id="win-stage-name">Quarter Finals</div>
                  <div id="win-winner-loser">(Winners Bracket)</div>
                </div> */}
                <SupportersAvatars player={winner} side={winnerTeam} />
              </div>
              <div id="win-right">
                <div id="trophy">
                  <img src={trophy} />
                </div>
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
