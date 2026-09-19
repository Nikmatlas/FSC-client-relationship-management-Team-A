import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, User } from "lucide-react";
import {
  createOrganisation,
  getOrganisations,
} from "../firebase/firestore";
import type {
  Organisation,
  PipelineStage,
  RelationshipStatus,
} from "../types/organisation";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import "./Organisations.css";

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

const emptyForm = {
  name: "",
  type: "",
  industry: "",
  country: "",
  website: "",
  email: "",
  phone: "",
  relationshipStatus: "prospect" as RelationshipStatus,
  pipelineStage: "Prospect" as PipelineStage,
  ownerId: "",
  tags: "",
  notes: "",
  leadScore: 0,
  researchStatus: "",
  businessBrief: "",
  nextAction: "",
  nextFollowUpDate: "",
  archived: false,
};

export default function Organisations() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadOrganisations();
  }, []);

  async function loadOrganisations() {
    try {
      setLoading(true);
      setError("");

      const data = await getOrganisations();

      setOrganisations(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load organisations.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof typeof emptyForm,
    value: string | number | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Organisation name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createOrganisation({
        name: form.name.trim(),
        type: form.type.trim(),
        industry: form.industry.trim(),
        country: form.country.trim(),
        website: form.website.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),

        relationshipStatus: form.relationshipStatus,
        pipelineStage: form.pipelineStage,

        ownerId: form.ownerId.trim(),

        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        notes: form.notes.trim(),

        leadScore: Number(form.leadScore),

        researchStatus: form.researchStatus.trim(),
        businessBrief: form.businessBrief.trim(),

        nextAction: form.nextAction.trim(),
        nextFollowUpDate: form.nextFollowUpDate || null,

        archived: form.archived,
      });

      setForm(emptyForm);
      setShowForm(false);

      await loadOrganisations();
    } catch (err) {
      console.error(err);
      setError("Failed to create organisation.");
    } finally {
      setSaving(false);
    }
  }

  const filteredOrganisations = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    if (!searchTerm) {
      return organisations;
    }

    return organisations.filter((organisation) => {
      return (
        (organisation.name || "").toLowerCase().includes(searchTerm) ||
        (organisation.industry || "").toLowerCase().includes(searchTerm) ||
        (organisation.country || "").toLowerCase().includes(searchTerm) ||
        (organisation.pipelineStage || "")
          .toLowerCase()
          .includes(searchTerm)
      );
    });
  }, [organisations, search]);

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        <header className="directory-header">
          <div>
            <h1>Organisations</h1>
            <p>Manage FSC organisations and relationships.</p>
          </div>

          <button
            className="directory-add-button"
            onClick={() => setShowForm(true)}
          >
            + Add Organisation
          </button>
        </header>

        {error && <p className="directory-error">{error}</p>}

        <div className="directory-toolbar">
          <input
            type="text"
            className="directory-search"
            placeholder="Search organisations by name or pipeline status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p className="directory-state">Loading organisations…</p>
        ) : filteredOrganisations.length === 0 ? (
          <p className="directory-state">No organisations found.</p>
        ) : (
          <>
            <div className="directory-grid">
              {filteredOrganisations.map((organisation) => (
                <Link
                  key={organisation.id}
                  to={`/organisations/${organisation.id}`}
                  className="directory-card"
                >
                  <div className="directory-card-top">
                    <div className="directory-card-icon">
                      <Building2 size={18} />
                    </div>

                    <span
                      className={
                        organisation.relationshipStatus === "active"
                          ? "directory-badge is-active"
                          : "directory-badge is-inactive"
                      }
                    >
                      {organisation.relationshipStatus === "active"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <p className="directory-card-name">
                    {organisation.name || "Untitled organisation"}
                  </p>

                  <p className="directory-card-industry">
                    {organisation.industry || "—"}
                  </p>

                  <div className="directory-card-footer">
                    <span className="directory-card-contact">
                      <User size={14} />
                      <span>{organisation.ownerId || "Unassigned"}</span>
                    </span>

                    <span className="directory-card-country">
                      {organisation.country || "—"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <p className="directory-count">
              Showing {filteredOrganisations.length} of{" "}
              {organisations.length} organisations
            </p>
          </>
        )}

        {showForm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.4)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              zIndex: 100,
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "10px",
                width: "100%",
                maxWidth: "700px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <h2>Add Organisation</h2>

              <FormField
                label="Organisation Name *"
                value={form.name}
                onChange={(value) => updateField("name", value)}
              />

              <FormField
                label="Type"
                value={form.type}
                onChange={(value) => updateField("type", value)}
              />

              <FormField
                label="Industry"
                value={form.industry}
                onChange={(value) => updateField("industry", value)}
              />

              <FormField
                label="Country"
                value={form.country}
                onChange={(value) => updateField("country", value)}
              />

              <FormField
                label="Website"
                value={form.website}
                onChange={(value) => updateField("website", value)}
              />

              <FormField
                label="Email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
              />

              <FormField
                label="Phone"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
              />

              <FormField
                label="Owner ID"
                value={form.ownerId}
                onChange={(value) => updateField("ownerId", value)}
              />

              <label style={labelStyle}>
                Relationship Status
                <select
                  value={form.relationshipStatus}
                  onChange={(event) =>
                    updateField("relationshipStatus", event.target.value)
                  }
                  style={inputStyle}
                >
                  {relationshipStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                Pipeline Stage
                <select
                  value={form.pipelineStage}
                  onChange={(event) =>
                    updateField("pipelineStage", event.target.value)
                  }
                  style={inputStyle}
                >
                  {pipelineStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>

              <FormField
                label="Tags"
                value={form.tags}
                onChange={(value) => updateField("tags", value)}
                placeholder="food, NGO, partner"
              />

              <FormField
                label="Lead Score"
                value={String(form.leadScore)}
                onChange={(value) =>
                  updateField("leadScore", Number(value) || 0)
                }
                type="number"
              />

              <FormField
                label="Research Status"
                value={form.researchStatus}
                onChange={(value) => updateField("researchStatus", value)}
              />

              <FormField
                label="Business Brief"
                value={form.businessBrief}
                onChange={(value) => updateField("businessBrief", value)}
                textarea
              />

              <FormField
                label="Notes"
                value={form.notes}
                onChange={(value) => updateField("notes", value)}
                textarea
              />

              <FormField
                label="Next Action"
                value={form.nextAction}
                onChange={(value) => updateField("nextAction", value)}
              />

              <FormField
                label="Next Follow-up Date"
                value={form.nextFollowUpDate}
                onChange={(value) =>
                  updateField("nextFollowUpDate", value)
                }
                type="date"
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                    setError("");
                  }}
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Create Organisation"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label style={labelStyle}>
      {label}

      {textarea ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          style={{
            ...inputStyle,
            minHeight: "90px",
            resize: "vertical",
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          style={inputStyle}
        />
      )}
    </label>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginTop: "14px",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};
