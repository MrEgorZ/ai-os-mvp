import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import { AI_SERVICES } from "@/lib/services.config";
import { Card, H2 } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser();

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ margin: 0 }}>Настройки</h1>
          <div style={{ color: "#555", marginTop: 6 }}>MVP: справочный раздел.</div>
        </div>
        <Link href="/">← На дашборд</Link>
      </header>

      <H2>ИИ-сервисы</H2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        {AI_SERVICES.map((s) => (
          <Card key={s.key}>
            <div style={{ fontWeight: 900 }}>{s.nameRu}</div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>{s.roleRu}</div>
            <div style={{ marginTop: 10 }}>
              <a href={s.url} target="_blank" rel="noreferrer">Открыть ↗</a>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
