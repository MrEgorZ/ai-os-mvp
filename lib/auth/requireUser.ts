import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function requireUser() {
  const sb = supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }
  return { user: data.user, sb };
}
