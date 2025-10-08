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
  countdown: z.number().optional(),
  player1: playerSettingsSchema,
  player2: playerSettingsSchema,
  lastPickedBy: playerSchema.nullish(),
  activePlayer: playerSchema,
});

export type DashboardSettings = z.infer<typeof settingsSchema>;

export const dashboardMessageSchema = z
  .object({
    type: z.literal("SETTINGS"),
    settings: settingsSchema,
  })
  .or(
    z.object({
      type: z.literal("HELLO"),
      gitCommit: z.string().optional(),
    }),
  );

export type DashboardMessage = z.infer<typeof dashboardMessageSchema>;
