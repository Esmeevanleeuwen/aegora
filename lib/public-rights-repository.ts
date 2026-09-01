import "server-only";

import { z } from "zod";
import {
  publicRoles,
  publicRules,
  publicSituations,
  publicTopics,
  type PublicRole,
  type PublicRule,
  type PublicSituation,
  type PublicTopic,
} from "./public-rights-data";

export type PublicRightsData = {
  roles: PublicRole[];
  rules: PublicRule[];
  situations: PublicSituation[];
  topics: Array<"Alles" | PublicTopic>;
  dataSource: "supabase" | "local";
};

const roleIconSchema = z.enum([
  "users",
  "heart",
  "brain",
  "stethoscope",
  "badge",
  "briefcase",
  "home",
  "family",
]);

const roleRowsSchema = z.array(z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string(),
  icon: roleIconSchema,
}));

const topicRowsSchema = z.array(z.object({
  label: z.string().min(1),
}));

const situationRowsSchema = z.array(z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  description: z.string(),
}));

const rightRowsSchema = z.array(z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  rule_type: z.enum(["recht", "plicht", "bevoegdheid", "grens"]),
  applies_when: z.string().min(1),
  boundary: z.string().min(1),
  practical_note: z.string(),
  next_step: z.string().min(1),
  topic_label: z.string().min(1),
  roles: z.array(z.string().min(1)),
  situations: z.array(z.string().min(1)),
  source_title: z.string().min(1),
  source_url: z.string().url(),
  source_publisher: z.string().min(1),
  source_checked_at: z.string().nullable(),
}));

const localData: PublicRightsData = {
  roles: publicRoles,
  rules: publicRules,
  situations: publicSituations,
  topics: publicTopics,
  dataSource: "local",
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

async function readJson(response: Response) {
  if (!response.ok) throw new Error(`Supabase Data API gaf status ${response.status}.`);
  return response.json() as Promise<unknown>;
}

export async function getPublicRightsData(): Promise<PublicRightsData> {
  const config = getSupabaseConfig();
  if (!config) return localData;

  const request = (path: string) => fetch(`${config.url}/rest/v1/${path}`, {
    headers: { apikey: config.key },
    next: { revalidate: 3600 },
  });

  try {
    const [roleResponse, topicResponse, situationResponse, rightResponse] = await Promise.all([
      request("aegora_roles?select=id,label,description,icon&is_public=eq.true&order=position.asc"),
      request("aegora_topics?select=label&is_public=eq.true&order=position.asc"),
      request("aegora_situations?select=slug,label,description&is_public=eq.true&order=position.asc"),
      request("aegora_public_rights?select=id,title,summary,rule_type,applies_when,boundary,practical_note,next_step,topic_label,roles,situations,source_title,source_url,source_publisher,source_checked_at&order=position.asc"),
    ]);

    const [roleRows, topicRows, situationRows, rightRows] = await Promise.all([
      readJson(roleResponse).then((data) => roleRowsSchema.parse(data)),
      readJson(topicResponse).then((data) => topicRowsSchema.parse(data)),
      readJson(situationResponse).then((data) => situationRowsSchema.parse(data)),
      readJson(rightResponse).then((data) => rightRowsSchema.parse(data)),
    ]);

    if (roleRows.length === 0 || rightRows.length === 0) return localData;

    return {
      roles: roleRows,
      situations: situationRows,
      topics: ["Alles", ...topicRows.map(({ label }) => label)],
      rules: rightRows.map((row) => ({
        id: row.id,
        roles: row.roles,
        topic: row.topic_label,
        type: row.rule_type,
        title: row.title,
        summary: row.summary,
        appliesWhen: row.applies_when,
        boundary: row.boundary,
        practicalNote: row.practical_note,
        nextStep: row.next_step,
        situations: row.situations,
        sourceTitle: row.source_title,
        sourceUrl: row.source_url,
        sourcePublisher: row.source_publisher,
        sourceCheckedAt: row.source_checked_at,
      })),
      dataSource: "supabase",
    };
  } catch {
    return localData;
  }
}
