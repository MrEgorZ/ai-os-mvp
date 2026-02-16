export const DATA_KEYS = [
  "project_profile",
  "audience",
  "offer",
  "competitors",
  "references",
  "tracking",
] as const;

export type DataKey = (typeof DATA_KEYS)[number];

export function isDataKey(value: string): value is DataKey {
  return (DATA_KEYS as readonly string[]).includes(value);
}
