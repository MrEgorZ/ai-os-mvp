import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, H2 } from "@/components/ui";
import { AI_SERVICES } from "@/lib/services.config";
import PromptBox from "@/components/PromptBox";

type DataKey = "project_profile" | "audience" | "offer" | "competitors" | "references" | "tracking";

const BLOCKS: { key: DataKey; title: string; help: string; defaultTool: string }[] = [
  { key: "project_profile", title: "Профиль проекта", help: "Что продаём, кому, цель, метрики, ограничения, интеграции.", defaultTool: "gpt" },
  { key: "audience", title: "ЦА", help: "Сегменты, боли, триггеры, возражения. Без этого тексты будут мимо.", defaultTool: "gpt" },
  { key: "offer", title: "Оффер", help: "УТП/обещание результата + доказательства + CTA.", defaultTool: "claude" },
  { key: "competitors", title: "Конкуренты", help: "Список конкурентов, их офферы/цены/каналы. Нужно для отстройки.", defaultTool: "perplexity" },
  { key: "references", title: "Референсы", help: "Ссылки/стиль/что нравится и что нельзя. Нужны дизайнеру/верстальщику.", defaultTool: "gpt" },
  { key: "tracking", title: "Аналитика/UTM", help: "UTM и события view/click/submit. Важно для рекламы и конверсии.", defaultTool: "gpt" },
];

export default async function ProjectDataPage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: project } = await sb.from("projects").select("*").eq("id", params.id).single();
  if (!project) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Проект не найден</h1>
      </main>
    );
  }

  const { data: pdata } = await sb.from("project_data").select("*").eq("project_id", params.id);
  const map: Record<string, any> = {};
  for (const row of pdata ?? []) map[row.key] = row;

  async function upsert(formData: FormData) {
    "use server";
    const key = String(formData.get("key") || "") as DataKey;
    const status = String(formData.get("status") || "missing");
    const value_text = String(formData.get("value_text") || "");
    const value_json_raw = String(formData.get("value_json") || "");

    let value_json: any = null;
    if (value_json_raw.trim()) {
      try { value_json = JSON.parse(value_json_raw); } catch { value_json = { raw: value_json_raw }; }
    }

    const sb = supabaseServer();
    await sb.from("project_data").upsert({
      project_id: params.id,
      key,
      status,
      value_text: value_text || null,
      value_json,
    }, { onConflict: "project_id,key" });
  }

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ margin: 0 }}>Данные проекта</h1>
          <div style={{ color: "#555", marginTop: 6 }}>{project.name}</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <Link href={`/projects/${params.id}`}>← К проекту</Link>
          <Link href="/">Дашборд</Link>
        </div>
      </header>

      <H2>Заполняй блоки — шаги будут генерировать промпты с автоподстановкой</H2>
      <div style={{ display: "grid", gap: 12 }}>
        {BLOCKS.map((b) => (
          <Card key={b.key}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 900 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>{b.help}</div>
                <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>
                  Текущий статус: <b>{map[b.key]?.status ?? "missing"}</b>
                </div>
              </div>
              <a href={toolUrl(b.defaultTool)} target="_blank" rel="noreferrer">
                Открыть {b.defaultTool.toUpperCase()} ↗
              </a>
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Заполнить</div>
                <form action={upsert} style={{ display: "grid", gap: 8 }}>
                  <input type="hidden" name="key" value={b.key} />
                  <select name="status" defaultValue={map[b.key]?.status ?? "missing"} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
                    <option value="missing">❌ Нет</option>
                    <option value="warn">⚠️ Частично</option>
                    <option value="ok">✅ Готово</option>
                  </select>
                  <textarea name="value_text" defaultValue={map[b.key]?.value_text ?? ""} placeholder="Вставь сюда текст/заметки" style={{ padding: 10, borderRadius: 10, border: '1px solid #ddd', minHeight: 120 }} />
                  <textarea name="value_json" defaultValue={map[b.key]?.value_json ? JSON.stringify(map[b.key]?.value_json, null, 2) : ""} placeholder="JSON (необязательно). Если не знаешь — оставь пустым." style={{ padding: 10, borderRadius: 10, border: '1px solid #ddd', minHeight: 120 }} />
                  <button type="submit" style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "white", cursor: "pointer" }}>
                    Сохранить
                  </button>
                </form>
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Промпт для сбора этого блока</div>
                <PromptBox blockKey={b.key} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}

function toolUrl(key: string) {
  const svc = AI_SERVICES.find((x) => x.key === key);
  return svc?.url ?? "https://chat.openai.com";
}

