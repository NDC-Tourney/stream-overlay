import z from "zod";

export const screenNames = [
  "start",
  "standby",
  "versus",
  "mappool",
  "scheduling",
  "winner",
] as const;

export const screenNameSchema = z.literal(screenNames);
export type ScreenName = z.infer<typeof screenNameSchema>;
