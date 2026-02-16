export const STEP_STATUSES = ["todo", "doing", "review", "done"] as const;

export type StepStatus = (typeof STEP_STATUSES)[number];

export function isStepStatus(value: string): value is StepStatus {
  return (STEP_STATUSES as readonly string[]).includes(value);
}
