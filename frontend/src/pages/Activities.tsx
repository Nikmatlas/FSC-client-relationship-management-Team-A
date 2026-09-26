import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createActivity,
  getActivitiesByOrganisation,
  getOrganisation,
} from "../firebase/firestore";
import { activityTypes } from "../types/activity";
import type { Activity, ActivityType } from "../types/activity";
import type { Organisation } from "../types/organisation";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import "./OrganisationProfile.css";
import "./Activities.css";

type TypeFilter = "all" | ActivityType;

const emptyForm = {
  name: "",
  type: "Meeting" as ActivityType,
  agenda: "",
  dateTime: "",
  duration: "",
  attendees: "",
  outcomes: "",
  nextFollowUpDate: "",
};

type ActivityForm = typeof emptyForm;

function formatDateTime(value: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDay(value: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-AU", { dateStyle: "medium" });
}

export default function Activities() {
  const { id } = useParams<{ id: string }>();

  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const loadOrganisation = getOrganisation(id)
      .then((record) => {
        if (!cancelled) {
          setOrganisation(record ?? null);
        }
      })
      .catch((err) => {
        console.error(err);

        if (!cancelled) {
          setError("Failed to load this organisation.");
        }
      });

    const loadActivities = getActivitiesByOrganisation(id)
      .then((list) => {
        if (!cancelled) {
          setActivities(list);
        }
      })
      .catch((err) => {
        console.error(err);

        if (!cancelled) {
          setError("Failed to load activity logs.");
        }
      });

    Promise.all([loadOrganisation, loadActivities]).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const filteredActivities = useMemo(
    () =>
      typeFilter === "all"
        ? activities
        : activities.filter((activity) => activity.type === typeFilter),
    [activities, typeFilter]
  );

  function updateField(field: keyof ActivityForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function closeForm() {
    setFormOpen(false);
    setForm(emptyForm);
    setFormError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!id) {
      return;
    }

    if (!form.name.trim() || !form.dateTime) {
      setFormError("Activity name and date are required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await createActivity({
        organisationId: id,
        name: form.name.trim(),
        type: form.type,
        agenda: form.agenda.trim(),
        dateTime: form.dateTime,
        duration: form.duration.trim(),
        attendees: form.attendees.trim(),
        outcomes: form.outcomes.trim(),
        nextFollowUpDate: form.nextFollowUpDate,
      });

      setActivities(await getActivitiesByOrganisation(id));
      setTypeFilter("all");
      closeForm();
    } catch (err) {
      console.error(err);
      setFormError("Failed to save activity.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <main className="dashboard-main">
          <p className="profile-state">Loading activity logs…</p>
        </main>
      </div>
    );
  }

  if (!organisation) {
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

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        <header className="activity-header">
          <div>
            <Link className="profile-inline-link" to={`/organisations/${id}`}>
              ← Back to {organisation.name}
            </Link>
            <h1>Activity Logs</h1>
            <p className="activity-subtitle">
              Meetings, calls and emails with {organisation.name}
            </p>
          </div>

          <button
            type="button"
            className="button-teal"
            onClick={() => setFormOpen(true)}
          >
            + Add Activity
          </button>
        </header>

        {error && <p className="activity-error">{error}</p>}

        <div className="activity-tabs" role="tablist">
          {(["all", ...activityTypes] as TypeFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={typeFilter === option}
              className={
                typeFilter === option ? "activity-tab is-active" : "activity-tab"
              }
              onClick={() => setTypeFilter(option)}
            >
              {option === "all" ? "All" : option}
            </button>
          ))}
        </div>

        {filteredActivities.length === 0 ? (
          <p className="activity-empty">
            {activities.length === 0
              ? "No activities logged yet. Add the first one to start the record."
              : "No activities of this type yet."}
          </p>
        ) : (
          <ul className="activity-list">
            {filteredActivities.map((activity) => {
              const isOpen = expandedId === activity.id;

              return (
                <li key={activity.id} className="activity-item">
                  <button
                    type="button"
                    className="activity-item-head"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setExpandedId(isOpen ? null : activity.id ?? null)
                    }
                  >
                    <span className="activity-type">{activity.type}</span>
                    <span className="activity-name">{activity.name}</span>

                    {activity.nextFollowUpDate && (
                      <span className="activity-followup">
                        Follow-up {formatDay(activity.nextFollowUpDate)}
                      </span>
                    )}

                    <span className="activity-date">
                      {formatDateTime(activity.dateTime)}
                    </span>
                  </button>

                  {isOpen && (
                    <dl className="activity-details">
                      <div>
                        <dt>Agenda</dt>
                        <dd>{activity.agenda || "—"}</dd>
                      </div>
                      <div>
                        <dt>Duration</dt>
                        <dd>{activity.duration || "—"}</dd>
                      </div>
                      <div>
                        <dt>Attendees / Recipients</dt>
                        <dd>{activity.attendees || "—"}</dd>
                      </div>
                      <div>
                        <dt>Outcomes</dt>
                        <dd>{activity.outcomes || "—"}</dd>
                      </div>
                      <div>
                        <dt>Next Follow-up</dt>
                        <dd>{formatDay(activity.nextFollowUpDate)}</dd>
                      </div>
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {formOpen && (
          <div
            className="modal-backdrop"
            onClick={() => !saving && closeForm()}
          >
            <form
              className="modal"
              onClick={(event) => event.stopPropagation()}
              onSubmit={handleSubmit}
            >
              <h3>Add Activity</h3>

              {formError && <p className="activity-error">{formError}</p>}

              <label className="modal-full">
                <span className="profile-label">Activity Name *</span>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={120}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </label>

              <label className="modal-full">
                <span className="profile-label">Activity Type *</span>
                <select
                  required
                  value={form.type}
                  onChange={(event) => updateField("type", event.target.value)}
                >
                  {activityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="modal-full">
                <span className="profile-label">Date and Time *</span>
                <input
                  type="datetime-local"
                  required
                  value={form.dateTime}
                  onChange={(event) =>
                    updateField("dateTime", event.target.value)
                  }
                />
              </label>

              <label className="modal-full">
                <span className="profile-label">Duration</span>
                <input
                  type="text"
                  maxLength={40}
                  placeholder="e.g. 30 minutes"
                  value={form.duration}
                  onChange={(event) =>
                    updateField("duration", event.target.value)
                  }
                />
              </label>

              <label className="modal-full">
                <span className="profile-label">Agenda</span>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.agenda}
                  onChange={(event) => updateField("agenda", event.target.value)}
                />
              </label>

              <label className="modal-full">
                <span className="profile-label">Attendees / Recipients</span>
                <input
                  type="text"
                  maxLength={300}
                  value={form.attendees}
                  onChange={(event) =>
                    updateField("attendees", event.target.value)
                  }
                />
              </label>

              <label className="modal-full">
                <span className="profile-label">Meeting Outcomes</span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  placeholder="Action items, next steps"
                  value={form.outcomes}
                  onChange={(event) =>
                    updateField("outcomes", event.target.value)
                  }
                />
              </label>

              <label className="modal-full">
                <span className="profile-label">Next Follow-up Date</span>
                <input
                  type="date"
                  value={form.nextFollowUpDate}
                  onChange={(event) =>
                    updateField("nextFollowUpDate", event.target.value)
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
                  onClick={closeForm}
                  disabled={saving}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
