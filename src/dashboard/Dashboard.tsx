import { screenNames, type ScreenName } from "@/schemas/screens";
import { useSettings } from "@/state/dashboard";
import {
  useCurrentMatchesQuery,
  useMappoolQuery,
  type Match,
} from "@/state/huis";
import dayjs from "dayjs";
import { useState, useRef, useEffect, useMemo } from "react";
import { produce } from "immer";

export function Dashboard() {
  const { data: matches } = useCurrentMatchesQuery();
  const [settings, setSettings] = useSettings();
  const autoselect = settings.automaticSelect;

  const selectedMatch = useMemo(() => {
    if (!settings.matchId && matches?.[0]) {
      return matches[0].uid;
    }

    const match = matches?.find((m) => m.uid === settings.matchId);

    return match
      ? `${match.uid} ${match.player1.name} - ${match.player2.name}`
      : "Select";
  }, [matches, settings.matchId]);

  const countdownDate = dayjs(settings.countdown).format("HH:mm");

  const setAutoselect = (value: boolean) => {
    setSettings((prev) => ({ ...prev, automaticSelect: value }));
  };

  const setSelectedScreen = (screen: ScreenName) => {
    setSettings((prev) => ({
      ...prev,
      activeScreen: screen,
      previousScreen: prev.activeScreen,
    }));
  };

  const setSelectedMatch = (match: Match) => {
    setSettings((prev) => ({
      ...prev,
      matchId: match.uid,
      countdown: match.date,
    }));
  };

  const setActivePlayer = (player: "player1" | "player2") => {
    setSettings((prev) => ({
      ...prev,
      activePlayer: player,
    }));
  };

  // Match ID dropdown
  const [matchIsOpen, setMatchOpen] = useState(false);
  const matchDropdownRef = useRef<HTMLDivElement | null>(null);

  const { beatmaps } = useMappoolQuery();
  const mappoolOptions = Object.values(beatmaps)
    .flat()
    .map((map) => map.modBracket + map.modBracketIndex);

  // Bans & Picks dropdown
  const [bansSelection, setBansSelection] = useState("Select");
  const [bansOpen, setBansOpen] = useState(false);
  const [picksSelection, setPicksSelection] = useState("Select");
  const [picksOpen, setPicksOpen] = useState(false);
  const bansDropdownRef = useRef<HTMLDivElement | null>(null);
  const picksDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleConfirm = (pickOrBan: "bans" | "picks") => {
    const map = pickOrBan === "bans" ? bansSelection : picksSelection;
    if (!mappoolOptions.includes(map)) {
      return;
    }

    setSettings(
      produce((prev) => {
        const prevSelection = prev[prev.activePlayer];
        if (!prevSelection[pickOrBan].includes(map)) {
          prevSelection[pickOrBan].push(map);

          const other = pickOrBan === "bans" ? "picks" : "bans";
          if (prevSelection[other].includes(map)) {
            prevSelection[other] = prevSelection[other].filter(
              (m) => m !== map,
            );
          }
        } else {
          prevSelection[pickOrBan] = prevSelection[pickOrBan].filter(
            (m) => m !== map,
          );
        }
        prev.lastPickedBy = map.includes("TB") ? null : prev.activePlayer;

        prev.activePlayer =
          prev.activePlayer === "player1" ? "player2" : "player1";
      }),
    );
    pickOrBan === "picks"
      ? setPicksSelection("Confirmed!")
      : setBansSelection("Confirmed");
  };

  const handleCountdownDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let parsedTime = dayjs(e.target.value, "HH:mm");
    const now = dayjs();
    if (parsedTime.isBefore(now)) {
      parsedTime = parsedTime.add(1, "day");
    }

    setSettings((prev) => ({
      ...prev,
      countdown: parsedTime.toDate(),
    }));
    console.log("Selected date and time:", parsedTime.toDate());
  };

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
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

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
        <div id="match-select-auto">
          <label
            htmlFor="match-select-auto-checkbox"
            id="match-select-auto-text"
          >
            Auto-select match from lobby name:
          </label>
          <input
            type="checkbox"
            id="match-select-auto-checkbox"
            name="autoselect"
            checked={autoselect}
            onChange={(e) => setAutoselect(e.target.checked)}
          ></input>
        </div>
      </div>

      <div className="divider"></div>

      {/* Scene Switcher */}
      <div id="scene-switcher">
        <div id="scene-switcher-text">Scene Switcher</div>
        <div id="scene-switcher-select">
          {screenNames.map((scene) => (
            <button
              key={scene}
              className={`scene-switcher-option ${settings.activeScreen === scene ? "selected" : ""}`}
              onClick={() => setSelectedScreen(scene)}
            >
              {scene}
            </button>
          ))}
        </div>
      </div>

      <div className="divider"></div>

      {/* Mappool Control Panel */}
      <div id="mappool-controls">
        <div id="mappool-controls-text">Mappool Control Panel</div>

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
                  {opt}
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
                  {opt}
                </div>
              ))}
            </div>
            <button id="picks-confirm" onClick={() => handleConfirm("picks")}>
              Confirm
            </button>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Countdown */}
      <div id="countdown">
        <div id="countdown-text">Countdown</div>
        <input
          id="countdown-input"
          type="time"
          value={countdownDate}
          onChange={handleCountdownDateChange}
          step={60}
        ></input>
      </div>
    </div>
  );
}
