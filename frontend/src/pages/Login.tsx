import { useState } from "react";
import {
  loginUser,
  loginWithGoogle,
  registerUser,
} from "../firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async () => {
    try {
      setError("");

      if (isRegistering) {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }

      console.log("Authentication successful");
    } catch (error) {
      console.error(error);
      setError("Authentication failed. Please check your details.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      await loginWithGoogle();

      console.log("Google authentication successful");
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
