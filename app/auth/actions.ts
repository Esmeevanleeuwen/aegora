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

function messageUrl(path: string, key: "error" | "message", message: string) {
  const params = new URLSearchParams({ [key]: message });
  return `${path}?${params.toString()}`;
}

export async function login(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(messageUrl("/inloggen", "error", "Controleer je e-mailadres en wachtwoord."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(messageUrl("/inloggen", "error", "Inloggen is niet gelukt. Controleer je gegevens."));
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signup(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(messageUrl("/registreren", "error", "Gebruik een geldig e-mailadres en minimaal 8 tekens."));
  }

  const requestHeaders = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL
    ?? requestHeaders.get("origin")
    ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/account`,
    },
  });

  if (error) {
    redirect(messageUrl("/registreren", "error", "Het account kon niet worden gemaakt."));
  }

  revalidatePath("/", "layout");
  if (data.session) redirect("/account");

  redirect(messageUrl("/inloggen", "message", "Controleer je e-mail om je account te bevestigen."));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
