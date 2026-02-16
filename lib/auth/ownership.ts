import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/requireUser";

export async function requireOwnedProject(projectId: string) {
  const { user, sb } = await requireUser();

  const { data: project } = await sb
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    notFound();
  }

  return { project, user, sb };
}

export async function requireOwnedStep(projectId: string, stepId: string) {
  const { user, sb } = await requireUser();

  const { data: project } = await sb
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    notFound();
  }

  const { data: step } = await sb
    .from("steps")
    .select("*")
    .eq("id", stepId)
    .eq("project_id", projectId)
    .single();

  if (!step) {
    notFound();
  }

  return { project, step, user, sb };
}

export async function assertOwnedProjectForAction(projectId: string) {
  const sb = supabaseServer();
  const { data } = await sb.auth.getUser();

  if (!data.user) {
    return { ok: false as const, reason: "unauthorized" as const, sb };
  }

  const { data: project } = await sb
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", data.user.id)
    .single();

  if (!project) {
    return { ok: false as const, reason: "forbidden" as const, sb };
  }

  return { ok: true as const, user: data.user, sb };
}
