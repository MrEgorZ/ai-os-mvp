import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { Card, H2 } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { sb, user } = await requireUser();

  const { data: projects } = await sb
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ margin: 0 }}>Проекты</h1>
          <div style={{ color: "#555", marginTop: 6 }}>Возвращайся к любому проекту и доделывай.</div>
        </div>
        <Link href="/">← На дашборд</Link>
      </header>

      <H2>Список</H2>
      <Card>
        {!projects?.length ? (
          <div style={{ color: "#777" }}>Пока пусто.</div>
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
