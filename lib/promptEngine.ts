type DataMap = Record<string, any>;

function get(obj: any, path: string): string {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return "";
    cur = cur[p];
  }
  if (cur == null) return "";
  return typeof cur === "string" ? cur : JSON.stringify(cur, null, 2);
}

export function renderPrompt(template: string, data: DataMap): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => get(data, key));
}

export function missingKeys(required: string[], projectData: Record<string, { status: string }>): string[] {
  return required.filter((k) => !projectData[k] || projectData[k].status === "missing");
}
