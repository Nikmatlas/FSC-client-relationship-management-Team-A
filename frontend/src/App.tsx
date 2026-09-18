import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Organisations from "./pages/Organisations";
import  AdminUsers from "./pages/AdminUsers";
import OrganisationsTestBackend from "./pages/OrganisationsTestBackend"; //for backend testing only. Front end use only Organisations.tsx.

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/organisations"
              element={<Organisations />}
            />

            <Route element={<AdminRoute />}>
              {/* for backend testing only */}
              <Route path="/organisations-test-backend" element={<OrganisationsTestBackend />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
