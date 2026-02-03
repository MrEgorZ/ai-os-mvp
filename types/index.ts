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
export type StepStatus = "todo" | "doing" | "review" | "done";
export type DataStatus = "ok" | "warn" | "missing";

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
  key: string;
  status: DataStatus;
  value_json: any | null;
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
