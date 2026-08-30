export type AegoraProfile = {
  user_id: string;
  display_name: string | null;
  pronouns: string | null;
  role_contexts: string[];
  created_at: string;
  updated_at: string;
};

export type AegoraDossier = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  status: "open" | "gepauzeerd" | "afgerond";
  next_deadline: string | null;
  created_at: string;
  updated_at: string;
};

export type AegoraDocument = {
  id: string;
  user_id: string;
  dossier_id: string | null;
  title: string;
  document_type: "contract" | "brief" | "besluit" | "bewijs" | "zorgdocument" | "overig";
  contract_party: string | null;
  contract_start: string | null;
  contract_end: string | null;
  contract_status: "actief" | "verloopt_binnenkort" | "verlopen" | "beeindigd" | "niet_van_toepassing";
  storage_path: string;
  original_file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  updated_at: string;
};
