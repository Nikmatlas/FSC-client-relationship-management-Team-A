import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Search, User } from "lucide-react";
import {
  createOrganisation,
  createStakeholder,
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

const relationshipStatuses: RelationshipStatus[] = [
  "active",
  "inactive",
];

const emptyForm = {
  name: "",
  contactName: "",
  type: "",
  industry: "",
  country: "",
  website: "",
  email: "",
  phone: "",
  relationshipStatus: "active" as RelationshipStatus,
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

const PAGE_SIZE = 6;

export default function Organisations() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

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

      const organisationRef = await createOrganisation({
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

      if (form.contactName.trim()) {
        await createStakeholder({
          organisationId: organisationRef.id,
          name: form.contactName.trim(),
          position: "",
          email: form.email.trim(),
          phone: form.phone.trim(),
          isPrimary: true,
          notes: "",
        });
      }

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

  const industryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          organisations
            .map((organisation) => (organisation.industry || "").trim())
            .filter(Boolean)
        )
      ).sort(),
    [organisations]
  );

  const regionOptions = useMemo(
    () =>
      Array.from(
        new Set(
          organisations
            .map((organisation) => (organisation.country || "").trim())
            .filter(Boolean)
        )
      ).sort(),
    [organisations]
  );

  const filteredOrganisations = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    return organisations.filter((organisation) => {
      const matchesSearch =
        !searchTerm ||
        (organisation.name || "").toLowerCase().includes(searchTerm) ||
        (organisation.industry || "").toLowerCase().includes(searchTerm) ||
        (organisation.country || "").toLowerCase().includes(searchTerm) ||
        (organisation.pipelineStage || "")
          .toLowerCase()
          .includes(searchTerm);

      const matchesIndustry =
        industryFilter === "all" ||
        (organisation.industry || "").trim() === industryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        organisation.relationshipStatus === statusFilter;

      const matchesRegion =
        regionFilter === "all" ||
        (organisation.country || "").trim() === regionFilter;

      return matchesSearch && matchesIndustry && matchesStatus && matchesRegion;
    });
  }, [organisations, search, industryFilter, statusFilter, regionFilter]);

  const visibleOrganisations = filteredOrganisations.slice(0, visibleCount);

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        <header className="directory-header">
          <div>
            <h1>View All Organisations</h1>
            <p>Manage FSC's organisations and relationships.</p>
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
          <div className="directory-search-wrap">
            <Search size={16} className="directory-search-icon" />
            <input
              type="text"
              className="directory-search"
              placeholder="Search organisations by name or pipeline status..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            />
          </div>

          <div className="directory-filters">
            <select
              className="directory-filter"
              aria-label="Filter by industry"
              value={industryFilter}
              onChange={(event) => {
                setIndustryFilter(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <option value="all">Industry: All</option>
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>

            <select
              className="directory-filter"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              className="directory-filter"
              aria-label="Filter by region"
              value={regionFilter}
              onChange={(event) => {
                setRegionFilter(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <option value="all">Region: All</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="directory-state">Loading organisations…</p>
        ) : filteredOrganisations.length === 0 ? (
          <p className="directory-state">No organisations found.</p>
        ) : (
          <>
            <div className="directory-grid">
              {visibleOrganisations.map((organisation) => (
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

            <div className="directory-footer">
              <p className="directory-count">
                Showing {visibleOrganisations.length} of{" "}
                {filteredOrganisations.length} organisations
              </p>

              {visibleCount < filteredOrganisations.length && (
                <button
                  type="button"
                  className="directory-load-more"
                  onClick={() =>
                    setVisibleCount((count) => count + PAGE_SIZE)
                  }
                >
                  Load More
                </button>
              )}
            </div>
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
                label="Industry Type"
                value={form.industry}
                onChange={(value) => updateField("industry", value)}
              />

              <FormField
                label="Primary Contact Name"
                value={form.contactName}
                onChange={(value) => updateField("contactName", value)}
              />

              <FormField
                label="Primary Contact Email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                type="email"
              />

              <FormField
                label="Primary Contact Phone"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                type="tel"
              />

              <FormField
                label="Location"
                value={form.country}
                onChange={(value) => updateField("country", value)}
              />

              <label style={labelStyle}>
                Status
                <select
                  value={form.relationshipStatus}
                  onChange={(event) =>
                    updateField("relationshipStatus", event.target.value)
                  }
                  style={inputStyle}
                >
                  {relationshipStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="directory-form-actions">
                <button
                  type="submit"
                  className="directory-form-create"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Create Organisation"}
                </button>

                <button
                  type="button"
                  className="directory-form-cancel"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                    setError("");
                  }}
                >
                  Cancel
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
