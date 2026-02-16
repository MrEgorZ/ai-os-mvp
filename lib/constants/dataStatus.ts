export const DATA_STATUSES = ["ok", "warn", "missing"] as const;

export type DataStatus = (typeof DATA_STATUSES)[number];

export function isDataStatus(value: string): value is DataStatus {
  return (DATA_STATUSES as readonly string[]).includes(value);
}
