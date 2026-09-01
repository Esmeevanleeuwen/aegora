"use client";

import {
  BookmarkCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Download,
  ExternalLink,
  FileCheck2,
  FilePlus2,
  FileText,
  FolderLock,
  FolderPlus,
  Folders,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import type { AegoraDocument, AegoraDossier, AegoraProfile, AegoraSavedRight } from "@/lib/personal-data";

type DashboardView = "overzicht" | "rechten" | "dossiers" | "documenten" | "profiel";

type AccountDashboardProps = {
  userId: string;
  email: string;
  initialProfile: AegoraProfile | null;
  initialDossiers: AegoraDossier[];
  initialDocuments: AegoraDocument[];
  initialSavedRights: AegoraSavedRight[];
};

const bucketName = "aegora-private-documents";
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

const categoryLabels: Record<string, string> = {
  zorg: "Zorg",
  werk: "Werk",
  wonen: "Wonen",
  overheid: "Overheid",
  politie_justitie: "Politie & justitie",
  onderwijs: "Onderwijs",
  discriminatie: "Discriminatie",
  contract: "Contract",
  anders: "Anders",
};

const documentLabels: Record<AegoraDocument["document_type"], string> = {
  contract: "Contract",
  brief: "Brief",
  besluit: "Besluit",
  bewijs: "Bewijsstuk",
  zorgdocument: "Zorgdocument",
  overig: "Overig",
};

const categoryByTopic: Record<string, string> = {
  Algemeen: "anders",
  Zorg: "zorg",
  Werk: "werk",
  Wonen: "wonen",
  Veiligheid: "politie_justitie",
  Kinderen: "zorg",
};

function formatDate(value: string | null) {
  if (!value) return "Geen datum";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} kB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function safeFileName(value: string) {
  const normalized = value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-");
  return normalized.replace(/-+/g, "-").replace(/^-|-$/g, "").slice(-120) || "document";
}

export function AccountDashboard({
  userId,
  email,
  initialProfile,
  initialDossiers,
  initialDocuments,
  initialSavedRights,
}: AccountDashboardProps) {
  const [view, setView] = useState<DashboardView>("overzicht");
  const [profile, setProfile] = useState(initialProfile);
  const [dossiers, setDossiers] = useState(initialDossiers);
  const [documents, setDocuments] = useState(initialDocuments);
  const [savedRights, setSavedRights] = useState(initialSavedRights);
  const [documentType, setDocumentType] = useState<AegoraDocument["document_type"]>("contract");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const contracts = useMemo(
    () => documents.filter((document) => document.document_type === "contract"),
    [documents],
  );
  const upcomingDossiers = useMemo(
    () => dossiers
      .filter((dossier) => dossier.next_deadline && dossier.status !== "afgerond")
      .sort((a, b) => (a.next_deadline ?? "").localeCompare(b.next_deadline ?? ""))
      .slice(0, 4),
    [dossiers],
  );

  const displayName = profile?.display_name?.trim() || email.split("@")[0] || "jij";

  function showError(text: string) {
    setNotice({ type: "error", text });
  }

  async function createDossier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    if (title.length < 2) return showError("Geef je dossier een duidelijke titel.");

    setBusy("dossier-create");
    setNotice(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("aegora_dossiers")
      .insert({
        user_id: userId,
        title,
        description: String(formData.get("description") ?? "").trim() || null,
        category: String(formData.get("category") ?? "anders"),
        next_deadline: String(formData.get("next_deadline") ?? "") || null,
      })
      .select("*")
      .single();

    setBusy(null);
    if (error || !data) return showError("Het dossier kon niet worden opgeslagen.");
    setDossiers((current) => [data as AegoraDossier, ...current]);
    setNotice({ type: "success", text: "Dossier opgeslagen." });
    form.reset();
  }

  async function deleteDossier(dossier: AegoraDossier) {
    if (!window.confirm(`Dossier “${dossier.title}” en gekoppelde bestanden verwijderen?`)) return;
    setBusy(`dossier-${dossier.id}`);
    setNotice(null);
    const supabase = createClient();
    const linkedDocuments = documents.filter((document) => document.dossier_id === dossier.id);

    if (linkedDocuments.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove(linkedDocuments.map((document) => document.storage_path));
      if (storageError) {
        setBusy(null);
        return showError("De bestanden konden niet veilig worden verwijderd.");
      }
    }

    const { error } = await supabase.from("aegora_dossiers").delete().eq("id", dossier.id);
    setBusy(null);
    if (error) return showError("Het dossier kon niet worden verwijderd.");
    setDossiers((current) => current.filter((item) => item.id !== dossier.id));
    setDocuments((current) => current.filter((item) => item.dossier_id !== dossier.id));
    setNotice({ type: "success", text: "Dossier en gekoppelde bestanden verwijderd." });
  }

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    const title = String(formData.get("title") ?? "").trim();

    if (!(file instanceof File) || file.size === 0) return showError("Kies eerst een bestand.");
    if (!allowedMimeTypes.has(file.type)) return showError("Gebruik een pdf, Word-bestand, afbeelding of tekstbestand.");
    if (file.size > 10 * 1024 * 1024) return showError("Het bestand mag maximaal 10 MB zijn.");
    if (title.length < 2) return showError("Geef het document een duidelijke titel.");

    setBusy("document-upload");
    setNotice(null);
    const supabase = createClient();
    const dossierId = String(formData.get("dossier_id") ?? "") || null;
    const storagePath = `${userId}/${dossierId ?? "los"}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setBusy(null);
      return showError("Uploaden is niet gelukt. Controleer het bestand en probeer opnieuw.");
    }

    const isContract = documentType === "contract";
    const { data, error } = await supabase
      .from("aegora_documents")
      .insert({
        user_id: userId,
        dossier_id: dossierId,
        title,
        document_type: documentType,
        contract_party: isContract ? String(formData.get("contract_party") ?? "").trim() || null : null,
        contract_start: isContract ? String(formData.get("contract_start") ?? "") || null : null,
        contract_end: isContract ? String(formData.get("contract_end") ?? "") || null : null,
        contract_status: isContract ? String(formData.get("contract_status") ?? "actief") : "niet_van_toepassing",
        storage_path: storagePath,
        original_file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      })
      .select("*")
      .single();

    if (error || !data) {
      await supabase.storage.from(bucketName).remove([storagePath]);
      setBusy(null);
      return showError("De documentgegevens konden niet worden opgeslagen.");
    }

    setBusy(null);
    setDocuments((current) => [data as AegoraDocument, ...current]);
    setNotice({ type: "success", text: "Document veilig toegevoegd." });
    form.reset();
    setDocumentType("contract");
  }

  async function downloadDocument(document: AegoraDocument) {
    setBusy(`download-${document.id}`);
    setNotice(null);
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(document.storage_path, 60);
    setBusy(null);
    if (error || !data?.signedUrl) return showError("Het bestand kon niet worden geopend.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function deleteDocument(document: AegoraDocument) {
    if (!window.confirm(`Document “${document.title}” verwijderen?`)) return;
    setBusy(`document-${document.id}`);
    setNotice(null);
    const supabase = createClient();
    const { error: storageError } = await supabase.storage.from(bucketName).remove([document.storage_path]);
    if (storageError) {
      setBusy(null);
      return showError("Het bestand kon niet veilig worden verwijderd.");
    }
    const { error } = await supabase.from("aegora_documents").delete().eq("id", document.id);
    setBusy(null);
    if (error) return showError("De documentgegevens konden niet worden verwijderd.");
    setDocuments((current) => current.filter((item) => item.id !== document.id));
    setNotice({ type: "success", text: "Document verwijderd." });
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setBusy("profile-save");
    setNotice(null);
    const supabase = createClient();
    const nextProfile = {
      user_id: userId,
      display_name: String(formData.get("display_name") ?? "").trim() || null,
      pronouns: String(formData.get("pronouns") ?? "").trim() || null,
      role_contexts: formData.getAll("role_contexts").map(String),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("aegora_profiles")
      .upsert(nextProfile, { onConflict: "user_id" })
      .select("*")
      .single();
    setBusy(null);
    if (error || !data) return showError("Je profiel kon niet worden opgeslagen.");
    setProfile(data as AegoraProfile);
    setNotice({ type: "success", text: "Profiel opgeslagen." });
  }

  async function removeSavedRight(savedRight: AegoraSavedRight) {
    setBusy(`saved-${savedRight.id}`);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("aegora_saved_rights")
      .delete()
      .eq("id", savedRight.id)
      .eq("user_id", userId);
    setBusy(null);
    if (error) return showError("Het opgeslagen recht kon niet worden verwijderd.");
    setSavedRights((current) => current.filter((item) => item.id !== savedRight.id));
    setNotice({ type: "success", text: "Recht verwijderd uit je overzicht." });
  }

  async function createDossierFromRight(savedRight: AegoraSavedRight) {
    setBusy(`saved-dossier-${savedRight.id}`);
    setNotice(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("aegora_dossiers")
      .insert({
        user_id: userId,
        title: savedRight.right.title,
        description: `${savedRight.right.summary}\n\nEerstvolgende stap: ${savedRight.right.nextStep}`,
        category: categoryByTopic[savedRight.right.topic] ?? "anders",
      })
      .select("*")
      .single();
    setBusy(null);
    if (error || !data) return showError("Van dit recht kon geen dossier worden gemaakt.");
    setDossiers((current) => [data as AegoraDossier, ...current]);
    setNotice({ type: "success", text: "Dossier gemaakt vanuit je opgeslagen recht." });
    setView("dossiers");
  }

  const navigation: Array<{ id: DashboardView; label: string; icon: typeof LayoutDashboard }> = [
    { id: "overzicht", label: "Overzicht", icon: LayoutDashboard },
    { id: "rechten", label: "Opgeslagen rechten", icon: BookmarkCheck },
    { id: "dossiers", label: "Dossiers", icon: Folders },
    { id: "documenten", label: "Contracten & bestanden", icon: FileText },
    { id: "profiel", label: "Mijn gegevens", icon: CircleUserRound },
  ];

  return (
    <section className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-user">
          <span>{displayName.slice(0, 1).toUpperCase()}</span>
          <div><strong>{displayName}</strong><small>{email}</small></div>
        </div>
        <nav aria-label="Persoonlijke omgeving">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={view === id ? "active" : ""} onClick={() => { setView(id); setNotice(null); }}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>
        <div className="dashboard-security"><ShieldCheck size={18} /><div><strong>Privé omgeving</strong><span>Alleen jouw account heeft toegang.</span></div></div>
        <form action={logout}><button className="dashboard-logout" type="submit"><LogOut size={16} /> Uitloggen</button></form>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-heading">
          <div><span className="eyebrow">Persoonlijke omgeving</span><h1>{view === "overzicht" ? `Goed dat je er bent, ${displayName}.` : navigation.find((item) => item.id === view)?.label}</h1></div>
          <div className="dashboard-lock"><LockKeyhole size={15} /> Privé</div>
        </header>

        {notice ? <div className={`dashboard-notice ${notice.type}`}>{notice.type === "success" ? <CheckCircle2 size={17} /> : null}{notice.text}</div> : null}

        {view === "overzicht" ? (
          <div className="dashboard-view">
            <div className="dashboard-stats">
              <article><span><Folders size={19} /></span><strong>{dossiers.length}</strong><small>Dossiers</small></article>
              <article><span><BookmarkCheck size={19} /></span><strong>{savedRights.length}</strong><small>Opgeslagen rechten</small></article>
              <article><span><FileCheck2 size={19} /></span><strong>{contracts.length}</strong><small>Contracten</small></article>
              <article><span><FileText size={19} /></span><strong>{documents.length}</strong><small>Bestanden</small></article>
            </div>
            <div className="dashboard-grid">
              <article className="dashboard-panel">
                <div className="panel-heading"><div><span>Komende momenten</span><h2>Termijnen</h2></div><CalendarDays size={19} /></div>
                {upcomingDossiers.length ? (
                  <div className="deadline-list">{upcomingDossiers.map((dossier) => <button type="button" key={dossier.id} onClick={() => setView("dossiers")}><span>{formatDate(dossier.next_deadline)}</span><strong>{dossier.title}</strong><ChevronRight size={15} /></button>)}</div>
                ) : <div className="empty-state compact"><CalendarDays size={22} /><p>Nog geen termijnen toegevoegd.</p></div>}
              </article>
              <article className="dashboard-panel">
                <div className="panel-heading"><div><span>Laatste toevoegingen</span><h2>Documenten</h2></div><FileText size={19} /></div>
                {documents.length ? (
                  <div className="recent-document-list">{documents.slice(0, 4).map((document) => <button type="button" key={document.id} onClick={() => setView("documenten")}><span><FileText size={16} /></span><div><strong>{document.title}</strong><small>{documentLabels[document.document_type]} · {formatBytes(document.size_bytes)}</small></div><ChevronRight size={15} /></button>)}</div>
                ) : <div className="empty-state compact"><FilePlus2 size={22} /><p>Nog geen documenten toegevoegd.</p></div>}
              </article>
            </div>
            <div className="privacy-strip"><FolderLock size={20} /><div><strong>Openbare rechten en jouw documenten blijven gescheiden.</strong><p>Een bestand uit je account wordt nooit automatisch gebruikt in de openbare bibliotheek of een AI-antwoord.</p></div></div>
          </div>
        ) : null}

        {view === "rechten" ? (
          <div className="dashboard-view">
            <div className="saved-rights-heading">
              <div><span>Van openbare informatie naar je eigen overzicht</span><h2>{savedRights.length} opgeslagen rechten</h2></div>
              <Link href="/rechten">Meer rechten bekijken <ExternalLink size={14} /></Link>
            </div>
            {savedRights.length ? (
              <div className="saved-rights-list">
                {savedRights.map((savedRight) => (
                  <article key={savedRight.id}>
                    <div className="saved-right-topline"><span>{savedRight.right.topic}</span><small>{savedRight.right.type}</small></div>
                    <h3>{savedRight.right.title}</h3>
                    <p>{savedRight.right.summary}</p>
                    <div className="saved-right-next"><strong>Wat kun je nu doen?</strong><p>{savedRight.right.nextStep}</p></div>
                    <div className="saved-right-actions">
                      <button type="button" disabled={busy === `saved-dossier-${savedRight.id}`} onClick={() => createDossierFromRight(savedRight)}>
                        {busy === `saved-dossier-${savedRight.id}` ? <LoaderCircle className="spin" size={15} /> : <FolderPlus size={15} />} Maak dossier
                      </button>
                      <a href={savedRight.right.sourceUrl} target="_blank" rel="noreferrer">Bron <ExternalLink size={13} /></a>
                      <button type="button" className="saved-right-remove" aria-label={`${savedRight.right.title} verwijderen`} disabled={busy === `saved-${savedRight.id}`} onClick={() => removeSavedRight(savedRight)}>
                        {busy === `saved-${savedRight.id}` ? <LoaderCircle className="spin" size={15} /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state saved-rights-empty"><BookmarkCheck size={28} /><h3>Nog geen rechten bewaard</h3><p>Open de openbare rechtenroute en kies bij een kaart voor “Bewaren”.</p><Link href="/rechten">Naar de rechtenroute</Link></div>
            )}
          </div>
        ) : null}

        {view === "dossiers" ? (
          <div className="dashboard-view dashboard-split">
            <form className="dashboard-panel dashboard-form" onSubmit={createDossier}>
              <div className="panel-heading"><div><span>Nieuw overzicht</span><h2>Dossier maken</h2></div><FolderPlus size={19} /></div>
              <label htmlFor="dossier-title">Titel</label>
              <input id="dossier-title" name="title" maxLength={160} placeholder="Bijvoorbeeld: bezwaar tegen besluit" required />
              <label htmlFor="dossier-category">Onderwerp</label>
              <select id="dossier-category" name="category" defaultValue="anders">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <label htmlFor="dossier-description">Korte omschrijving</label>
              <textarea id="dossier-description" name="description" maxLength={5000} rows={4} placeholder="Wat speelt er en wat wil je bijhouden?" />
              <label htmlFor="dossier-deadline">Eerstvolgende termijn <small>(optioneel)</small></label>
              <input id="dossier-deadline" name="next_deadline" type="date" />
              <button type="submit" disabled={busy === "dossier-create"}>{busy === "dossier-create" ? <LoaderCircle className="spin" size={17} /> : <FolderPlus size={17} />} Dossier opslaan</button>
            </form>
            <div className="dashboard-panel">
              <div className="panel-heading"><div><span>Jouw overzicht</span><h2>{dossiers.length} dossiers</h2></div><Folders size={19} /></div>
              {dossiers.length ? <div className="dossier-list">{dossiers.map((dossier) => {
                const linked = documents.filter((document) => document.dossier_id === dossier.id).length;
                return <article key={dossier.id}><div className="dossier-top"><span>{categoryLabels[dossier.category] ?? dossier.category}</span><small>{dossier.status}</small></div><h3>{dossier.title}</h3>{dossier.description ? <p>{dossier.description}</p> : null}<div className="dossier-meta"><span><FileText size={14} /> {linked} bestanden</span><span><CalendarDays size={14} /> {formatDate(dossier.next_deadline)}</span></div><button type="button" aria-label={`${dossier.title} verwijderen`} disabled={busy === `dossier-${dossier.id}`} onClick={() => deleteDossier(dossier)}>{busy === `dossier-${dossier.id}` ? <LoaderCircle className="spin" size={15} /> : <Trash2 size={15} />}</button></article>;
              })}</div> : <div className="empty-state"><Folders size={28} /><h3>Nog geen dossiers</h3><p>Maak links je eerste overzicht.</p></div>}
            </div>
          </div>
        ) : null}

        {view === "documenten" ? (
          <div className="dashboard-view dashboard-split documents-layout">
            <form className="dashboard-panel dashboard-form" onSubmit={uploadDocument}>
              <div className="panel-heading"><div><span>Private opslag</span><h2>Document toevoegen</h2></div><UploadCloud size={19} /></div>
              <label htmlFor="document-title">Titel</label>
              <input id="document-title" name="title" maxLength={180} placeholder="Herkenbare naam" required />
              <label htmlFor="document-type">Soort document</label>
              <select id="document-type" name="document_type" value={documentType} onChange={(event) => setDocumentType(event.target.value as AegoraDocument["document_type"])}>{Object.entries(documentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <label htmlFor="document-dossier">Koppel aan dossier <small>(optioneel)</small></label>
              <select id="document-dossier" name="dossier_id" defaultValue=""><option value="">Geen dossier</option>{dossiers.map((dossier) => <option key={dossier.id} value={dossier.id}>{dossier.title}</option>)}</select>
              {documentType === "contract" ? <div className="contract-fields"><label htmlFor="contract-party">Andere partij <small>(optioneel)</small></label><input id="contract-party" name="contract_party" placeholder="Werkgever, verhuurder of organisatie" /><div><label>Begindatum<input name="contract_start" type="date" /></label><label>Einddatum<input name="contract_end" type="date" /></label></div><label htmlFor="contract-status">Status</label><select id="contract-status" name="contract_status" defaultValue="actief"><option value="actief">Actief</option><option value="verloopt_binnenkort">Verloopt binnenkort</option><option value="verlopen">Verlopen</option><option value="beeindigd">Beëindigd</option></select></div> : null}
              <label className="file-drop" htmlFor="document-file"><UploadCloud size={24} /><strong>Kies een bestand</strong><span>PDF, Word, afbeelding of tekst · maximaal 10 MB</span><input id="document-file" name="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt" required /></label>
              <button type="submit" disabled={busy === "document-upload"}>{busy === "document-upload" ? <LoaderCircle className="spin" size={17} /> : <UploadCloud size={17} />} Veilig uploaden</button>
            </form>
            <div className="dashboard-panel document-library">
              <div className="panel-heading"><div><span>Alleen voor jou</span><h2>{documents.length} bestanden</h2></div><LockKeyhole size={19} /></div>
              {documents.length ? <div className="document-list">{documents.map((document) => <article key={document.id}><span className="document-icon"><FileText size={18} /></span><div><strong>{document.title}</strong><p>{documentLabels[document.document_type]} · {formatBytes(document.size_bytes)}</p>{document.contract_party ? <small>{document.contract_party}</small> : null}</div><div className="document-actions"><button type="button" aria-label={`${document.title} openen`} disabled={busy === `download-${document.id}`} onClick={() => downloadDocument(document)}>{busy === `download-${document.id}` ? <LoaderCircle className="spin" size={15} /> : <Download size={15} />}</button><button type="button" aria-label={`${document.title} verwijderen`} disabled={busy === `document-${document.id}`} onClick={() => deleteDocument(document)}>{busy === `document-${document.id}` ? <LoaderCircle className="spin" size={15} /> : <Trash2 size={15} />}</button></div></article>)}</div> : <div className="empty-state"><FileText size={28} /><h3>Nog geen bestanden</h3><p>Je upload verschijnt hier.</p></div>}
            </div>
          </div>
        ) : null}

        {view === "profiel" ? (
          <div className="dashboard-view profile-layout">
            <form className="dashboard-panel dashboard-form" onSubmit={saveProfile}>
              <div className="panel-heading"><div><span>Persoonlijke voorkeuren</span><h2>Mijn gegevens</h2></div><CircleUserRound size={19} /></div>
              <label htmlFor="profile-email">E-mailadres</label>
              <input id="profile-email" value={email} disabled />
              <label htmlFor="display-name">Naam die je wilt zien</label>
              <input id="display-name" name="display_name" maxLength={120} defaultValue={profile?.display_name ?? ""} />
              <label htmlFor="pronouns">Voornaamwoorden <small>(optioneel)</small></label>
              <input id="pronouns" name="pronouns" maxLength={80} defaultValue={profile?.pronouns ?? ""} placeholder="Bijvoorbeeld: zij/haar" />
              <fieldset><legend>Situaties die je vaker gebruikt</legend><p>Dit verandert alleen jouw snelle selectie.</p><div className="profile-checks">{Object.entries(categoryLabels).slice(0, 8).map(([value, label]) => <label key={value}><input type="checkbox" name="role_contexts" value={value} defaultChecked={profile?.role_contexts.includes(value)} /><span>{label}</span></label>)}</div></fieldset>
              <button type="submit" disabled={busy === "profile-save"}>{busy === "profile-save" ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />} Gegevens opslaan</button>
            </form>
            <aside className="profile-privacy"><ShieldCheck size={24} /><h2>Jouw profiel is niet openbaar.</h2><p>Deze gegevens worden alleen gebruikt om jouw eigen omgeving rustiger en relevanter te maken.</p><ul><li>Geen openbare profielpagina</li><li>Geen documenten in AI-antwoorden</li><li>Geen toegang voor andere gebruikers</li></ul></aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
