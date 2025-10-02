import z from "zod";
import { screenNameSchema } from "./screens";

export const playerSchema = z.literal(["player1", "player2"]);

export const playerSettingsSchema = z.object({
  bans: z.array(z.string()),
  picks: z.array(z.string()),
});

export const settingsSchema = z.object({
  matchId: z.number(),
  automaticSelect: z.boolean(),
  activeScreen: screenNameSchema,
  previousScreen: screenNameSchema.optional(),
  countdown: z.coerce.date().optional(),
  player1: playerSettingsSchema,
  player2: playerSettingsSchema,
  lastPickedBy: playerSchema.nullish(),
  activePlayer: playerSchema,
});

export type DashboardSettings = z.infer<typeof settingsSchema>;

export const settingsMessageSchema = z.object({
  type: z.literal("SETTINGS"),
  settings: settingsSchema,
});

export type SettingsMessage = z.infer<typeof settingsMessageSchema>;
