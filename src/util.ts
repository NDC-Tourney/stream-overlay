export type WithOptional<T, U extends keyof T> = Pick<
  T,
  Exclude<keyof T, U>
> & {
  [K in U]?: T[K] | undefined;
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export function getAvatarUrl(userId: number | string) {
  return `https://a.ppy.sh/${userId}`;
}

export function getBeatmapBgUrl(setId?: number) {
  if (!setId) {
    return null;
  }

  return `https://assets.ppy.sh/beatmaps/${setId}/covers/cover.jpg`;
}

export const isProduction = process.env.NODE_ENV === "production";
