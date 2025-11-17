import bracketJson from "./bracket.json";

bracketJson.Teams = bracketJson.Teams.toSorted(
  (a, b) => Number(b.Seed) - Number(a.Seed),
);

export const bracket = bracketJson;
