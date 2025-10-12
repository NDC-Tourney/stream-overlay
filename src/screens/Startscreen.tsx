import clsx from "clsx";
import { motion } from "framer-motion";
import Countdown, { zeroPad } from "react-countdown";
import type { AnimTypes } from "~/animations";
import { getAnimations, sectionVariants } from "~/animations";
import { Casters } from "~/components/Casters";
import { Chat } from "~/components/Chat";
import { FooterContent } from "~/components/FooterContent";
import { Logo } from "~/components/Logo";
import { MainContent } from "~/components/MainContent";
import { PlayerCard } from "~/components/PlayerCard";
import SupportersAvatars from "~/components/SupportersAvatars";
import { useSettings } from "~/state/dashboard";
import { useMatchesQuery } from "~/state/huis";

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
  const { currentMatch } = useMatchesQuery();
  const { player1, player2, roundName, isShowmatch, bracket } = currentMatch;
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
              <div id="ss-stage-name">{roundName}</div>
              <div id="ss-winner-loser">
                ({isShowmatch ? "showmatch" : `${bracket} Bracket`})
              </div>
            </div>
            <div id="ss-vs">
              <PlayerCard player={player1} side="red" />
              <div className="ss-vs-text">VS</div>
              <PlayerCard player={player2} side="blue" />
            </div>
            <div id="ss-middle">
              <SupportersAvatars player={player1} side="red" reverse={true} />
              <div
                className={clsx(
                  "ss-time-to-start",
                  settings.showCountdown && "visible",
                )}
              >
                <span>Time to start: </span>
                <span className="ss-countdown">
                  <Countdown
                    key={`countdown-${settings.countdown}`}
                    renderer={renderer}
                    date={settings.countdown}
                    autoStart={true}
                  />
                </span>
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
