import "server-only";

import { z } from "zod";
import {
  publicRoles,
  publicRules,
  publicTopics,
  type PublicRole,
  type PublicRule,
  type PublicTopic,
} from "./public-rights-data";

export type PublicRightsData = {
  roles: PublicRole[];
  rules: PublicRule[];
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

const rightRowsSchema = z.array(z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  rule_type: z.enum(["recht", "plicht", "bevoegdheid", "grens"]),
  applies_when: z.string().min(1),
  boundary: z.string().min(1),
  topic_label: z.string().min(1),
  roles: z.array(z.string().min(1)),
  source_title: z.string().min(1),
  source_url: z.string().url(),
}));

const localData: PublicRightsData = {
  roles: publicRoles,
  rules: publicRules,
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
    const [roleResponse, topicResponse, rightResponse] = await Promise.all([
      request("aegora_roles?select=id,label,description,icon&is_public=eq.true&order=position.asc"),
      request("aegora_topics?select=label&is_public=eq.true&order=position.asc"),
      request("aegora_public_rights?select=id,title,summary,rule_type,applies_when,boundary,topic_label,roles,source_title,source_url&order=position.asc"),
    ]);

    const [roleRows, topicRows, rightRows] = await Promise.all([
      readJson(roleResponse).then((data) => roleRowsSchema.parse(data)),
      readJson(topicResponse).then((data) => topicRowsSchema.parse(data)),
      readJson(rightResponse).then((data) => rightRowsSchema.parse(data)),
    ]);

    if (roleRows.length === 0 || rightRows.length === 0) return localData;

    return {
      roles: roleRows,
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
        sourceTitle: row.source_title,
        sourceUrl: row.source_url,
      })),
      dataSource: "supabase",
    };
  } catch {
    return localData;
  }
}
