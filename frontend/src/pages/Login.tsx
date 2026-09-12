import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createUserProfile,
  getUserProfile,
} from "../firebase/firestore";

import {
  loginUser,
  loginWithGoogle,
  registerUser,
} from "../firebase/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async () => {
    try {
      setError("");

      if (isRegistering) {
        const result = await registerUser(email, password);

        await createUserProfile(
          result.user.uid,
          result.user.email ?? "",
          result.user.displayName ?? "",
          result.user.photoURL ?? "",
        );
      } else {
        await loginUser(email, password);
      }

      console.log("Authentication successful");

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Authentication failed.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");

      const result = await loginWithGoogle();
      const user = result.user;

      const existingProfile = await getUserProfile(user.uid);

      if (!existingProfile) {
        await createUserProfile(
          user.uid,
          user.email ?? "",
          user.displayName ?? "",
          user.photoURL ?? "",
        );
      }

      console.log("Google authentication successful");

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Google sign-in failed.");
    }
  };

  return (
    <main>
      <h1>FSC CRM</h1>

      <p>
        {isRegistering
          ? "Create your account"
          : "Sign in to your account"}
      </p>

      <button onClick={handleGoogleLogin}>
        Continue with Google
      </button>

      <hr />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button onClick={handleEmailAuth}>
        {isRegistering ? "Create account" : "Login"}
      </button>

      {error && <p>{error}</p>}

      <button
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError("");
        }}
      >
        {isRegistering
          ? "Already have an account? Login"
          : "Create an account"}
      </button>
    </main>
  );
}
