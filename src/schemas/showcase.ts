import z from "zod";
import showcaseBeatmapsJson from "./showcase.json";

export const showcaseBeatmapSchema = z.object({
  title: z.string(),
  artist: z.string(),
  difficulty: z.string(),
  mapper: z.string(),
  player: z.string(),
  bpm: z.number(),
  sr: z.number(),
  length: z.string(),
  ar: z.number(),
  cs: z.number(),
  hp: z.number(),
  od: z.number(),
});

const modBracketSchema = z.literal(["NM", "HD", "HR", "DT", "FM", "TB"]);
const modSlotSchema = z.templateLiteral([modBracketSchema, z.number()]);

export const showcaseBeatmapsSchema = z.record(
  modSlotSchema,
  showcaseBeatmapSchema,
);

export const showcaseBeatmaps =
  showcaseBeatmapsSchema.parse(showcaseBeatmapsJson) && showcaseBeatmapsJson;
export const showcaseBeatmapSlots = Object.keys(showcaseBeatmapsJson) as [
  keyof typeof showcaseBeatmapsJson,
];
export type ShowcaseBeatmapSlot = (typeof showcaseBeatmapSlots)[number];
