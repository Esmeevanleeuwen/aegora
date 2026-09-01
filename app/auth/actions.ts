"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.email().max(320),
  password: z.string().min(8).max(128),
});

function safeNextPath(value: FormDataEntryValue | null, fallback = "/account") {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}

function messageUrl(path: string, key: "error" | "message", message: string, next?: string) {
  const params = new URLSearchParams({ [key]: message });
  if (next) params.set("next", next);
  return `${path}?${params.toString()}`;
}

export async function login(formData: FormData) {
  const next = safeNextPath(formData.get("next"));
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(messageUrl("/inloggen", "error", "Controleer je e-mailadres en wachtwoord.", next));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(messageUrl("/inloggen", "error", "Inloggen is niet gelukt. Controleer je gegevens.", next));
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signup(formData: FormData) {
  const next = safeNextPath(formData.get("next"));
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(messageUrl("/registreren", "error", "Gebruik een geldig e-mailadres en minimaal 8 tekens.", next));
  }

  const requestHeaders = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL
    ?? requestHeaders.get("origin")
    ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(messageUrl("/registreren", "error", "Het account kon niet worden gemaakt.", next));
  }

  revalidatePath("/", "layout");
  if (data.session) redirect(next);

  redirect(messageUrl("/inloggen", "message", "Controleer je e-mail om je account te bevestigen.", next));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
