import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: { next?: string; err?: string; msg?: string } }) {
  const next = searchParams.next || "/";

  const sb = supabaseServer();
  const { data } = await sb.auth.getUser();
  if (data.user) redirect(next);

  async function signIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const sb = supabaseServer();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) redirect(`/login?next=${encodeURIComponent(next)}&err=${encodeURIComponent(error.message)}`);
    redirect(next);
  }

  async function signUp(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const sb = supabaseServer();
    const { error } = await sb.auth.signUp({ email, password });
    if (error) redirect(`/login?next=${encodeURIComponent(next)}&err=${encodeURIComponent(error.message)}`);
    redirect(`/login?next=${encodeURIComponent(next)}&msg=${encodeURIComponent("Аккаунт создан. Если включено подтверждение email — проверь почту и затем войди.")}`);
  }

  const err = searchParams.err;
  const msg = searchParams.msg;

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Вход в AI OS</h1>
      <p style={{ color: "#555" }}>Логин обязателен. Проекты привязаны к твоему аккаунту.</p>

      {err ? (
        <div style={{ border: "1px solid #f2c7c7", background: "#fff5f5", padding: 12, borderRadius: 12, marginTop: 12 }}>
          Ошибка: {err}
        </div>
      ) : null}

      {msg ? (
        <div style={{ border: "1px solid #c7e7c7", background: "#f6fff6", padding: 12, borderRadius: 12, marginTop: 12 }}>
          {msg}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18, marginTop: 18 }}>
        <form action={signIn} style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
          <b>Войти</b>
          <label style={{ display: "grid", gap: 6 }}>
            Email
            <input name="email" type="email" required style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            Пароль
            <input name="password" type="password" required style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          </label>
          <button type="submit" style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "white", cursor: "pointer" }}>
            Войти
          </button>
        </form>

        <form action={signUp} style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
          <b>Создать аккаунт</b>
          <label style={{ display: "grid", gap: 6 }}>
            Email
            <input name="email" type="email" required style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            Пароль
            <input name="password" type="password" required style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          </label>
          <div style={{ fontSize: 13, color: "#555" }}>
            Для MVP — простой email+пароль. Подтверждение email настраивается в Supabase.
          </div>
          <button type="submit" style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "white", cursor: "pointer" }}>
            Создать
          </button>
        </form>
      </div>
    </main>
  );
}
