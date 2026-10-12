
import { useState } from "react";
import api from "./api";

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      if (isRegister) {
        const response = await api.post("/auth/register", {
          name: name.trim(),
          email: email.trim(),
          password,
        });

        setMessage(
          typeof response.data === "string"
            ? response.data
            : "Account created successfully! You can now log in."
        );
        setMessageType("success");
        setIsRegister(false);
        setPassword("");
      } else {
        const response = await api.post("/auth/login", {
          email: email.trim(),
          password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", response.data.name || "");

        onLogin();
      }
    } catch (error) {
      console.error("Authentication error:", error);

      let errorText =
        "Something went wrong. Please try again.";

      if (error.response) {
        const data = error.response.data;

        errorText =
          typeof data === "string"
            ? data
            : data?.message ||
              data?.error ||
              "Invalid details or request. Please check and try again.";
      } else if (error.request) {
        errorText =
          "Cannot connect to the backend. Check whether Spring Boot is running on port 8080.";
      }

      setMessage(errorText);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsRegister((previous) => !previous);
    setMessage("");
    setMessageType("");
    setPassword("");
    setShowPassword(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />
      <div className="auth-grid" />

      <section className="auth-layout">
        <aside className="auth-intro">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M20 8v6m3-3h-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span>People<span className="brand-accent">Flow</span></span>
          </div>

          <div className="auth-intro-content">
            <span className="auth-eyebrow">
              <span className="eyebrow-dot" />
              EMPLOYEE MANAGEMENT PLATFORM
            </span>

            <h1>
              Great teams.
              <br />
              <span>Better work.</span>
            </h1>

            <p className="auth-intro-text">
              Bring your people, departments, and workforce
              insights together in one simple workspace.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span className="feature-check">✓</span>
                <span>Manage employees in one place</span>
              </div>
              <div className="auth-feature">
                <span className="feature-check">✓</span>
                <span>Track departments and salary reports</span>
              </div>
              <div className="auth-feature">
                <span className="feature-check">✓</span>
                <span>Make informed workforce decisions</span>
              </div>
            </div>
          </div>

          <p className="auth-side-footer">
            YOUR WORKFORCE, ORGANIZED.
          </p>
        </aside>

        <section className="auth-card">
          <div className="auth-card-top">
            <div className="auth-mobile-brand">
              <div className="auth-brand-icon">
                <span>PF</span>
              </div>
              <span>People<span className="brand-accent">Flow</span></span>
            </div>

            <div className="auth-status">
              <span className="status-dot" />
              Secure workspace
            </div>
          </div>

          <div className="auth-heading">
            <div className="auth-heading-icon">
              {isRegister ? "✦" : "↗"}
            </div>

            <h2>
              {isRegister ? "Create your account" : "Welcome back"}
            </h2>

            <p>
              {isRegister
                ? "Join your team workspace to get started."
                : "Sign in to continue to your workspace."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="auth-field">
                <label htmlFor="auth-name">Full name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                    </svg>
                  </span>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </span>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                    />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <path d="M12 14v3" />
                  </svg>
                </span>

                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isRegister
                      ? "At least 8 characters"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`auth-message ${messageType}`}
                role={messageType === "error" ? "alert" : "status"}
              >
                <span aria-hidden="true">
                  {messageType === "success" ? "✓" : "!"}
                </span>
                <p>{message}</p>
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Please wait..."
                  : isRegister
                    ? "Create account"
                    : "Sign in to workspace"}
              </span>
              {!loading && <span className="auth-submit-arrow">→</span>}
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <p>{isRegister ? "ALREADY HAVE AN ACCOUNT?" : "NEW TO PEOPLEFLOW?"}</p>
            <span />
          </div>

          <button
            type="button"
            className="auth-switch"
            onClick={toggleMode}
          >
            {isRegister
              ? "Sign in instead"
              : "Create an account"}
            <span>→</span>
          </button>

          <p className="auth-privacy">
            <span aria-hidden="true">▣</span>
            Your workspace is protected by secure authentication.
          </p>
        </section>
      </section>

      <footer className="auth-page-footer">
        <span>PEOPLEFLOW</span>
        <span>EMPLOYEE MANAGEMENT SYSTEM</span>
      </footer>
    </main>
  );
}
