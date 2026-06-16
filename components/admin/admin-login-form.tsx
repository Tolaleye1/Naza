"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Incorrect password");
      } else {
        router.refresh();
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass" style={{ width: "100%", maxWidth: "380px", padding: "40px 32px" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        <h2 style={{
          fontFamily: "var(--ff-display)",
          fontSize: "2.2rem",
          color: "var(--rose)",
          textAlign: "center",
          marginBottom: "32px",
          fontWeight: 300,
          letterSpacing: "0.05em"
        }}>
          Admin
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            htmlFor="admin-password"
            style={{
              fontFamily: "var(--ff-body)",
              fontSize: "0.85rem",
              fontWeight: 300,
              color: "var(--text-muted)"
            }}
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            style={{
              width: "100%",
              border: "none",
              borderBottom: "2px solid rgba(232, 105, 138, 0.2)",
              backgroundColor: "transparent",
              padding: "8px 0",
              fontFamily: "var(--ff-body)",
              fontSize: "1rem",
              color: "var(--cream)",
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => e.target.style.borderBottomColor = "var(--rose)"}
            onBlur={(e) => e.target.style.borderBottomColor = "rgba(232, 105, 138, 0.2)"}
          />
        </div>

        {errorMsg && (
          <p style={{
            fontFamily: "var(--ff-body)",
            fontSize: "0.85rem",
            color: "var(--rose-light)",
            marginTop: "16px",
            textAlign: "center"
          }}>
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "32px",
            backgroundColor: "var(--rose)",
            color: "var(--dark-wine)",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontFamily: "var(--ff-body)",
            fontSize: "0.95rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.3s",
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--rose-light)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--rose)"}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
