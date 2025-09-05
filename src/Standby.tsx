import { motion } from "framer-motion";
import { sectionVariants, getAnimations } from "./animations";
import type { AnimTypes } from "./animations";
import { PlayerInfo } from "./components/PlayerInfo";
import { Chat } from "./components/Chat";
import { Logo } from "./components/Logo";
import { Casters } from "./components/Casters";
import { StageInfo } from "./components/StageInfo";
import { MainContent } from "./components/MainContent";
import { HeaderContent } from "./components/HeaderContent";
import { FooterContent } from "./components/FooterContent";

interface StandbyScreenProps {
  from?: string;
  to: string;
}

export function StandbyScreen({ from, to }: StandbyScreenProps) {
  // treat this component as self (to) and other as from
  const anims: AnimTypes = getAnimations(to, from ?? "");

  const slideDirection: 1 | -1 = 1;

  return (
    <div id="main">
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
  );
}
