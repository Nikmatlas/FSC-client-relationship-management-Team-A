import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, User } from "lucide-react";
import {
  archiveOrganisation,
  getOrganisation,
  getStakeholdersByOrganisation,
  updateOrganisation,
} from "../firebase/firestore";
import type {
  Organisation,
  PipelineStage,
  RelationshipStatus,
} from "../types/organisation";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import "./OrganisationProfile.css";

const pipelineStages: PipelineStage[] = [
  "Prospect",
  "Research",
  "Qualified",
  "Outreach",
  "Follow-up",
  "Meeting",
  "Proposal",
  "Negotiation",
  "Partnership",
  "Active Relationship",
  "Completed",
  "Archived",
];

const relationshipStatuses: RelationshipStatus[] = [
  "prospect",
  "active",
  "inactive",
];

type Stakeholder = Awaited<
  ReturnType<typeof getStakeholdersByOrganisation>
>[number];


function readStakeholder(stakeholder: Stakeholder | undefined) {
  if (!stakeholder) {
    return null;
  }

  const record = stakeholder as unknown as Record<string, unknown>;
  return {
    name: record.name ? String(record.name) : "",
    role: record.role ? String(record.role) : "",
    email: record.email ? String(record.email) : "",
    phone: record.phone ? String(record.phone) : "",
    location: record.location ? String(record.location) : "",
  };
}

