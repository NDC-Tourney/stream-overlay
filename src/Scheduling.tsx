import { motion } from "framer-motion";
import { sectionVariants, getAnimations } from "./animations";
import type { AnimTypes } from "./animations";
import dayjs from "dayjs";
import { useMatchesQuery, useScheduleQuery } from "./state/huis";
import logo from "./static/img/logo.png";
import clsx from "clsx";
import { MainContent } from "./components/MainContent";
import { Casters } from "./components/Casters";
import { useTosu } from "./state/tosu";

interface SchedulingScreenProps {
  from?: string;
  to: string;
}

export function SchedulingScreen({ from, to }: SchedulingScreenProps) {
  // treat this component as self (to) and other as from
  const anims: AnimTypes = getAnimations(to, from ?? "");

  const slideDirection: 1 | -1 = 1;

  const { currentMatch } = useMatchesQuery();
  const roundName = currentMatch.roundName;
  const schedule = useScheduleQuery();

  const { tourney } = useTosu();

  return (
    <div id="main-scheduling">
      <motion.div
        key={`main-${to}`}
        {...(anims.main === "slide"
          ? sectionVariants.main.slide(slideDirection)
          : anims.main === "fade"
            ? sectionVariants.main.fade
            : sectionVariants.main.none)}
      >
        <MainContent>
          <div id="schedule">
            <div id="schedule-left">
              <div id="schedule-upcoming">
                <div id="schedule-upcoming-text">Upcoming Matches</div>
                <div id="upcoming-matches">
                  {schedule.upcoming.map((match) => {
                    if (
                      match.uid === currentMatch.uid &&
                      (tourney.points.left > 0 || tourney.points.right > 0)
                    ) {
                      const totalPoints = Math.ceil(tourney.bestOf / 2);
                      match.player1.score = tourney.points.left;
                      match.player1.winner =
                        tourney.points.left === totalPoints;
                      match.player2.score = tourney.points.right;
                      match.player2.winner =
                        tourney.points.right === totalPoints;
                    }

                    return (
                      <div className="match" key={match.uid}>
                        <div className="match-info">
                          <div className="match-red-player">
                            <div className="match-red-player-icon">
                              <img src={match.player1.avatarUrl} />
                            </div>
                            <div className="match-player-name">
                              {match.player1.name ?? "Unknown player"}
                            </div>
                            <div
                              className={clsx(
                                "match-box",
                                match.player1.winner && "win",
                              )}
                            >
                              <div className="match-score">
                                {match.player1.score}
                              </div>
                            </div>
                          </div>
                          <div className="match-vs">
                            <div className="divider"></div>
                            <div className="match-vs-text">VS</div>
                            <div className="divider"></div>
                          </div>
                          <div className="match-blue-player">
                            <div className="match-blue-player-icon">
                              <img src={match.player2.avatarUrl} />
                            </div>
                            <div className="match-player-name">
                              {match.player2.name ?? "Unknown player"}
                            </div>
                            <div
                              className={clsx(
                                "match-box",
                                match.player2.winner && "win",
                              )}
                            >
                              <div className="match-score">
                                {match.player2.score}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="match-time">
                          <div className="match-until">
                            {dayjs(match.date).fromNow()}
                          </div>
                          <div className="match-timestamp">
                            {dayjs(match.date)
                              .tz("Europe/Amsterdam")
                              .format("dddd HH:mm")}
                            <span className="match-timestamp-tz">
                              {dayjs(match.date)
                                .tz("Europe/Amsterdam")
                                .format("z")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div id="schedule-previous">
                <div id="schedule-previous-text">Previous Matches</div>
                <div id="previous-matches">
                  {schedule.recent.map((match) => (
                    <div className="match" key={match.uid}>
                      <div className="match-info">
                        <div className="match-red-player">
                          <div className="match-red-player-icon">
                            <img src={match.player1.avatarUrl} />
                          </div>
                          <div className="match-player-name">
                            {match.player1.name ?? "Unknown player"}
                          </div>
                          <div
                            className={clsx(
                              "match-box",
                              match.player1.winner && "win",
                            )}
                          >
                            <div className="match-score">
                              {match.player1.score}
                            </div>
                          </div>
                        </div>
                        <div className="match-vs">
                          <div className="divider"></div>
                          <div className="match-vs-text">VS</div>
                          <div className="divider"></div>
                        </div>
                        <div className="match-blue-player">
                          <div className="match-blue-player-icon">
                            <img src={match.player2.avatarUrl} />
                          </div>
                          <div className="match-player-name">
                            {match.player2.name ?? "Unknown player"}
                          </div>
                          <div
                            className={clsx(
                              "match-box",
                              match.player2.winner && "win",
                            )}
                          >
                            <div className="match-score">
                              {match.player2.score}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="match-time">
                        <div className="match-until">
                          {dayjs(match.date).fromNow()}
                        </div>
                        <div className="match-timestamp">
                          {dayjs(match.date)
                            .tz("Europe/Amsterdam")
                            .format("dddd HH:mm")}
                          <span className="match-timestamp-tz">
                            {dayjs(match.date)
                              .tz("Europe/Amsterdam")
                              .format("z")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id="scheduling-right">
              <div id="scheduling-text">Scheduling</div>
              <div id="scheduling-stage">{roundName}</div>
              <div id="scheduling-logo">
                <img src={logo} />
              </div>
              <div id="scheduling-casters">
                <Casters />
              </div>
            </div>
          </div>
        </MainContent>
      </motion.div>
    </div>
  );
}
