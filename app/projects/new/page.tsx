import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ScenarioType } from "@/types";
import { requireUser } from "@/lib/auth/requireUser";
import { DATA_KEYS, isDataKey } from "@/lib/constants/dataKeys";

export const dynamic = "force-dynamic";

function normalizeType(t: string): ScenarioType {
  const allowed = new Set(["site", "bot", "ads", "strategy", "market", "product", "software"]);
  if (allowed.has(t)) return t as ScenarioType;
  return "site";
}

export default async function NewProjectPage({ searchParams }: { searchParams: { type?: string; mode?: string; err?: string } }) {
  await requireUser();

  const type = normalizeType(searchParams.type ?? "site");
  const mode = (searchParams.mode ?? "A") === "B" ? "B" : "A";

  async function createProject(formData: FormData) {
    "use server";
    const type = normalizeType(String(formData.get("type") || "site"));
    const mode = String(formData.get("mode") || "A") === "B" ? "B" : "A";
    const name = String(formData.get("name") || "").trim();

    if (!name) {
      redirect(`/projects/new?type=${type}&mode=${mode}&err=${encodeURIComponent("Название проекта обязательно")}`);
    }

    const { sb, user } = await requireUser();

    const { data: project, error: pErr } = await sb
      .from("projects")
      .insert({ user_id: user.id, type, mode, name })
      .select("id")
      .single();

    if (pErr || !project) {
      redirect(`/projects/new?type=${type}&mode=${mode}&err=${encodeURIComponent("Не удалось создать проект")}`);
    }

    const scenarioKey = `${type}.${mode}`;
    const { data: scen, error: sErr } = await sb
      .from("scenario_definitions")
      .select("definition_json")
      .eq("key", scenarioKey)
      .single();

    if (sErr || !scen) {
      await sb.from("projects").delete().eq("id", project.id).eq("user_id", user.id);
      redirect(`/projects/new?type=${type}&mode=${mode}&err=${encodeURIComponent("Сценарий не найден. Выполни sql/002_seed_scenarios.sql")}`);
    }

    const def = scen.definition_json as any;
    const baseKeys: string[] = Array.isArray(def.required_data_keys)
      ? def.required_data_keys.filter((k: string) => isDataKey(k))
      : [];

    if (baseKeys.length) {
      const { error } = await sb
        .from("project_data")
        .insert(baseKeys.map((k) => ({ project_id: project.id, key: k, status: "missing" })));
      if (error) {
        await sb.from("projects").delete().eq("id", project.id).eq("user_id", user.id);
        redirect(`/projects/new?type=${type}&mode=${mode}&err=${encodeURIComponent("Не удалось создать базовые данные проекта")}`);
      }
    }

    const steps = (def.steps ?? []).map((st: any) => ({
      project_id: project.id,
      scenario_key: String(st.scenario_key ?? `${scenarioKey}.${st.order ?? 0}`),
      title: String(st.title_ru ?? "Шаг"),
      description: st.description_ru ? String(st.description_ru) : "",
      acceptance: st.acceptance_ru ? String(st.acceptance_ru) : "",
      required_fields: Array.isArray(st.required_fields)
        ? st.required_fields.filter((k: string) => isDataKey(k))
        : [],
      ai_tool_default: st.ai_tool_default ?? "gpt",
      prompt_template: String(st.prompt_template_ru ?? ""),
      status: "todo",
      order_index: Number(st.order ?? 0),
    }));

    if (steps.length) {
      const { error } = await sb.from("steps").insert(steps);
      if (error) {
        await sb.from("projects").delete().eq("id", project.id).eq("user_id", user.id);
        redirect(`/projects/new?type=${type}&mode=${mode}&err=${encodeURIComponent("Не удалось создать шаги проекта")}`);
      }
    }

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.id}`);
    redirect(`/projects/${project.id}?msg=${encodeURIComponent("Проект успешно создан")}`);
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Новый проект</h1>
      <p style={{ color: "#555" }}>
        Тип: <b>{type}</b> · Режим: <b>{mode}</b>
      </p>

      {searchParams.err ? (
        <div style={{ border: "1px solid #f2c7c7", background: "#fff5f5", padding: 12, borderRadius: 12, marginTop: 12 }}>
          {searchParams.err}
        </div>
      ) : null}

      <form action={createProject} style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="mode" value={mode} />

        <label style={{ display: "grid", gap: 6 }}>
          <span>Название проекта</span>
          <input
            name="name"
            maxLength={120}
            placeholder="Например: Лендинг для франшизы X"
            required
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>

        <button
          type="submit"
          style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
        >
          Создать проект
        </button>
      </form>

      <div style={{ marginTop: 16, fontSize: 13, color: "#777" }}>
        После создания появится доска проекта. Данные (ЦА/оффер/конкуренты/референсы) заполняй в разделе «Данные проекта».
      </div>
    </main>
  );
}
