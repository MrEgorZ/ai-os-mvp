import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { AI_SERVICES } from "@/lib/services.config";
import { SCENARIO_LAUNCHERS } from "@/lib/scenarios.config";
import { Card, H2 } from "@/components/ui";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { sb, user } = await requireUser();

  const { data: projects } = await sb
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(8);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>AI OS</h1>
          <p style={{ marginTop: 8, color: "#555" }}>
            Запускай сценарии → получай автопромпты → сохраняй результаты в проекте.
          </p>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 14 }}>
          <Link href="/projects">Все проекты</Link>
          <Link href="/settings">Настройки</Link>
        </div>
      </header>

      <H2>Запуск проектов</H2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        {SCENARIO_LAUNCHERS.map((s) => (
          <Card key={s.type}>
            <div style={{ fontWeight: 800 }}>{s.titleRu}</div>
            <div style={{ color: "#555", marginTop: 6, fontSize: 13 }}>{s.subtitleRu}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              {s.modes.map((m) => (
                <Link
                  key={m.mode}
                  href={`/projects/new?type=${s.type}&mode=${m.mode}`}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px 10px",
                    borderRadius: 10,
                    textDecoration: "none",
                    fontSize: 13,
                  }}
                  title={m.descriptionRu}
                >
                  {m.titleRu}
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <H2>ИИ-сервисы (комментарии: что лучше для чего)</H2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        {AI_SERVICES.map((svc) => (
          <Card key={svc.key}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900 }}>{svc.nameRu}</div>
                <div style={{ color: "#555", marginTop: 6, fontSize: 13 }}>{svc.roleRu}</div>
              </div>
              <a href={svc.url} target="_blank" rel="noreferrer" style={{ whiteSpace: "nowrap" }}>
                Открыть ↗
              </a>
            </div>

            <div style={{ marginTop: 10, fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Лучше всего для:</div>
              <ul style={{ margin: "0 0 10px 18px" }}>
                {svc.bestForRu.slice(0, 3).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>

              <div style={{ fontWeight: 700, marginBottom: 6 }}>Не лучший выбор, если:</div>
              <ul style={{ margin: "0 0 10px 18px" }}>
                {svc.avoidRu.slice(0, 2).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>

              <div style={{ color: "#555" }}>{svc.whyRu}</div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {svc.quickPromptsRu.slice(0, 2).map((p) => (
                <CopyButton key={p.title} label={p.title} text={p.template} />
              ))}
            </div>
          </Card>
        ))}
      </div>

      <H2>Последние проекты</H2>
      <Card>
        {!projects?.length ? (
          <div style={{ color: "#777" }}>Проектов пока нет. Создай первый — сверху.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {projects.map((p: any) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>
                    <Link href={`/projects/${p.id}`}>{p.name}</Link>
                  </div>
                  <div style={{ fontSize: 13, color: "#555" }}>
                    {String(p.type).toUpperCase()} · режим {p.mode} · {p.status}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#777" }}>
                  {new Date(p.updated_at).toLocaleString("ru-RU")}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}

