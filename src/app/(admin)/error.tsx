"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        padding: "2rem",
        background: "#1a0a0a",
        color: "#ffaaaa",
        fontFamily: "monospace",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#ff5555", marginBottom: "1rem" }}>
        🚨 Dashboard Error (Digest: {error.digest})
      </h1>
      <p style={{ marginBottom: "1rem", color: "#ffcccc" }}>
        An error occurred while loading the dashboard. Full error details:
      </p>
      <pre
        style={{
          background: "#0d0000",
          padding: "1rem",
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          border: "1px solid #ff3333",
          marginBottom: "1rem",
        }}
      >
        {error.message || "Unknown error"}
        {"\n\nStack:\n"}
        {error.stack || "No stack trace"}
      </pre>
      <button
        onClick={reset}
        style={{
          background: "#ff3333",
          color: "white",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
