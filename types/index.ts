import type { DataKey } from "@/lib/constants/dataKeys";
import type { DataStatus } from "@/lib/constants/dataStatus";
import type { StepStatus } from "@/lib/constants/stepStatus";

export type AiToolKey = "gpt" | "claude" | "gemini" | "perplexity" | "wavespeed";

export type ScenarioType =
  | "site"
  | "bot"
  | "ads"
  | "strategy"
  | "market"
  | "product"
  | "software";

export type ProjectStatus = "in_progress" | "paused" | "done";

export type Project = {
  id: string;
  user_id: string;
  type: ScenarioType;
  mode: "A" | "B";
  name: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type ProjectDataRow = {
  id: string;
  project_id: string;
  key: DataKey;
  status: DataStatus;
  value_json: unknown | null;
  value_text: string | null;
  updated_at: string;
};

export type StepRow = {
  id: string;
  project_id: string;
  scenario_key: string;
  title: string;
  description: string | null;
  acceptance: string | null;
  required_fields: string[];
  ai_tool_default: AiToolKey;
  prompt_template: string;
  prompt_last_generated: string | null;
  result_text: string | null;
  status: StepStatus;
  order_index: number;
  updated_at: string;
};
