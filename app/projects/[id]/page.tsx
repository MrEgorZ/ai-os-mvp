import Link from "next/link";
import { Card, H2 } from "@/components/ui";
import { requireOwnedProject } from "@/lib/auth/ownership";
import { DATA_KEYS } from "@/lib/constants/dataKeys";

export const dynamic = "force-dynamic";

const COLS: { key: string; title: string }[] = [
  { key: "todo", title: "Сделать" },
  { key: "doing", title: "В работе" },
  { key: "review", title: "На проверке" },
  { key: "done", title: "Готово" },
];

export default async function ProjectPage({ params, searchParams }: { params: { id: string }; searchParams: { warn?: string; msg?: string; err?: string } }) {
  const { project, sb } = await requireOwnedProject(params.id);

  const { data: steps } = await sb.from("steps").select("*").eq("project_id", params.id).order("order_index", { ascending: true });
  const { data: pdata } = await sb.from("project_data").select("*").eq("project_id", params.id);

  const dataMap: Record<string, any> = {};
  for (const row of pdata ?? []) dataMap[row.key] = row;

  const stepsBy = (status: string) => (steps ?? []).filter((s: any) => s.status === status);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>{project.name}</h1>
          <div style={{ color: "#555", marginTop: 6 }}>
            {String(project.type).toUpperCase()} · режим {project.mode} · {project.status}
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <Link href="/projects">Все проекты</Link>
          <Link href="/">Дашборд</Link>
        </div>
      </header>

      {searchParams.warn ? (
        <div style={{ border: "1px solid #f2c7c7", background: "#fff5f5", padding: 12, borderRadius: 12, marginTop: 12 }}>
          {searchParams.warn}
        </div>
      ) : null}

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

      <H2>Данные проекта (статусы)</H2>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {DATA_KEYS.map((k) => (
            <div key={k} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 800 }}>{labelKey(k)}</div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
                Статус: <b>{dataMap[k]?.status ?? "missing"}</b>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href={`/projects/${params.id}/data`} style={{ border: "1px solid #ddd", padding: "8px 10px", borderRadius: 10, textDecoration: "none" }}>
            Перейти к заполнению данных →
          </Link>
        </div>
      </Card>

      <H2>Доска шагов (Kanban)</H2>
      {!steps?.length ? (
        <Card>
          <div style={{ color: "#777" }}>
            Шагов нет. Скорее всего не засеяны сценарии (sql/002_seed_scenarios.sql).
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {COLS.map((c) => (
            <Card key={c.key}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>{c.title}</div>
              <div style={{ display: "grid", gap: 10 }}>
                {stepsBy(c.key).map((s: any) => (
                  <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                    <div style={{ fontWeight: 800 }}>
                      <Link href={`/projects/${params.id}/steps/${s.id}`}>{s.title}</Link>
                    </div>
                    <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
                      {String(s.ai_tool_default).toUpperCase()} · order {s.order_index}
                    </div>
                  </div>
                ))}
                {!stepsBy(c.key).length ? <div style={{ color: "#aaa", fontSize: 13 }}>—</div> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

function labelKey(k: string) {
  switch (k) {
    case "project_profile": return "Профиль проекта";
    case "audience": return "ЦА";
    case "offer": return "Оффер";
    case "competitors": return "Конкуренты";
    case "references": return "Референсы";
    case "tracking": return "Аналитика/UTM";
    default: return k;
  }
}
