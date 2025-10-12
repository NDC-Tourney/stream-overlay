import { motion } from "framer-motion";
import type { AnimTypes } from "~/animations";
import { getAnimations, sectionVariants } from "~/animations";
import { Casters } from "~/components/Casters";
import { Chat } from "~/components/Chat";
import { FooterContent } from "~/components/FooterContent";
import { GameplaySvgMask } from "~/components/GameplayTransparencyMask";
import { HeaderContent } from "~/components/HeaderContent";
import { Logo } from "~/components/Logo";
import { MainContent } from "~/components/MainContent";
import { PlayerInfo } from "~/components/PlayerInfo";
import { StageInfo } from "~/components/StageInfo";

interface StandbyScreenProps {
  from?: string;
  to: string;
}

export function StandbyScreen({ from, to }: StandbyScreenProps) {
  // treat this component as self (to) and other as from
  const anims: AnimTypes = getAnimations(to, from ?? "");

  const slideDirection: 1 | -1 = 1;

  return (
    <div>
      <GameplaySvgMask />
      <div id="main" className="no-background">
        {/* Header */}
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
          </HeaderContent>
        </motion.div>

        {/* Main */}
        <motion.div
          key={`main-${to}`}
          {...(anims.main === "slide"
            ? sectionVariants.main.slide(slideDirection)
            : anims.main === "fade"
              ? sectionVariants.main.fade
              : sectionVariants.main.none)}
        >
          <MainContent>
            <div id="gameplay"></div>
          </MainContent>
        </motion.div>

        {/* Footer */}
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
