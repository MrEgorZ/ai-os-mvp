import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { renderPrompt, missingKeys } from "@/lib/promptEngine";
import { AI_SERVICES } from "@/lib/services.config";
import { Card, H2 } from "@/components/ui";
import CopyButton from "@/components/CopyButton";
import { requireOwnedStep, assertOwnedProjectForAction } from "@/lib/auth/ownership";
import { validateStepUpdateInput, MAX_RESULT_TEXT_LENGTH } from "@/lib/validation/steps";
import { STEP_STATUSES } from "@/lib/constants/stepStatus";

export const dynamic = "force-dynamic";

export default async function StepPage({ params, searchParams }: { params: { id: string; stepId: string }; searchParams: { msg?: string; err?: string } }) {
  const { project, step, sb } = await requireOwnedStep(params.id, params.stepId);

  const { data: pdata } = await sb.from("project_data").select("*").eq("project_id", params.id);
  const pdMap: Record<string, any> = {};
  for (const row of pdata ?? []) pdMap[row.key] = row;

  const missing = missingKeys(step.required_fields ?? [], pdMap);

  const dataForPrompt: any = {};
  for (const k of Object.keys(pdMap)) {
    const row = pdMap[k];
    dataForPrompt[k] = {
      status: row.status,
      text: row.value_text ?? "",
      json: row.value_json ?? null,
      full: row.value_text ?? (row.value_json ? JSON.stringify(row.value_json, null, 2) : ""),
      short: (row.value_text ?? "").slice(0, 400),
    };
  }

  const generated = renderPrompt(step.prompt_template, dataForPrompt);

  async function savePromptAndResult(formData: FormData) {
    "use server";
    const ownership = await assertOwnedProjectForAction(params.id);
    if (!ownership.ok) {
      if (ownership.reason === "unauthorized") redirect("/login");
      redirect(`/projects/${params.id}/steps/${params.stepId}?err=${encodeURIComponent("Проект недоступен")}`);
    }

    const parsed = validateStepUpdateInput(formData);
    if (!parsed.ok) {
      redirect(`/projects/${params.id}/steps/${params.stepId}?err=${encodeURIComponent(parsed.message)}`);
    }

    const { error } = await ownership.sb
      .from("steps")
      .update({
        prompt_last_generated: parsed.promptLastGenerated,
        result_text: parsed.resultText,
        status: parsed.status,
      })
      .eq("id", params.stepId)
      .eq("project_id", params.id);

    if (error) {
      redirect(`/projects/${params.id}/steps/${params.stepId}?err=${encodeURIComponent("Не удалось сохранить шаг")}`);
    }

    revalidatePath(`/projects/${params.id}/steps/${params.stepId}`);
    revalidatePath(`/projects/${params.id}`);
    revalidatePath("/");
    revalidatePath("/projects");
    redirect(`/projects/${params.id}/steps/${params.stepId}?msg=${encodeURIComponent("Шаг сохранён")}`);
  }

  const tool = AI_SERVICES.find((x) => x.key === step.ai_tool_default);
  const toolUrl = tool?.url ?? "https://chat.openai.com";

  return (
    <main style={{ padding: 24, maxWidth: 1050, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>{step.title}</h1>
          <div style={{ color: "#555", marginTop: 6 }}>{project.name}</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <Link href={`/projects/${params.id}`}>← К проекту</Link>
          <Link href={`/projects/${params.id}/data`}>Данные проекта</Link>
        </div>
      </header>

      {searchParams.msg ? (
        <div style={{ border: "1px solid #c7e7c7", background: "#f6fff6", padding: 12, borderRadius: 12, marginTop: 12 }}>
          {searchParams.msg}
        </div>
      ) : null}
      {searchParams.err ? (
        <div style={{ border: "1px solid #f2c7c7", background: "#fff5f5", padding: 12, borderRadius: 12, marginTop: 12 }}>
          {searchParams.err}
        </div>
      ) : null}

      {missing.length ? (
        <div style={{ border: "1px solid #f2c7c7", background: "#fff5f5", padding: 12, borderRadius: 12, marginTop: 12 }}>
          <b>Не хватает данных для корректного промпта:</b> {missing.join(", ")}.{" "}
          <Link href={`/projects/${params.id}/data`}>Заполни данные →</Link>
        </div>
      ) : null}

      <H2>Что делаем</H2>
      <Card>
        <div style={{ color: "#333" }}>{step.description || "—"}</div>
      </Card>

      <H2>Критерии готовности</H2>
      <Card>
        <div style={{ color: "#333", whiteSpace: "pre-wrap" }}>{step.acceptance || "—"}</div>
      </Card>

      <H2>Промпт (с автоподстановкой данных)</H2>
      <Card>
        <textarea readOnly value={generated} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", minHeight: 220 }} />
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <CopyButton text={generated} />
          <a href={toolUrl} target="_blank" rel="noreferrer" style={{ border: "1px solid #ddd", padding: "8px 10px", borderRadius: 10, textDecoration: "none" }}>
            Открыть {String(step.ai_tool_default).toUpperCase()} ↗
          </a>
        </div>
        <div style={{ fontSize: 13, color: "#777", marginTop: 8 }}>
          Данные подставлены автоматически из раздела «Данные проекта».
        </div>
      </Card>

      <H2>Результат шага</H2>
      <form action={savePromptAndResult} style={{ display: "grid", gap: 12 }}>
        <input type="hidden" name="prompt_last_generated" value={generated} />
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div style={{ fontWeight: 800 }}>Вставь сюда ответ из ИИ</div>
            <select name="status" defaultValue={step.status} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
              {STEP_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {labelStatus(status)}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="result_text"
            maxLength={MAX_RESULT_TEXT_LENGTH}
            defaultValue={step.result_text ?? ""}
            placeholder="Вставь результат. Он сохранится в проекте."
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", minHeight: 220, marginTop: 10 }}
          />
        </Card>
        <button type="submit" style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "white", cursor: "pointer" }}>
          Сохранить
        </button>
      </form>
    </main>
  );
}

function labelStatus(status: string) {
  if (status === "todo") return "Сделать";
  if (status === "doing") return "В работе";
  if (status === "review") return "На проверке";
  if (status === "done") return "Готово";
  return status;
}
