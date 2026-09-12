"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0000" }}>
        <div
          style={{
            padding: "2rem",
            background: "#1a0a0a",
            color: "#ffaaaa",
            fontFamily: "monospace",
            minHeight: "100vh",
          }}
        >
          <h1 style={{ color: "#ff5555" }}>
            🚨 Global App Error (Digest: {error.digest ?? "none"})
          </h1>
          <p style={{ color: "#ffcccc", marginBottom: "1rem" }}>
            A critical error occurred. Please copy and send this to your developer:
          </p>
          <pre
            style={{
              background: "#0d0000",
              padding: "1rem",
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              border: "1px solid #ff3333",
              fontSize: "0.8rem",
            }}
          >
            {`Message: ${error.message || "Unknown error"}\n\nStack:\n${error.stack || "No stack trace"}`}
          </pre>
          <button
            onClick={reset}
            style={{
              marginTop: "1rem",
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
      </body>
    </html>
  );
}