function formatDate(value: unknown): string {
  if (!value) {
    return "—";
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString(
      "en-AU",
      { day: "numeric", month: "long", year: "numeric" }
    );
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  return "—";
}

function show(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  return String(value);
}

function stageLabel(stage: PipelineStage | undefined): string {
  if (!stage) {
    return "—";
  }

  const index = pipelineStages.indexOf(stage);

  return index >= 0 ? `${index + 1}. ${stage}` : stage;
}

type EditFields = {
  name: string;
  industry: string;
  type: string;
  country: string;
  website: string;
  email: string;
  phone: string;
  relationshipStatus: RelationshipStatus;
  pipelineStage: PipelineStage;
  ownerId: string;
  leadScore: number;
  researchStatus: string;
  businessBrief: string;
  nextAction: string;
};

function toEditFields(organisation: Organisation): EditFields {
  return {
    name: organisation.name ?? "",
    industry: organisation.industry ?? "",
    type: organisation.type ?? "",
    country: organisation.country ?? "",
    website: organisation.website ?? "",
    email: organisation.email ?? "",
    phone: organisation.phone ?? "",
    relationshipStatus: organisation.relationshipStatus ?? "prospect",
    pipelineStage: organisation.pipelineStage ?? "Prospect",
    ownerId: organisation.ownerId ?? "",
    leadScore: organisation.leadScore ?? 0,
    researchStatus: organisation.researchStatus ?? "",
    businessBrief: organisation.businessBrief ?? "",
    nextAction: organisation.nextAction ?? "",
  };
}

export default function OrganisationProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const [form, setForm] = useState<EditFields | null>(null);
  const [newTag, setNewTag] = useState("");
  const [noteDraft, setNoteDraft] = useState("");

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const record = await getOrganisation(id);

      if (!record) {
        setNotFound(true);
        return;
      }

      setOrganisation(record);
      setForm(toEditFields(record));
      setNoteDraft(record.notes ?? "");

      try {
        setStakeholders(await getStakeholdersByOrganisation(id));
      } catch (stakeholderError) {
        console.error(stakeholderError);
        setStakeholders([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load this organisation.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function updateField(field: keyof EditFields, value: string | number) {
    setForm((current) =>
      current ? { ...current, [field]: value } : current
    );
  }

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();

    if (!id || !form) {
      return;
    }

    if (!form.name.trim()) {
      setError("Organisation name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateOrganisation(id, {
        name: form.name.trim(),
        industry: form.industry.trim(),
        type: form.type.trim(),
        country: form.country.trim(),
        website: form.website.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        relationshipStatus: form.relationshipStatus,
        pipelineStage: form.pipelineStage,
        ownerId: form.ownerId.trim(),
        leadScore: Number(form.leadScore),
        researchStatus: form.researchStatus.trim(),
        businessBrief: form.businessBrief.trim(),
        nextAction: form.nextAction.trim(),
      });

      setEditOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTag(event: React.FormEvent) {
    event.preventDefault();

    if (!id || !organisation || !newTag.trim()) {
      return;
    }

    const existing = organisation.tags ?? [];
    const value = newTag.trim();

    if (existing.includes(value)) {
      setTagOpen(false);
      setNewTag("");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateOrganisation(id, { tags: [...existing, value] });

      setNewTag("");
      setTagOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to add tag.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNote(event: React.FormEvent) {
    event.preventDefault();

    if (!id) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateOrganisation(id, { notes: noteDraft.trim() });

      setNoteOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to save note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      "Archive this organisation? It will move to the Archived pipeline stage and be marked inactive."
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await archiveOrganisation(id);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to archive this organisation.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <main className="dashboard-main">
          <p className="profile-state">Loading organisation…</p>
        </main>
      </div>
    );
  }

  if (notFound || !organisation || !form) {
    return (
      <div className="dashboard">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-state">
            <h1>Organisation not found</h1>
            <p>{error || "This organisation may have been removed."}</p>
            <Link className="profile-inline-link" to="/organisations">
              Back to all organisations
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const primary = readStakeholder(stakeholders[0]);
  const secondary = readStakeholder(stakeholders[1]);

  const tags = organisation.tags ?? [];

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        {/* Page header */}
        <header className="profile-top">
          <div className="profile-identity">
            <div className="profile-avatar">
              <Building2 size={22} />
            </div>

            <div>
              <div className="profile-name-row">
                <h1>{organisation.name}</h1>

                <span
                  className={
                    organisation.relationshipStatus === "active"
                      ? "profile-status is-active"
                      : "profile-status is-inactive"
                  }
                >
                  {organisation.relationshipStatus === "active"
                    ? "Active"
                    : "Inactive"}
                </span>

                {organisation.archived && (
                  <span className="profile-status is-archived">Archived</span>
                )}
              </div>

              <p className="profile-industry">
                {show(organisation.industry)}
              </p>
            </div>
          </div>

          <div className="profile-top-actions">
            <button
              type="button"
              className="button-amber"
              onClick={() => navigate(`/organisations/${id}/activities`)}
            >
              See Recent Activity Logs
            </button>

            <button
              type="button"
              className="button-ghost"
              onClick={handleArchive}
              disabled={saving || organisation.archived}
            >
              {organisation.archived ? "Archived" : "Archive"}
            </button>

            <button
              type="button"
              className="button-indigo"
              onClick={() => setEditOpen(true)}
            >
              Edit Profile
            </button>
          </div>
        </header>

        {error && <p className="profile-error">{error}</p>}

        <div className="profile-layout">
          {/* ---------- Left column ---------- */}
          <div className="profile-column">
            <section className="profile-panel">
              <h2>Relationship Details</h2>

              <div className="profile-pair-grid">
                <div>
                  <span className="profile-label">
                    Assigned Relationship Owner
                  </span>
                  <p className="profile-value with-icon">
                    <User size={16} />
                    {show(organisation.ownerId)}
                  </p>
                </div>

                <div>
                  <span className="profile-label">Pipeline Stage</span>
                  <p className="profile-value">
                    {stageLabel(organisation.pipelineStage)}
                  </p>
                </div>

                <div>
                  <span className="profile-label">
                    Relationship Start Date
                  </span>
                  <p className="profile-value">
                    {formatDate(organisation.createdAt)}
                  </p>
                </div>

                <div>
                  <span className="profile-label">Lead Score</span>
                  <p className="profile-value">
                    {show(organisation.leadScore)}
                  </p>
                </div>
              </div>
            </section>

            <section className="profile-panel">
              <h2>Contact Information</h2>

              <dl className="profile-contact-block">
                <div>
                  <dt>Primary Contact</dt>
                  <dd>
                    {primary?.name
                      ? `${primary.name}${primary.role ? ` (${primary.role})` : ""}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{show(primary?.email || organisation.email)}</dd>
                </div>
                <div>
                  <dt>Phone Number</dt>
                  <dd>{show(primary?.phone || organisation.phone)}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{show(primary?.location || organisation.country)}</dd>
                </div>
              </dl>

              <div className="profile-divider" />

              <dl className="profile-contact-block">
                <div>
                  <dt>Secondary Contact</dt>
                  <dd>
                    {secondary?.name
                      ? `${secondary.name}${secondary.role ? ` (${secondary.role})` : ""}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{show(secondary?.email)}</dd>
                </div>
                <div>
                  <dt>Phone Number</dt>
                  <dd>{show(secondary?.phone)}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{show(secondary?.location)}</dd>
                </div>
              </dl>

              {organisation.website && (
                <>
                  <div className="profile-divider" />
                  <dl className="profile-contact-block">
                    <div>
                      <dt>Website</dt>
                      <dd>
                        <a
                          href={
                            organisation.website.startsWith("http")
                              ? organisation.website
                              : `https://${organisation.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {organisation.website}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </>
              )}
            </section>

            <section className="profile-panel">
              <h2>Tags</h2>

              <div className="profile-tag-row">
                {tags.length === 0 ? (
                  <p className="profile-placeholder">No tags added yet…</p>
                ) : (
                  <ul className="profile-tag-list">
                    {tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  className="button-teal"
                  onClick={() => setTagOpen(true)}
                >
                  + Add Tag
                </button>
              </div>
            </section>
          </div>

          {/* ---------- Right column ---------- */}
          <div className="profile-column">
            <section className="profile-panel">
              <h2>Related Opportunities</h2>
              <p className="profile-placeholder">
                Related opportunities listed here…
              </p>
            </section>

            <section className="profile-panel profile-panel-tall">
              <h2>Additional Notes</h2>

              {organisation.notes ? (
                <p className="profile-notes">{organisation.notes}</p>
              ) : (
                <p className="profile-placeholder">
                  Add additional notes here…
                </p>
              )}

              <button
                type="button"
                className="button-teal profile-panel-action"
                onClick={() => {
                  setNoteDraft(organisation.notes ?? "");
                  setNoteOpen(true);
                }}
              >
                + Add Note
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* ---------- Edit Profile modal ---------- */}
      {editOpen && (
        <div
          className="modal-backdrop"
          onClick={() => !saving && setEditOpen(false)}
        >
          <form
            className="modal modal-wide"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSaveProfile}
          >
            <div className="modal-grid">
              <label>
                <span className="profile-label">
                  Assigned Relationship Owner
                </span>
                <input
                  type="text"
                  value={form.ownerId}
                  onChange={(event) =>
                    updateField("ownerId", event.target.value)
                  }
                />
              </label>

              <label>
                <span className="profile-label">Pipeline Stage</span>
                <select
                  value={form.pipelineStage}
                  onChange={(event) =>
                    updateField(
                      "pipelineStage",
                      event.target.value as PipelineStage
                    )
                  }
                >
                  {pipelineStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="modal-divider" />

            <div className="modal-grid">
              <label>
                <span className="profile-label">Organisation</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                />
              </label>

              <label>
                <span className="profile-label">Industry Type</span>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(event) =>
                    updateField("industry", event.target.value)
                  }
                />
              </label>

              <label>
                <span className="profile-label">Status</span>
                <select
                  value={form.relationshipStatus}
                  onChange={(event) =>
                    updateField(
                      "relationshipStatus",
                      event.target.value as RelationshipStatus
                    )
                  }
                >
                  {relationshipStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="profile-label">Organisation Type</span>
                <input
                  type="text"
                  value={form.type}
                  onChange={(event) =>
                    updateField("type", event.target.value)
                  }
                />
              </label>

              <label>
                <span className="profile-label">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                />
              </label>

              <label>
                <span className="profile-label">Phone Number</span>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                />
              </label>

              <label>
                <span className="profile-label">Location</span>
                <input
                  type="text"
                  value={form.country}
                  onChange={(event) =>
                    updateField("country", event.target.value)
                  }
                />
              </label>

              <label>
                <span className="profile-label">Website</span>
                <input
                  type="text"
                  value={form.website}
                  onChange={(event) =>
                    updateField("website", event.target.value)
                  }
                />
              </label>

              <label>
                <span className="profile-label">Lead Score</span>
                <input
                  type="number"
                  value={form.leadScore}
                  onChange={(event) =>
                    updateField("leadScore", Number(event.target.value))
                  }
                />
              </label>

              <label>
                <span className="profile-label">Research Status</span>
                <input
                  type="text"
                  value={form.researchStatus}
                  onChange={(event) =>
                    updateField("researchStatus", event.target.value)
                  }
                />
              </label>
            </div>

            <label className="modal-full">
              <span className="profile-label">Next Action</span>
              <input
                type="text"
                value={form.nextAction}
                onChange={(event) =>
                  updateField("nextAction", event.target.value)
                }
              />
            </label>

            <label className="modal-full">
              <span className="profile-label">Business Brief</span>
              <textarea
                rows={3}
                value={form.businessBrief}
                onChange={(event) =>
                  updateField("businessBrief", event.target.value)
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="submit"
                className="modal-save"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>

              <button
                type="button"
                className="modal-close"
                onClick={() => setEditOpen(false)}
                disabled={saving}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Add Tag modal ---------- */}
      {tagOpen && (
        <div
          className="modal-backdrop"
          onClick={() => !saving && setTagOpen(false)}
        >
          <form
            className="modal modal-small"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleAddTag}
          >
            <h3>Add Tag</h3>

            <label className="modal-full">
              <span className="profile-label">Tag</span>
              <input
                type="text"
                value={newTag}
                autoFocus
                onChange={(event) => setNewTag(event.target.value)}
              />
            </label>

            <div className="modal-actions">
              <button
                type="submit"
                className="modal-save"
                disabled={saving || !newTag.trim()}
              >
                {saving ? "Saving…" : "Save"}
              </button>

              <button
                type="button"
                className="modal-close"
                onClick={() => setTagOpen(false)}
                disabled={saving}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Add Note modal ---------- */}
      {noteOpen && (
        <div
          className="modal-backdrop"
          onClick={() => !saving && setNoteOpen(false)}
        >
          <form
            className="modal modal-medium"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSaveNote}
          >
            <h3>Add Note</h3>

            <label className="modal-full">
              <span className="profile-label">Note</span>
              <textarea
                rows={10}
                value={noteDraft}
                autoFocus
                onChange={(event) => setNoteDraft(event.target.value)}
              />
            </label>

            <div className="modal-actions">
              <button
                type="submit"
                className="modal-save"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>

              <button
                type="button"
                className="modal-close"
                onClick={() => setNoteOpen(false)}
                disabled={saving}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
