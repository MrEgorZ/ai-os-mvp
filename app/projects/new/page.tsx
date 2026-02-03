import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ScenarioType } from "@/types";

function normalizeType(t: string): ScenarioType {
  const allowed = new Set(["site","bot","ads","strategy","market","product","software"]);
  if (allowed.has(t)) return t as ScenarioType;
  return "site";
}

export default async function NewProjectPage({ searchParams }: { searchParams: { type?: string; mode?: string } }) {
  const type = normalizeType(searchParams.type ?? "site");
  const mode = (searchParams.mode ?? "A") === "B" ? "B" : "A";

  async function createProject(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    if (!name) return;

    const sb = supabaseServer();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) redirect("/login");

    const { data: project, error: pErr } = await sb
      .from("projects")
      .insert({ user_id: auth.user.id, type, mode, name })
      .select()
      .single();

    if (pErr || !project) throw new Error(pErr?.message || "Не удалось создать проект");

    const scenarioKey = `${type}.${mode}`;
    const { data: scen, error: sErr } = await sb
      .from("scenario_definitions")
      .select("definition_json")
      .eq("key", scenarioKey)
      .single();

    if (sErr || !scen) {
      redirect(`/projects/${project.id}?warn=${encodeURIComponent("Сценарий не найден. Выполни sql/002_seed_scenarios.sql в Supabase.")}`);
    }

    const def = scen.definition_json as any;
    const baseKeys: string[] = def.required_data_keys ?? [];

    if (baseKeys.length) {
      await sb.from("project_data").insert(
        baseKeys.map((k) => ({ project_id: project.id, key: k, status: "missing" }))
      );
    }

    const steps = (def.steps ?? []).map((st: any) => ({
      project_id: project.id,
      scenario_key: st.scenario_key,
      title: st.title_ru,
      description: st.description_ru ?? "",
      acceptance: st.acceptance_ru ?? "",
      required_fields: st.required_fields ?? [],
      ai_tool_default: st.ai_tool_default ?? "gpt",
      prompt_template: st.prompt_template_ru,
      status: "todo",
      order_index: st.order ?? 0,
    }));

    if (steps.length) await sb.from("steps").insert(steps);

    redirect(`/projects/${project.id}`);
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Новый проект</h1>
      <p style={{ color: "#555" }}>
        Тип: <b>{type}</b> · Режим: <b>{mode}</b>
      </p>

      <form action={createProject} style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Название проекта</span>
          <input
            name="name"
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
