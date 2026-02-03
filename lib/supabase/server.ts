import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase server client (Next.js App Router).
 *
 * ВАЖНО: В Server Components Next.js запрещает менять cookies (cookies().set),
 * поэтому set/remove обёрнуты в try/catch. В Route Handlers и Server Actions
 * cookies менять можно — там всё будет работать штатно.
 */
export function supabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Components: менять cookies нельзя — игнорируем.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            // Server Components: менять cookies нельзя — игнорируем.
          }
        },
      },
    }
  );
}
