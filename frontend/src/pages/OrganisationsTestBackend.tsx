import { useRef, useState } from "react";
import {
  createOrganisation,
  getOrganisation,
  updateOrganisation,
  archiveOrganisation,
  createStakeholder,
  getStakeholdersByOrganisation,
  deleteStakeholder,
} from "../firebase/firestore";
import type { Organisation } from "../types/organisation";
import type { Stakeholder } from "../types/stakeholder";

type StepStatus = "idle" | "running" | "pass" | "fail";

interface StepResult {
  status: StepStatus;
  detail?: string;
  data?: unknown;
}

const sampleOrganisation = (): Omit<Organisation, "id" | "createdAt" | "updatedAt"> => ({
  name: "QA Test Org",
  type: "Business",
  industry: "Testing",
  country: "Australia",
  website: "https://example.com",
  email: "qa.org@example.com",
  phone: "0000000000",
  relationshipStatus: "prospect",
  pipelineStage: "Prospect",
  ownerId: "qa-script",
  tags: ["qa", "test"],
  notes: "Created by the backend test page.",
  leadScore: 0,
  researchStatus: "",
  businessBrief: "",
  nextAction: "",
  nextFollowUpDate: null,
  archived: false,
});

// Adjust these fields if your actual Stakeholder type differs —
// this is a best guess based on getStakeholdersByOrganisation's query on organisationId.
const sampleStakeholder = (organisationId: string, label: string) =>
  ({
    name: `QA Stakeholder ${label}`,
    organisationId,
    email: `qa.stakeholder.${label.toLowerCase()}@example.com`,
    phone: "0000000000",
    role: "Contact",
  }) as unknown as Omit<Stakeholder, "id" | "createdAt" | "updatedAt">;

const stepIds = [
  "create",
  "retrieve",
  "update",
  "associate",
  "persistence",
  "archive",
] as const;
type StepId = (typeof stepIds)[number];

const stepLabels: Record<StepId, string> = {
  create: "Organisation records can be created",
  retrieve: "Organisation records can be retrieved",
  update: "Organisation records can be updated",
  associate: "Multiple stakeholders can be associated with an organisation",
  persistence: "Data is persisted correctly in Firestore/Database",
  archive: "Organisation records can be archived",
};

