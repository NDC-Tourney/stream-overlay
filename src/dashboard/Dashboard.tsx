import clsx from "clsx";
import dayjs from "dayjs";
import { produce } from "immer";
import {
  Activity,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Match } from "~/schemas/huis";
import { screenNames, type ScreenName } from "~/schemas/screens";
import {
  showcaseBeatmapSlots,
  type ShowcaseBeatmapSlot,
} from "~/schemas/showcase";
import { useSettings } from "~/state/dashboard";
import {
  useMappoolQuery,
  useMatchesQuery,
  useScheduleQuery,
} from "~/state/huis";
import { useTosu } from "~/state/tosu";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";

export function Dashboard() {
  const { matches } = useMatchesQuery();
  const schedule = useScheduleQuery();
  const {
    tourney: { chat },
  } = useTosu();
  const [settings, setSettings] = useSettings();

  const _autoselect = settings.automaticSelect;

  // default to the next upcoming match on startup
  useEffect(() => {
    const nextMatch = schedule.upcoming[0] ?? schedule.recent[0];
    if (!settings.matchId && nextMatch) {
      setSettings(
        produce((settings) => {
          settings.matchId = nextMatch.uid;
          settings.countdown = nextMatch.date;
        }),
      );
    }
  }, [settings.matchId, setSettings, schedule]);

  const selectedMatch = useMemo(() => {
    const match = matches?.find((m) => m.uid === settings.matchId);
    return match
      ? `${match.uid} ${match.player1.name} - ${match.player2.name}`
      : "Select";
  }, [matches, settings.matchId]);

  const countdownDate = dayjs(settings.countdown).format("HH:mm");

  const setAutoselect = (value: boolean) =>
    setSettings(
      produce((settings) => {
        settings.automaticSelect = value;
      }),
    );

  const setSelectedScreen = (screen: ScreenName) =>
    setSettings(
      produce((settings) => {
        if (settings.countdown && settings.countdown < Date.now()) {
          settings.showCountdown = false;
        }

        settings.activeScreen = screen;
        settings.previousScreen = settings.activeScreen;
      }),
    );

  const setSelectedMatch = (match: Match) =>
    setSettings(
      produce((settings) => {
        settings.matchId = match.uid;
        settings.countdown = match.date;
      }),
    );

  const setActivePlayer = (player: "player1" | "player2") =>
    setSettings(
      produce((settings) => {
        settings.activePlayer = player;
      }),
    );

  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const setShowcaseBeatmap = (beatmap: ShowcaseBeatmapSlot) =>
    setSettings(
      produce((settings) => {
        settings.showcaseBeatmap = beatmap;
      }),
    );

  const toggleShowcasePlaying = () =>
    setSettings(
      produce((settings) => {
        settings.showcasePlaying = !settings.showcasePlaying;
      }),
    );

  // Match ID dropdown
  const [matchIsOpen, setMatchOpen] = useState(false);
  const matchDropdownRef = useRef<HTMLDivElement>(null);

  const { beatmaps } = useMappoolQuery();
  const mappoolOptions = useMemo(
    () =>
      Object.values(beatmaps)
        .flat()
        .map((map) => `${map.modBracket}${map.modBracketIndex}`),
    [beatmaps],
  );

  // Bans & Picks dropdown
  const [bansSelection, setBansSelection] = useState("Select");
  const [bansOpen, setBansOpen] = useState(false);
  const [picksSelection, setPicksSelection] = useState("Select");
  const [picksOpen, setPicksOpen] = useState(false);
  const bansDropdownRef = useRef<HTMLDivElement>(null);
  const picksDropdownRef = useRef<HTMLDivElement>(null);
  const showcaseDropdownRef = useRef<HTMLDivElement>(null);

  const handleConfirm = (pickOrBan: "bans" | "picks") => {
    const map = pickOrBan === "bans" ? bansSelection : picksSelection;
    if (!mappoolOptions.includes(map)) {
      return;
    }

    setSettings(
      produce((settings) => {
        const selection = settings[settings.activePlayer];
        if (!selection[pickOrBan].includes(map)) {
          // remove from all selections first
          for (const player of ["player1", "player2"] as const) {
            for (const type of ["bans", "picks"] as const) {
              settings[player][type] = settings[player][type].filter(
                (m) => m !== map,
              );
            }
          }

          selection[pickOrBan].push(map);
        } else {
          selection[pickOrBan] = selection[pickOrBan].filter((m) => m !== map);
        }

        settings.lastPickedBy = map.includes("TB")
          ? null
          : settings.activePlayer;
        settings.activePlayer =
          settings.activePlayer === "player1" ? "player2" : "player1";
      }),
    );

    if (pickOrBan === "picks") {
      setPicksSelection("Confirmed!");
    } else {
      setBansSelection("Confirmed!");
    }
  };

  const lastMessage = chat.at(-1)?.message;
  const lastMentionedMap = useRef<string>(null);

  useEffect(() => {
    if (mappoolOptions.length === 0) {
      return;
    }

    const map = lastMessage?.match(
      new RegExp(mappoolOptions.join("|"), "i"),
    )?.[0];

    if (map && lastMentionedMap.current !== map) {
      lastMentionedMap.current = map;
      setPicksSelection(map.toUpperCase());
      setBansSelection(map.toUpperCase());
    }
  }, [lastMessage, mappoolOptions]);

  const handleCountdownDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let parsedTime = dayjs(e.target.value, "HH:mm");
    const now = dayjs();
    if (parsedTime.isBefore(now)) {
      parsedTime = parsedTime.add(1, "day");
    }

    setSettings(
      produce((settings) => {
        settings.countdown = parsedTime.valueOf();
      }),
    );
  };

  const setCountdownVisibility = (value: boolean) =>
    setSettings(
      produce((settings) => {
        settings.showCountdown = value;
      }),
    );

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        matchDropdownRef.current &&
        !matchDropdownRef.current.contains(e.target as Node)
      )
        setMatchOpen(false);

      if (
        bansDropdownRef.current &&
        !bansDropdownRef.current.contains(e.target as Node)
      )
        setBansOpen(false);

      if (
        picksDropdownRef.current &&
        !picksDropdownRef.current.contains(e.target as Node)
      )
        setPicksOpen(false);

      if (
        showcaseDropdownRef.current &&
        !showcaseDropdownRef.current.contains(e.target as Node)
      )
        setShowcaseOpen(false);
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const BannedOrPicked = useCallback(
    ({ map }: { map: string }) => {
      if (settings.player1.picks.includes(map)) {
        return (
          <>
            {map}
            <span style={{ color: "#dc1f2b" }}> picked</span>
          </>
        );
      }

      if (settings.player2.picks.includes(map)) {
        return (
          <>
            {map}
            <span style={{ color: "#2f6bff" }}> picked</span>
          </>
        );
      }

      if (settings.player1.bans.includes(map)) {
        return (
          <>
            <s>{map}</s>
            <span style={{ color: "#dc1f2b" }}> banned</span>
          </>
        );
      }

      if (settings.player2.bans.includes(map)) {
        return (
          <>
            <s>{map}</s>
            <span style={{ color: "#2f6bff" }}> banned</span>
          </>
        );
      }

      return map;
    },
    [
      JSON.stringify([
        settings.player1.picks,
        settings.player1.bans,
        settings.player2.picks,
        settings.player2.bans,
      ]),
    ],
  );

  return (
    <div id="main">
      <div id="title">tourney!dash</div>

      {/* Match Select */}
      <div id="match-select">
        <div id="match-select-id" ref={matchDropdownRef}>
          <div id="match-select-id-text">Select a match:</div>
          <div
            id="match-select-id-input"
            className={matchIsOpen ? "open" : ""}
            onClick={() => setMatchOpen(!matchIsOpen)}
          >
            {selectedMatch}
          </div>
          <div
            className={`match-select-dropdown-options ${matchIsOpen ? "show" : ""}`}
          >
            {matches?.map((match) => (
              <div
                key={match.uid}
                onClick={() => {
                  setSelectedMatch(match);
                  setMatchOpen(false);
                }}
              >
                {`${match.uid} ${match.player1.name} - ${match.player2.name}`}
              </div>
            ))}
          </div>
        </div>
        {/* <div className="checkbox-input">
          <label
            htmlFor="match-select-auto-checkbox"
            className="checkbox-label"
          >
            Auto-select match from lobby name
          </label>
          <input
            type="checkbox"
            id="match-select-auto-checkbox"
            name="autoselect"
            checked={autoselect}
            onChange={(e) => setAutoselect(e.target.checked)}
          ></input>
        </div> */}
      </div>

      <div className="divider"></div>

      {/* Scene Switcher */}
      <div id="scene-switcher">
        <div className="section-title">Scene Switcher</div>
        <div className="switcher-select">
          {screenNames.map((scene) => (
            <button
              key={scene}
              className={`switcher-option ${settings.activeScreen === scene ? "selected" : ""}`}
              onClick={() => setSelectedScreen(scene)}
            >
              {scene}
            </button>
          ))}
        </div>
      </div>

      <div className="divider"></div>

      <Activity
        mode={settings.activeScreen === "showcase" ? "hidden" : "visible"}
      >
        {/* Mappool Control Panel */}
        <div id="mappool-controls">
          <div className="section-title">Mappool Control</div>

          {/* Red/Blue Input Buttons */}
          <div id="player-select">
            <button
              id="red-input"
              className={
                settings.activePlayer === "player1" ? "red active" : "red"
              }
              onClick={() => setActivePlayer("player1")}
            >
              Red Input
            </button>
            <button
              id="blue-input"
              className={
                settings.activePlayer === "player2" ? "blue active" : "blue"
              }
              onClick={() => setActivePlayer("player2")}
            >
              Blue Input
            </button>
          </div>

          {/* Bans / Picks */}
          <div id="mappool-select">
            <div id="bans" ref={bansDropdownRef}>
              <div id="bans-text">Ban/Unban</div>
              <div
                id="ban-select-id-input"
                className={bansOpen ? "open" : ""}
                onClick={() => setBansOpen(!bansOpen)}
              >
                {bansSelection}
              </div>
              <div
                className={`ban-select-dropdown-options ${bansOpen ? "show" : ""}`}
              >
                {mappoolOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setBansSelection(opt);
                      setBansOpen(false);
                    }}
                  >
                    <BannedOrPicked map={opt} />
                  </div>
                ))}
              </div>
              <button id="bans-confirm" onClick={() => handleConfirm("bans")}>
                Confirm
              </button>
            </div>

            <div id="picks" ref={picksDropdownRef}>
              <div id="picks-text">Pick/Unpick</div>
              <div
                id="pick-select-id-input"
                className={picksOpen ? "open" : ""}
                onClick={() => setPicksOpen(!picksOpen)}
              >
                {picksSelection}
              </div>
              <div
                className={`pick-select-dropdown-options ${picksOpen ? "show" : ""}`}
              >
                {mappoolOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setPicksSelection(opt);
                      setPicksOpen(false);
                    }}
                  >
                    <BannedOrPicked map={opt} />
                  </div>
                ))}
              </div>
              <button id="picks-confirm" onClick={() => handleConfirm("picks")}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      </Activity>

      <Activity
        mode={settings.activeScreen === "showcase" ? "visible" : "hidden"}
      >
        <div id="showcase-switcher">
          <div className="section-title">Showcase Controls</div>
          <div className="switcher-select">
            <div
              id="select-id-input"
              ref={showcaseDropdownRef}
              className={clsx(showcaseOpen && "open")}
              onClick={() => setShowcaseOpen((open) => !open)}
            >
              {settings.showcaseBeatmap}
            </div>
            <div
              className={clsx(
                "select-dropdown-options",
                showcaseOpen && "show",
              )}
            >
              {showcaseBeatmapSlots.map((beatmap) => (
                <div
                  key={`showcase-switcher-${beatmap}`}
                  className={clsx({
                    active: beatmap === settings.showcaseBeatmap,
                  })}
                  onClick={() => {
                    setShowcaseBeatmap(beatmap);
                    setShowcaseOpen(false);
                  }}
                >
                  {beatmap}
                </div>
              ))}
            </div>
            <button
              className="switcher-option"
              onClick={() => toggleShowcasePlaying()}
            >
              <span
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  fontWeight: "bold",
                }}
              >
                {settings.showcasePlaying ? (
                  <>
                    <PauseIcon /> Pause
                  </>
                ) : (
                  <>
                    <PlayIcon /> Play
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </Activity>

      <div className="divider"></div>

      {/* Countdown */}
      <div id="countdown">
        <div className="section-title">Countdown</div>
        <div id="countdown-controls">
          <input
            id="countdown-input"
            type="time"
            value={countdownDate}
            onChange={handleCountdownDateChange}
            step={60}
          />
          <div className="checkbox-input">
            <label htmlFor="show-countdown">Show countdown</label>
            <input
              name="show-countdown"
              id="show-countdown"
              type="checkbox"
              checked={settings.showCountdown}
              onChange={(e) => setCountdownVisibility(e.target.checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
