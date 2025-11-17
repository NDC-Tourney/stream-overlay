import { Background } from "~/components/Background";
import { useFlagsQuery } from "~/state/huis";
import { useSettings } from "~/state/dashboard";
import { bracket } from "~/schemas/bracket";
import { motion } from "motion/react";

export function Seeding() {
  const flags = useFlagsQuery();
  const [{ seedingTeam }] = useSettings();
  const team = bracket.Teams.find((t) => t.FullName === seedingTeam);

  if (!flags.data || !team) {
    return;
  }

  const flagsSorted = [...flags.data.regions, ...flags.data.teams]
    .map((e) => ({ ...e, name: Number(e.name) }))
    .toSorted((a, b) => a.name - b.name);
  const flag = flagsSorted.findLast(
    (flag) => flag.name == Number(team.FlagName),
  );

  return (
    <div className="h-full truncate font-sans font-medium tabular-nums">
      <motion.div className="grid h-full grid-cols-[1fr_2fr] place-items-center text-4xl text-white">
        <div className="flex flex-col gap-8 font-semibold">
          <div className="space-y-2">
            {flag && (
              <div className="h-32">
                <img
                  className="h-full rounded-2xl object-scale-down"
                  src={`data:${flag.mime};base64,${flag.data}`}
                />
              </div>
            )}
            <div>{team.FullName}</div>
          </div>
          <div className="flex flex-col gap-6 font-light">
            <div className="text-4xl font-normal">
              <div>Seed #{team.Seed}</div>
            </div>
            <div className="text-3xl">
              <div>
                Average score:{" "}
                {Number(team.QualifiersAverageScore).toLocaleString()}
              </div>
              <div>Carry factor: {team.QualifiersCarryFactor}</div>
            </div>
            <div className="flex w-96 flex-col gap-1.5">
              <div>Players</div>
              <div className="text-3xl">
                {team.Players.map((player) => (
                  <div
                    key={`player-${player.id}`}
                    className="flex justify-between"
                  >
                    <div className="max-w-full truncate font-semibold">
                      {player.Username}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="grid w-5/6 grid-cols-[6fr_1fr_1fr] text-2xl">
          {team.SeedingResults.map((pool) => (
            <div
              key={`seeding-pool-${pool.Mod}`}
              className="col-span-full grid grid-cols-subgrid gap-1"
            >
              <div className="col-span-full mt-8 font-semibold">
                {pool.Mod}{" "}
                <div className="-py-2 ml-4 inline-block rounded-2xl bg-white px-2 font-normal text-black">
                  #{pool.Seed}
                </div>
              </div>
              {pool.Beatmaps.map((map) => (
                <div
                  key={`seeding-pool-${pool.Mod}-${map.ID}`}
                  className="col-span-full grid grid-cols-subgrid place-items-center gap-1 font-light"
                >
                  <div className="max-w-full place-self-start truncate">
                    {map.BeatmapInfo.Metadata.Title} by{" "}
                    {map.BeatmapInfo.Metadata.Artist}
                  </div>
                  <div>{Number(map.Score).toLocaleString()}</div>
                  <div>#{map.Seed}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
      <Background />
    </div>
  );
}