export default function OrganisationsTestBackend() {
  // orgId (state) is only for display. orgIdRef is what the test steps actually read from,
  // because setState is async — chaining steps in runAll would otherwise see a stale null
  // on every step after "create" within the same call.
  const orgIdRef = useRef<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const stakeholderIdsRef = useRef<string[]>([]);
  const [stakeholderCount, setStakeholderCount] = useState(0);
  const [cleanupStatus, setCleanupStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [cleanupDetail, setCleanupDetail] = useState<string>("");
  const [results, setResults] = useState<Record<StepId, StepResult>>({
    create: { status: "idle" },
    retrieve: { status: "idle" },
    update: { status: "idle" },
    associate: { status: "idle" },
    persistence: { status: "idle" },
    archive: { status: "idle" },
  });

  const setResult = (id: StepId, result: StepResult) =>
    setResults((prev) => ({ ...prev, [id]: result }));

  const run = async (id: StepId, fn: () => Promise<StepResult>) => {
    setResult(id, { status: "running" });
    try {
      const result = await fn();
      setResult(id, result);
    } catch (err) {
      setResult(id, { status: "fail", detail: String(err) });
    }
  };

  const runCreate = () =>
    run("create", async () => {
      const ref = await createOrganisation(sampleOrganisation());
      orgIdRef.current = ref.id;
      setOrgId(ref.id);
      stakeholderIdsRef.current = [];
      setStakeholderCount(0);
      setCleanupStatus("idle");
      setCleanupDetail("");
      return { status: "pass", detail: `Created with id ${ref.id}`, data: { id: ref.id } };
    });

  const runRetrieve = () =>
    run("retrieve", async () => {
      const id = orgIdRef.current;
      if (!id) return { status: "fail", detail: "Run \"create\" first." };
      const org = await getOrganisation(id);
      if (!org) return { status: "fail", detail: "getOrganisation returned null." };
      return { status: "pass", data: org };
    });

  const runUpdate = () =>
    run("update", async () => {
      const id = orgIdRef.current;
      if (!id) return { status: "fail", detail: "Run \"create\" first." };
      await updateOrganisation(id, { name: "QA Test Org (Updated)" });
      const org = await getOrganisation(id);
      const pass = org?.name === "QA Test Org (Updated)";
      return { status: pass ? "pass" : "fail", data: org };
    });

  const runAssociate = () =>
    run("associate", async () => {
      const id = orgIdRef.current;
      if (!id) return { status: "fail", detail: "Run \"create\" first." };
      await createStakeholder(sampleStakeholder(id, "One")).then((ref) => {
        stakeholderIdsRef.current.push(ref.id);
        setStakeholderCount(stakeholderIdsRef.current.length);
      });
      await createStakeholder(sampleStakeholder(id, "Two")).then((ref) => {
        stakeholderIdsRef.current.push(ref.id);
        setStakeholderCount(stakeholderIdsRef.current.length);
      });
      const stakeholders = await getStakeholdersByOrganisation(id);
      const pass = stakeholders.length >= 2;
      return {
        status: pass ? "pass" : "fail",
        detail: `Found ${stakeholders.length} stakeholder(s) linked to this org.`,
        data: stakeholders,
      };
    });

  const runPersistence = () =>
    run("persistence", async () => {
      const id = orgIdRef.current;
      if (!id) return { status: "fail", detail: "Run \"create\" first." };
      const org = await getOrganisation(id);
      const stakeholders = await getStakeholdersByOrganisation(id);
      const nameOk = org?.name === "QA Test Org (Updated)";
      const stakeholdersOk = stakeholders.length >= 2;
      const pass = nameOk && stakeholdersOk;
      return {
        status: pass ? "pass" : "fail",
        detail: `name updated: ${nameOk}, stakeholders saved: ${stakeholdersOk}`,
        data: { org, stakeholderCount: stakeholders.length },
      };
    });

  const runArchive = () =>
    run("archive", async () => {
      const id = orgIdRef.current;
      if (!id) return { status: "fail", detail: "Run \"create\" first." };
      await archiveOrganisation(id);
      const org = await getOrganisation(id);
      const pass = org?.archived === true && org?.pipelineStage === "Archived";
      return { status: pass ? "pass" : "fail", data: org };
    });

  const runCleanup = async () => {
    setCleanupStatus("running");
    try {
      const ids = stakeholderIdsRef.current;
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        await deleteStakeholder(id);
      }
      stakeholderIdsRef.current = [];
      setStakeholderCount(0);
      setCleanupStatus("done");
      setCleanupDetail(
        `Deleted ${ids.length} stakeholder(s). The org itself can't be hard-deleted — ` +
          `Firestore rules only allow archiving organisations. Remove "${orgIdRef.current}" ` +
          "manually from the Firebase console if you want it gone entirely. Go to Firestore > organisations > select the doc > Delete document.",
      );
    } catch (err) {
      setCleanupStatus("error");
      setCleanupDetail(String(err));
    }
  };

  const runners: Record<StepId, () => void> = {
    create: runCreate,
    retrieve: runRetrieve,
    update: runUpdate,
    associate: runAssociate,
    persistence: runPersistence,
    archive: runArchive,
  };

  const runAll = async () => {
    await runCreate();
    await runRetrieve();
    await runUpdate();
    await runAssociate();
    await runPersistence();
    await runArchive();
  };

  const passCount = Object.values(results).filter((r) => r.status === "pass").length;

  return (
    <div style={{ padding: 24, fontFamily: "monospace", maxWidth: 900, margin: "0 auto" }}>
      <h1>Backend Connectivity Test</h1>
      <p>
        Calls the real Firestore functions from <code>firebase/firestore.ts</code> directly — no REST API,
        matching how the app actually works. Must be logged in (Firestore rules require auth), so keep this
        route inside your protected routes. Visit at <code>/organisations-test-backend</code>.
      </p>

      <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={runAll}>Run all steps in order</button>
        <button
          onClick={runCleanup}
          disabled={cleanupStatus === "running" || stakeholderCount === 0}
        >
          {cleanupStatus === "running" ? "Cleaning up…" : "Delete this run's stakeholders"}
        </button>
        <span>
          {passCount} / {stepIds.length} passing
        </span>
        {orgId && <span>— test org id: <code>{orgId}</code></span>}
      </div>
      {cleanupDetail && (
        <p style={{ fontSize: 12, color: cleanupStatus === "error" ? "crimson" : "inherit" }}>
          {cleanupDetail}
        </p>
      )}
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: -8, marginBottom: 16 }}>
        Note: each "Run all" creates a brand-new QA Test Org doc in Firestore — delete old ones from the
        console periodically.
      </p>

      {stepIds.map((id) => {
        const r = results[id];
        return (
          <div
            key={id}
            style={{
              border: `1px solid ${
                r.status === "pass" ? "green" : r.status === "fail" ? "crimson" : "#999"
              }`,
              borderRadius: 6,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>
                {r.status === "pass" && "✅ "}
                {r.status === "fail" && "❌ "}
                {r.status === "running" && "⏳ "}
                {r.status === "idle" && "⬜ "}
                {stepLabels[id]}
              </strong>
              <button onClick={runners[id]} disabled={r.status === "running"}>
                Run
              </button>
            </div>
            {r.detail && <div style={{ fontSize: 12, marginTop: 6 }}>{r.detail}</div>}
            {r.data !== undefined && (
              <pre style={{ whiteSpace: "pre-wrap", maxHeight: 220, overflow: "auto", fontSize: 12 }}>
                {JSON.stringify(r.data, null, 2)}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}

//Anay make sure to run this test in a safe environment, as it will create and modify data in your Firestore database.
//Dont forget to clean up any test data after running the tests.
