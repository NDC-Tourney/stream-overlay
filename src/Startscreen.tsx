import { motion } from "framer-motion";
import { sectionVariants, getAnimations } from "./animations";
import type { AnimTypes } from "./animations";
import { useMatchQuery } from "./state/huis";
import { Chat } from "./components/Chat";
import { Logo } from "./components/Logo";
import { Casters } from "./components/Casters";
import { MainContent } from "./components/MainContent";
import { FooterContent } from "./components/FooterContent";
import Countdown, { zeroPad } from "react-countdown";
import { useSettings } from "./state/dashboard";
import { PlayerCard } from "./components/PlayerCard";
import { PlayerAvatar } from "./components/PlayerAvatar";
import { getAvatarUrl } from "./util";
import SupportersAvatars from "./components/SupportersAvatars";

interface StartScreenProps {
  from?: string;
  to: string;
}

const renderer = ({
  minutes,
  seconds,
}: {
  minutes: number;
  seconds: number;
}) => (
  <span>
    {zeroPad(minutes)}:{zeroPad(seconds)}
  </span>
);

export function StartScreen({ from, to }: StartScreenProps) {
  const { player1, player2, ...match } = useMatchQuery();
  const [settings] = useSettings();
  // treat this component as self (to) and other as from
  const anims: AnimTypes = getAnimations(to, from ?? "");

  const slideDirection: 1 | -1 = 1;

  return (
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
          <div id="ss-top">
            <div id="ss-title">
              <div id="ss-stage-name">{match.roundName}</div>
              <div id="ss-winner-loser">({match.bracket} Bracket)</div>
            </div>
            <div id="ss-vs">
              <PlayerCard player={player1} side="red" />
              <div className="ss-vs-text">VS</div>
              <PlayerCard player={player2} side="blue" />
            </div>
            <div id="ss-middle">
              <SupportersAvatars player={player1} side="red" reverse={true} />
              <div>
                {settings.countdown && (
                  <div className="ss-time-to-start">
                    <span>Time to start: </span>
                    <span className="ss-countdown">
                      <Countdown
                        key={`countdown-${settings.countdown.getTime()}`}
                        renderer={renderer}
                        date={settings.countdown}
                        autoStart={true}
                      />
                    </span>
                  </div>
                )}
              </div>
              <SupportersAvatars player={player2} side="blue" />
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
  );
}
