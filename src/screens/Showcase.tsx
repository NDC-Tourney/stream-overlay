import { useEffect, useRef, useState } from "react";
import { showcaseBeatmaps } from "~/schemas/showcase";
import { useSettings } from "~/state/dashboard";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ClockIcon, MetronomeIcon, StarIcon } from "@phosphor-icons/react";
import { produce } from "immer";

export function Showcase() {
  const [settings, setSettings] = useSettings();
  const activeBeatmap = settings.showcaseBeatmap;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (settings.showcasePlaying) {
      videoRef.current?.play().catch((e) => {
        console.error(e);
        setSettings(
          produce((settings) => {
            settings.showcasePlaying = false;
          }),
        );
      });
    } else {
      videoRef.current?.pause();
    }
  }, [settings.showcasePlaying, setSettings]);

  const map = showcaseBeatmaps[activeBeatmap];

  const overlay = {
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        when: "afterChildren",
      },
    },
  } satisfies Variants;

  const fromLeft = {
    visible: {
      x: "0%",
      transition: {
        duration: 1,
        ease: "easeIn",
        type: "spring",
        bounce: 0.2,
      },
    },
    hidden: {
      x: "-100%",
      transition: {
        duration: 1,
        ease: "easeIn",
        type: "spring",
      },
    },
  } satisfies Variants;

  const fromRight = produce(fromLeft, (fromLeft) => {
    fromLeft.hidden.x = "100%";
  });

  return (
    <div className="showcase">
      <AnimatePresence mode="wait" onExitComplete={() => setShowOverlay(false)}>
        <motion.div
          key={`showcase-video-${activeBeatmap}`}
          variants={overlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <AnimatePresence propagate>
            <motion.div
              key={`showcase-overlay-${activeBeatmap}`}
              className="showcase-overlay"
              initial="hidden"
              animate={showOverlay ? "visible" : "hidden"}
              exit="hidden"
            >
              <motion.div
                className="showcase-map-info showcase-map-section"
                variants={fromLeft}
              >
                <div className="showcase-map-title">{`${map.artist} – ${map.title} [${map.difficulty}]`}</div>
                <div className="showcase-map-mapper">
                  Mapset by {map.mapper}
                </div>
                <div className="showcase-map-player">
                  Replay by {map.player}
                </div>
              </motion.div>
              <motion.div
                className="showcase-map-slot showcase-map-section"
                variants={fromRight}
              >
                {activeBeatmap}
              </motion.div>
              <motion.div
                className="showcase-map-stats showcase-map-section"
                variants={fromRight}
              >
                <div className="showcase-map-stat" style={{ fontSize: 32 }}>
                  {map.sr} <StarIcon />
                </div>
                <div
                  className="showcase-map-stats-row"
                  style={{ fontSize: 28 }}
                >
                  <div className="showcase-map-stat">
                    {map.length} <ClockIcon />
                  </div>
                  <div className="showcase-map-stat">
                    {map.bpm} <MetronomeIcon />
                  </div>
                </div>
                <div
                  className="showcase-map-stats-row"
                  style={{ fontSize: 24 }}
                >
                  <div className="showcase-map-stat">AR {map.ar}</div>
                  <div className="showcase-map-stat">CS {map.cs}</div>
                  <div className="showcase-map-stat">OD {map.od}</div>
                  <div className="showcase-map-stat">HP {map.hp}</div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <motion.video
            ref={(ref) => {
              videoRef.current = ref;
            }}
            autoPlay={settings.showcasePlaying}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;

              if (video.currentTime <= 2) {
                return;
              }

              if (video.currentTime <= video.duration - 7) {
                setShowOverlay(true);
                return;
              }

              setShowOverlay(false);

              if (video.currentTime > video.duration - 5) {
                video.pause();
              }
            }}
            src={`https://i.bas.sh/showcase/${activeBeatmap}.mp4`}
            className="showcase-video"
            disableRemotePlayback
            disablePictureInPicture
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
