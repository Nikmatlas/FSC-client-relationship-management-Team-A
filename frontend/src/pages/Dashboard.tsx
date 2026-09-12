import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <main>
      <h1>FSC CRM Dashboard</h1>

      <p>
        Welcome, {profile?.displayName || "User"}
      </p>

      <p>
        Role: {profile?.role || "Unknown"}
      </p>
    </main>
  );
}
